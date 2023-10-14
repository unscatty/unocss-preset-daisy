/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ClassToken, tokenize as tokenizeSelector } from 'parsel-js'
import postcss from 'postcss'
// @ts-ignore
import tailwindNesting from '@tailwindcss/nesting'
import { parse, type CssInJs } from 'postcss-js'
import { Arrayable, CSSEntries, StaticRule as UnoStaticRule } from 'unocss'
import {
  DynamicShortcutInfo,
  ShortcutInfo,
  ShortcutWrapper,
  StaticShortcutInfo,
} from './types'
import { normalizeSelector, replaceSubByIndexes } from './utils'

export const mergeMaps = (
  maps: Map<string, ShortcutWrapper>[],
  uniques = false
) => {
  if (maps.length === 0) {
    return new Map<string, ShortcutWrapper>()
  }

  const mergedMap = new Map(structuredClone(maps[0]))

  for (const map of maps.slice(1)) {
    for (const [key, value] of map) {
      if (mergedMap.has(key)) {
        const exisitingValue = mergedMap.get(key)!

        mergedMap.set(key, {
          isDynamic: exisitingValue.isDynamic || value.isDynamic,
          shortcuts: [...exisitingValue.shortcuts, ...value.shortcuts],
          meta:
            value.meta || exisitingValue.meta
              ? { ...exisitingValue.meta, ...value.meta }
              : undefined,
        })
      } else {
        mergedMap.set(key, value)
      }
    }
  }

  // TODO: remove duplicate shortcut values
  // if (uniques) {
  //   for (const [key, value] of mergedMap) {
  //     mergedMap.set(key, [...new Set(value)])
  //   }
  // }

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

// TODO: get class names from class tokens
// TODO: check if selector is complex (has a present comma or combinator token)
export const getAllClassTokens = (
  cssSelector: string
): [
  classNames: string[],
  isSingleClass: boolean,
  classTokens: ClassToken[],
] => {
  const selectorTokenized = tokenizeSelector(cssSelector)

  if (!selectorTokenized) {
    return [[], false, []]
  }

  // If first token is class and is the only token, return it
  if (
    selectorTokenized.length === 1 &&
    selectorTokenized[0]?.type === 'class'
  ) {
    return [[selectorTokenized[0]!.name], true, [selectorTokenized[0]!]]
  }

  const classNames: string[] = []
  const classTokens: ClassToken[] = []

  // Traverse the parsed selector tree to find all class tokens
  for (const token of selectorTokenized) {
    if (token.type === 'class') {
      classNames.push(token.name)
      classTokens.push(token)
    }

    if (token.type === 'pseudo-class' && token.argument) {
      // If the pseudo class has an argument, it is a function-like pseudo class
      // like :is(), :has(), :not() etc. and we should traverse its children
      // to find the nested class tokens
      const [nestedClassNames, , nestedClassTokens] = getAllClassTokens(
        token.argument
      )

      // If a class token was found in nested pseudo class, return it
      if (nestedClassNames.length > 0) {
        classNames.push(...nestedClassNames)
        classTokens.push(
          ...nestedClassTokens.map((nestedClassToken) => ({
            ...nestedClassToken,
            pos: [
              nestedClassToken.pos[0] + token.pos[0] + token.name.length + 2,
              nestedClassToken.pos[1] + token.pos[0] + token.name.length + 2,
            ] as [number, number],
          }))
        )
      }
    }
  }

  return [[...new Set(classNames)], false, classTokens]
}

const mergeIntoMap = (
  map: Map<string, ShortcutWrapper>,
  entry: { key: string; value: Arrayable<ShortcutInfo> }
) => {
  if (map.has(entry.key)) {
    const existingValue = map.get(entry.key)!

    const isDynamic =
      existingValue.isDynamic ||
      (Array.isArray(entry.value)
        ? entry.value.some((value) => value.isDynamic)
        : entry.value.isDynamic)

    map.set(entry.key, {
      ...existingValue,
      isDynamic,
      shortcuts: [
        ...existingValue.shortcuts,
        ...(Array.isArray(entry.value) ? entry.value : [entry.value]),
      ],
    })
  } else if (Array.isArray(entry.value)) {
    const isDynamic = entry.value.some((value) => value.isDynamic)

    map.set(entry.key, {
      isDynamic,
      shortcuts: entry.value,
    })
  } else {
    map.set(entry.key, {
      isDynamic: entry.value.isDynamic,
      shortcuts: [entry.value],
    })
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

// // TODO: if selector, create a new rule
// // TODO: mark shortcut as dynamic if more than one class token is found
// // TODO: mark generated rules as internal
// FIXME: check for ghost rules (glass, btn glass and btn-active)
export const generateShortcuts = (
  css: postcss.ChildNode[],
  prefix = ''
): {
  rules: UnoStaticRule[]
  shortcuts: Map<string, ShortcutWrapper>
  toPreflights: (postcss.Rule | postcss.Declaration)[]
} => {
  let generatedShortcuts = new Map<string, ShortcutWrapper>()

  // Rules generated from raw CSS declarations
  const generatedRules: UnoStaticRule[] = []

  const toPreflights: (postcss.Rule | postcss.Declaration)[] = []

  for (const node of css) {
    if (node.type === 'atrule' && node.name === 'media') {
      const { shortcuts: nestedShortcuts, toPreflights: nestedPreflights } =
        generateShortcuts(
          node.nodes,
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
      const [classNames, isSingleClass, classTokens] =
        getAllClassTokens(ruleSelector)

      // Shortcut generation
      // TODO: if prefix is empty, use CSS object approach
      for (const child of node.nodes) {
        if (child.type === 'atrule' && child.name === 'apply') {
          // Add rule to generated rules if there are declarations
          if (currentRuleEntries.length > 0) {
            const ruleName = `rule-${classNames[0]!}-${makeid(8)}`

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
          currentRuleEntries.push([child.prop, child.value])
        }
      }

      // Add rule to generated rules if there are declarations left
      if (currentRuleEntries.length > 0) {
        const ruleName = `rule-${classNames[0]!}-${makeid(8)}`

        generatedRules.push([
          ruleName,
          currentRuleEntries,
          { internal: true },
        ])
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

        // Is an static shortcut
        mergeIntoMap(generatedShortcuts, {
          key: classToken,
          value: {
            isDynamic: false,
            values: shortcutValues.map((value) => `${prefix}${value}`),
          } as StaticShortcutInfo,
        })
      } else {
        // For every class token, add it to the shortcuts map
        // Add selector prefix
        for (const className of classNames) {
          const selectorWithNest = normalizeSelector(
            replaceSubByIndexes(
              ruleSelector,
              classTokens
                .filter((token) => token.name === className)
                .map((token) => ['&', token.pos[0], token.pos[1]])
            )
          )

          mergeIntoMap(generatedShortcuts, {
            key: className,
            value: {
              isDynamic: true,
              rawSelector: ruleSelector,
              normalizedSelector: normalizeSelector(ruleSelector),
              selectorWithNest,
              media: prefix,
              values: shortcutValues,
            } as DynamicShortcutInfo,
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

export const replacePrefix = (css: string) => css.replace(/--tw-/g, '--un-')
// UnoCSS uses comma syntax
// var(--foo) / 0.1 -> var(--foo), 0.1
export const replaceSlash = (css: string) => css.replaceAll(') / ', '), ')

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

  return { rules, shortcuts, preflights }
}
