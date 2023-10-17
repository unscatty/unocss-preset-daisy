/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { tokenize as tokenizeSelector } from 'parsel-js'
import postcss from 'postcss'
// @ts-ignore
import tailwindNesting from '@tailwindcss/nesting'
import { parse, type CssInJs } from 'postcss-js'
import { parse as parseCSSValue } from 'postcss-values-parser'
import { CSSEntries, RuleMeta, StaticRule as UnoStaticRule } from 'unocss'
import { GeneratedShortcutsMap } from './types'

export const mergeMaps = (
  maps: GeneratedShortcutsMap[],
  uniques = false
): GeneratedShortcutsMap => {
  if (maps.length === 0) {
    return new Map()
  }

  const mergedMap = new Map(structuredClone(maps[0]))

  for (const map of maps.slice(1)) {
    for (const [
      shortcutName,
      { values: shortcutValues, meta: shortcutMeta },
    ] of map) {
      if (mergedMap.has(shortcutName)) {
        const existingValue = mergedMap.get(shortcutName)!

        const newShortcutValues = [...existingValue.values, ...shortcutValues]

        mergedMap.set(shortcutName, {
          values: newShortcutValues,
          meta: { ...existingValue.meta, ...shortcutMeta },
        })
      } else {
        mergedMap.set(shortcutName, {
          values: shortcutValues,
          meta: shortcutMeta,
        })
      }
    }
  }

  if (uniques) {
    // Remove duplicate shortcut values
    for (const [shortcutName, { values, meta }] of mergedMap) {
      mergedMap.set(shortcutName, { values: [...new Set(values)], meta })
    }
  }

  return mergedMap
}

const processor = postcss(tailwindNesting)
const process = (object: CssInJs) =>
  processor.process(object, { parser: parse })

export const extractAndRemoveKeyframes = (css: CssInJs) => {
  const keyframes: postcss.AtRule[] = []
  const ast = process(css).root

  ast.walkAtRules('keyframes', (rule) => {
    keyframes.push(rule)
    rule.remove()
  })

  return { keyframes, updatedNodes: ast }
}

export const getAllClassTokens = (
  cssSelector: string
): [classTokens: string[], isSingleClass: boolean] => {
  const selectorTokenized = tokenizeSelector(cssSelector)

  if (!selectorTokenized) {
    return [[], false]
  }

  // If first token is class and is the only token, return it
  if (
    selectorTokenized.length === 1 &&
    selectorTokenized[0]?.type === 'class'
  ) {
    return [[selectorTokenized[0]!.name], true]
  }

  const result: string[] = []

  // Traverse the parsed selector tree to find all class tokens
  for (const token of selectorTokenized) {
    if (token.type === 'class') {
      result.push(token.name)
    }

    if (token.type === 'pseudo-class' && token.argument) {
      // If the pseudo class has an argument, it is a function-like pseudo class
      // like :is(), :has(), :not() etc. and we should traverse its children
      // to find the nested class tokens
      const [nestedResult] = getAllClassTokens(token.argument)

      // If a class token was found in nested pseudo class, return it
      if (nestedResult.length > 0) {
        result.push(...nestedResult)
      }
    }
  }

  return [[...new Set(result)], false]
}

const mergeIntoMap = (
  map: GeneratedShortcutsMap,
  entry: { shortcutName: string; shortcutValues: string[]; meta?: RuleMeta }
) => {
  const {
    shortcutValues: newShortcutValues,
    meta: newMeta,
    shortcutName,
  } = entry

  if (map.has(shortcutName)) {
    const existingValue = map.get(shortcutName)!

    const newShortcuts = [...existingValue.values, ...newShortcutValues]

    map.set(shortcutName, {
      values: newShortcuts,
      meta: { ...existingValue.meta, ...newMeta },
    })
  } else {
    map.set(shortcutName, { values: newShortcutValues, meta: newMeta })
  }
}

const makeid = (length: number) => {
  let result = ''
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length

  for (let counter = 0; counter < length; counter++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }

  return result
}

