/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ClassToken, tokenize as tokenizeSelector } from 'parsel-js'
import postcss from 'postcss'
// @ts-ignore
import tailwindNesting from '@tailwindcss/nesting'
import { parse, type CssInJs } from 'postcss-js'
import { CSSEntries, RuleMeta, StaticRule as UnoStaticRule } from 'unocss'
import { GeneratedShortcutsIterable, GeneratedShortcutsMap } from './types'
import {
  normalizeSelector,
  replaceSelectorWithPlaceholder,
  replaceVariables,
  makeid
} from './utils'

export const mergeMaps = (
  maps: GeneratedShortcutsIterable[],
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
): {
  classNames: string[]
  isSingleClass: boolean
  classTokens: ClassToken[]
} => {
  const selectorTokenized = tokenizeSelector(cssSelector)

  if (!selectorTokenized) {
    return { classNames: [], isSingleClass: false, classTokens: [] }
  }

  // If first token is class and is the only token, return it
  if (
    selectorTokenized.length === 1 &&
    selectorTokenized[0]?.type === 'class'
  ) {
    const classToken = selectorTokenized[0]!
    return {
      classNames: [classToken.name],
      isSingleClass: true,
      classTokens: [classToken],
    }
  }

  const classTokens: ClassToken[] = []

  // Traverse the parsed selector tree to find all class tokens
  for (const token of selectorTokenized) {
    if (token.type === 'class') {
      classTokens.push(token)
    }

    if (token.type === 'pseudo-class' && token.argument) {
      // If the pseudo class has an argument, it is a function-like pseudo class
      // like :is(), :has(), :not() etc. and we should traverse its children
      // to find the nested class tokens
      const { classTokens: nestedTokens } = getAllClassTokens(token.argument)

      // If a class token was found in nested pseudo class, add it to the result
      if (nestedTokens.length > 0) {
        classTokens.push(
          ...nestedTokens.map((nestedClassToken) => ({
            ...nestedClassToken,
            // Add the position of the nested class token relative to the pseudo selector
            pos: [
              nestedClassToken.pos[0] + token.pos[0] + token.name.length + 2,
              nestedClassToken.pos[1] + token.pos[0] + token.name.length + 2,
            ] as [number, number],
          }))
        )
      }
    }
  }

  return {
    classNames: [...new Set(classTokens.map((token) => token.name))],
    isSingleClass: false,
    classTokens,
  }
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

// TODO: handle keyframes
// TODO: check for ghost shortcuts (glass and btn-glass)
export const generateShortcuts = (
  css: postcss.ChildNode[],
  variablesLookup: Record<string, string> = {},
  previousVariant = ''
): {
  rules: UnoStaticRule[]
  shortcuts: GeneratedShortcutsMap
  toPreflights: (postcss.Rule | postcss.Declaration)[]
} => {
  let generatedShortcuts: GeneratedShortcutsMap = new Map()

  // Rules generated from raw CSS declarations
  const generatedRules: UnoStaticRule[] = []

  const toPreflights: (postcss.Rule | postcss.Declaration)[] = []

  for (const node of css) {
    if (node.type === 'atrule' && node.name === 'media') {
      const { shortcuts: nestedShortcuts, toPreflights: nestedPreflights } =
        generateShortcuts(
          node.nodes,
          variablesLookup,
          `media-[${normalizeSelector(node.params)}]:`
        )

      generatedShortcuts = mergeMaps([generatedShortcuts, nestedShortcuts])
      toPreflights.push(...nestedPreflights)

      continue
    }

    if (node.type === 'rule') {
      const shortcutValues: string[] = []

      let currentRuleEntries: CSSEntries = []

      const ruleSelector = node.selector
      const { classNames, isSingleClass, classTokens } =
        getAllClassTokens(ruleSelector)

      // Shortcut generation
      for (const child of node.nodes) {
        if (child.type === 'atrule' && child.name === 'apply') {
          // Add rule to generated rules if there are declarations
          if (currentRuleEntries.length > 0 && classNames.length > 0) {
            const ruleName = `rule-${classNames[0]}-${makeid(8)}`

            generatedRules.push([
              ruleName,
              currentRuleEntries,
              { internal: true },
            ])

            currentRuleEntries = []

            // Add rule to shortcut values
            shortcutValues.push(ruleName)
          }

          // If @apply directive, add it to the shortcut values
          shortcutValues.push(...child.params.split(' '))

          continue
        }

        if (child.type === 'decl') {
          // Add CSS declaration to the generated rule CSS declarations
          currentRuleEntries.push([
            // Replace variables
            variablesLookup[child.prop] ?? child.prop,
            replaceVariables(child.value, variablesLookup),
          ])
        }
      }

      // Add rule to generated rules if there are declarations left
      if (currentRuleEntries.length > 0 && classNames.length > 0) {
        const ruleName = `rule-${classNames[0]}-${makeid(8)}`

        generatedRules.push([ruleName, currentRuleEntries, { internal: true }])
        currentRuleEntries = []

        // Add rule to shortcut values
        shortcutValues.push(ruleName)
      }

      // Selector generation
      if (classNames.length === 0) {
        // If there are no class tokens, add it to the preflights list
        toPreflights.push(node)
      } else if (classNames.length === 1 && isSingleClass) {
        // If there is only one class token, it is the base class
        const classToken = classNames[0]!

        mergeIntoMap(generatedShortcuts, {
          shortcutName: classToken,
          shortcutValues: shortcutValues.map(
            (value) => `${previousVariant}${value}`
          ),
        })
      } else {
        // For every class token, add it to the shortcuts map
        // Add selector prefix
        for (const className of classNames) {
          const selectorWithPlaceholder = replaceSelectorWithPlaceholder(
            ruleSelector,
            className,
            classTokens
          )

          mergeIntoMap(generatedShortcuts, {
            shortcutName: className,
            shortcutValues: shortcutValues.map(
              (value) =>
                // Use inherit variant
                `${previousVariant}inherit-[${normalizeSelector(
                  selectorWithPlaceholder
                )}]:${value}`
            ),
          })
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

export const replaceTwPrefix = (css: string) => css.replace(/--tw-/g, '--un-')
// TODO: unocss supports space-separated values since v0.57
// UnoCSS uses comma syntax
// var(--foo) / 0.1 -> var(--foo), 0.1
export const replaceSlash = (css: string) => css.replaceAll(') / ', '), ')

export const generateShortcutsRulesAndPreflights = (
  css: CssInJs,
  variablesLookup: Record<string, string> = {}
) => {
  const { updatedNodes: nodesWithoutKeyframes, keyframes } =
    extractAndRemoveKeyframes(css)

  const { rules, shortcuts, toPreflights } = generateShortcuts(
    nodesWithoutKeyframes.nodes as postcss.ChildNode[],
    variablesLookup
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

  // Replace variables in preflights
  preflights.walkDecls((decl) => {
    decl.value = replaceVariables(decl.value, variablesLookup)
  })

  return { rules, shortcuts, preflights } as const
}
