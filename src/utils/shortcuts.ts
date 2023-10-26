import {
  CSSEntries,
  DynamicShortcut,
  DynamicShortcutMatcher,
  Rule,
  RuleMeta,
  ShortcutValue,
  StaticRule,
  StaticShortcut,
  UserShortcuts,
  expandVariantGroup,
  isStaticShortcut,
  normalizeCSSEntries,
  resolveShortcuts,
  toArray,
} from 'unocss'
import { GeneratedShortcutsMap } from '../generate/types'
import { makeid } from '../generate/utils'

export type StaticShortcutStrings =
  | [string, string[]]
  | [string, string[], RuleMeta]

type DynamicShortcutMatcherStrings = (
  ...args: Parameters<DynamicShortcutMatcher>
) => string[] | undefined

export type DynamicShortcutStrings =
  | [RegExp, DynamicShortcutMatcherStrings]
  | [RegExp, DynamicShortcutMatcherStrings, RuleMeta]

export type ShortcutStrings = StaticShortcutStrings | DynamicShortcutStrings

export const scopeShortcuts = (
  shortcuts: UserShortcuts,
  selectors: string | string[],
  rules: Rule[]
): [StaticShortcutStrings[], DynamicShortcutStrings[]] => {
  const scopedStaticShortcuts: StaticShortcutStrings[] = []
  const scopedDynamicShortcuts: DynamicShortcutStrings[] = []

  for (const shortcut of resolveShortcuts(shortcuts)) {
    if (isStaticShortcut(shortcut)) {
      const [scopedShortcut, scopedShortcutRule] = scopeStaticShortcut(
        shortcut,
        selectors
      )

      scopedStaticShortcuts.push(scopedShortcut)

      if (scopedShortcutRule) {
        rules.push(scopedShortcutRule)
      }
    } else {
      scopedDynamicShortcuts.push(
        scopeDynamicShortcut(shortcut, selectors, rules)
      )
    }
  }

  return [scopedStaticShortcuts, scopedDynamicShortcuts]
}

export function scopeDynamicShortcut(
  shortcut: DynamicShortcut,
  selectors: string | string[],
  rules: Rule[]
): DynamicShortcutStrings {
  const [regexp, dynamicMatcher, meta] = shortcut

  const scopedDynamicMatcher: DynamicShortcutMatcherStrings = (
    match,
    context
  ) => {
    const values = dynamicMatcher(match, context)

    if (!values) {
      return undefined
    }

    const [scopedShortcutValues, scopedRule] = scopeShortcutValues(
      values,
      selectors
    )

    if (scopedRule) {
      rules.push(scopedRule)
    }

    return scopedShortcutValues
  }

  let scopedShortcut: DynamicShortcutStrings = [regexp, scopedDynamicMatcher]

  if (meta) {
    scopedShortcut = [scopedShortcut[0], scopedShortcut[1], meta]
  }

  return scopedShortcut
}

export function scopeStaticShortcut(
  shortcut: StaticShortcut,
  selectors: string | string[]
): [StaticShortcutStrings, Rule | undefined] {
  const [name, values, meta] = shortcut

  const [scopedShortcutValues, scopedShortcutRule] = scopeShortcutValues(
    values,
    selectors
  )

  let scopedShortcut: StaticShortcutStrings = [name, scopedShortcutValues]

  if (meta) {
    scopedShortcut = [name, scopedShortcut[1], meta]
  }

  return [scopedShortcut, scopedShortcutRule]
}

export function scopeShortcutValues(
  shortcutValues: string | ShortcutValue[],
  selectors: string | string[]
): [string[], StaticRule | undefined] {
  const scopedShortcutValues: string[] = []
  let scopedShortcutRule: StaticRule | undefined

  if (typeof shortcutValues === 'string') {
    const scopedStringShortcut = scopeStringShortcutValue(
      shortcutValues,
      selectors
    )

    scopedShortcutValues.push(...scopedStringShortcut)
  } else {
    const scopedRuleValues: CSSEntries = []

    for (const value of shortcutValues) {
      const normalizedValue = normalizeCSSEntries(value)

      if (typeof normalizedValue === 'string') {
        // Scope string value
        const scopedStringShortcut = scopeStringShortcutValue(
          normalizedValue,
          selectors
        )

        scopedShortcutValues.push(...scopedStringShortcut)
      } else {
        // Create new rule with original values
        scopedRuleValues.push(...normalizedValue)
      }
    }

    // If any rule values, create new rule
    if (scopedRuleValues.length > 0) {
      const newRuleName = `scoped-rule-${makeid(8)}`

      scopedShortcutRule = [
        newRuleName,
        scopedRuleValues,
        { internal: true, noMerge: false },
      ]

      // Add rule to shortcut values
      scopedShortcutValues.push(
        ...scopeStringShortcutValue(newRuleName, selectors)
      )
    }
  }

  return [scopedShortcutValues, scopedShortcutRule]
}

function scopeStringShortcutValue(
  shortcut: string,
  selectors: string | string[],
  separator = ':'
): string[] {
  const whitespaceRegex = /\s+/g
  const shortcutValues = expandVariantGroup(shortcut.trim()).split(
    whitespaceRegex
  )

  const scopedShortcuts = toArray(selectors).flatMap((selector) => {
    const scopedPrefix = `scoped-[${selector}]${separator}`

    return shortcutValues.map((value) => {
      return `${scopedPrefix}${value}`
    })
  })

  return scopedShortcuts
}

export const scopedStaticShortcutsToMap = (
  staticShortcuts: StaticShortcutStrings[],
  defaultMeta?: RuleMeta
): GeneratedShortcutsMap => {
  const staticShortcutsMap: GeneratedShortcutsMap = new Map()

  for (const [name, values, meta] of staticShortcuts) {
    if (defaultMeta || meta) {
      staticShortcutsMap.set(name, {
        values,
        meta: { ...defaultMeta, ...meta },
      })
    } else {
      staticShortcutsMap.set(name, { values })
    }
  }

  return staticShortcutsMap
}

export const prefixShortcutsString = (
  shortcuts: string,
  prefix: string
): string[] => {
  return shortcuts.split(/\s+/).map((shortcut) => {
    return `${prefix}${shortcut}`
  })
}