// TODO: remove vars from preflights
// TODO: handle keyframes
// TODO: replace selector with inherit, also replace all ocurrences of shortcut in the selector
export const generateShortcuts = (
  css: postcss.ChildNode[],
  prefix = ''
): {
  rules: UnoStaticRule[]
  shortcuts: GeneratedShortcutsMap
  toPreflights: (postcss.Rule | postcss.Declaration)[]
} => {
  // TODO: if prefix is empty, use CSS object approach

  let generatedShortcuts: GeneratedShortcutsMap = new Map()

  // Rules generated from raw CSS declarations
  const generatedRules: UnoStaticRule[] = []

  const toPreflights: (postcss.Rule | postcss.Declaration)[] = []

  for (const node of css) {
    if (node.type === 'atrule' && node.name === 'media') {
      const { shortcuts: nestedShortcuts, toPreflights: nestedPreflights } =
        generateShortcuts(
          node.nodes,
          `media-[${node.params.replace(/ /g, '_')}]:`
        )

      generatedShortcuts = mergeMaps([generatedShortcuts, nestedShortcuts])
      toPreflights.push(...nestedPreflights)

      continue
    }

    if (node.type === 'rule') {
      const toPreflightVars: postcss.Declaration[] = []
      const shortcutValues: string[] = []

      let currentGeneratedRule: CSSEntries = []

      const ruleSelector = node.selector
      const [classTokens, isSingleClass] = getAllClassTokens(ruleSelector)

      // Shortcut generation
      for (const child of node.nodes) {
        if (child.type === 'atrule' && child.name === 'apply') {
          // Add rule to generated rules if there are declarations
          if (currentGeneratedRule.length > 0) {
            const ruleName = `rule-${classTokens[0]!}-${makeid(8)}`

            generatedRules.push([ruleName, currentGeneratedRule])
            currentGeneratedRule = []

            // Add rule to shortcut values
            shortcutValues.push(ruleName)
          }

          // If @apply directive, add it to the shortcut values
          shortcutValues.push(...child.params.split(' '))

          continue
        }

        if (child.type === 'decl') {
          const value = child.value
          const parsedCSSValue = parseCSSValue(value).first!

          // URL function
          if (parsedCSSValue.type === 'func' && parsedCSSValue.name === 'url') {
            // Get function arguments
            toPreflightVars.push(child)

            continue
          }

          // content: ""
          if (child.prop === 'content' && value === '""') {
            shortcutValues.push(`content-[""]`)

            continue
          }

          // FIXME: if styles are still broken, use only rule aproximation
          // If selector is single class, add the value as a static CSS Object
          // if (isSingleClass) {
          //   shortcutValues.push([[child.prop, value]])
          // } else {
          // Add CSS declaration to the generated rule CSS declarations
          currentGeneratedRule.push([child.prop, value])
          // }

          // // Add the value as a variable variant
          // shortcutValues.push(`[${child.prop}:${value.replace(/\s+/g, '_')}]`)
        }
      }

      // Add rule to generated rules if there are declarations left
      if (currentGeneratedRule.length > 0) {
        const ruleName = `rule-${classTokens[0]!}-${makeid(8)}`

        generatedRules.push([ruleName, currentGeneratedRule])
        currentGeneratedRule = []

        // Add rule to shortcut values
        shortcutValues.push(ruleName)
      }

      // Selector generation
      if (classTokens.length === 0) {
        // If there are no class tokens, add it to the preflights list
        toPreflights.push(node)
      } else if (classTokens.length === 1 && isSingleClass) {
        // If there is only one class token, it is the base class
        const classToken = classTokens[0]!

        mergeIntoMap(generatedShortcuts, {
          shortcutName: classToken,
          shortcutValues: shortcutValues.map((value) => `${prefix}${value}`),
        })

        for (const node of toPreflightVars) {
          const preflightVar = `--${classToken}-${makeid(8)}`

          const originalProp = node.prop
          node.prop = preflightVar

          toPreflights.push(node)

          mergeIntoMap(generatedShortcuts, {
            shortcutName: classToken,
            shortcutValues: [`${prefix}[${originalProp}:var(${preflightVar})]`],
          })
        }
      } else {
        // For every class token, add it to the shortcuts map
        // Add selector prefix
        for (const classToken of classTokens) {
          mergeIntoMap(generatedShortcuts, {
            shortcutName: classToken,
            shortcutValues: shortcutValues.map(
              (value) =>
                `${prefix}selector-[${ruleSelector.replace(
                  /\s+/g,
                  '_'
                )}]:${value}`
            ),
          })

          for (const node of toPreflightVars) {
            const preflightVar = `--${classToken}-${makeid(8)}`

            const clonedNode = node.clone()

            const originalProp = clonedNode.prop
            clonedNode.prop = preflightVar

            toPreflights.push(clonedNode)

            mergeIntoMap(generatedShortcuts, {
              shortcutName: classToken,
              shortcutValues: [
                `${prefix}selector-[${ruleSelector.replace(
                  /\s+/g,
                  '_'
                )}]:[${originalProp}:var(${preflightVar})]`,
              ],
            })
          }
        }
      }
    }
  }

  return {
    rules: generatedRules,
    shortcuts: generatedShortcuts,
    toPreflights,
  }
}

export const replacePrefix = (css: string) => css.replace(/--tw-/g, '--un-')

export const generateShortcutsRulesAndPreflights = (css: CssInJs) => {
  const { updatedNodes: nodesWithoutKeyframes, keyframes } =
    extractAndRemoveKeyframes(css)

  const { rules, shortcuts, toPreflights } = generateShortcuts(
    nodesWithoutKeyframes.nodes as postcss.ChildNode[]
  )

  const preflightsRules: postcss.ChildNode[] = []

  const preflightsRootNode = postcss.rule({
    selector: ':root',
  })

  for (const node of toPreflights) {
    if (node.type === 'decl') {
      preflightsRootNode.append(node)
    } else {
      preflightsRules.push(node)
    }
  }

  const preflights = postcss.root({
    nodes: [...preflightsRules, ...keyframes],
  })

  if (preflightsRootNode.nodes.length > 0) {
    preflights.prepend(preflightsRootNode)
  }

  return { rules, shortcuts, preflights } as const
}
