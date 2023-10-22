// <reference path="./data-json.d.ts" />
import { StaticRule, type Preflight, type Preset } from 'unocss'
import { presetTheme } from 'unocss-preset-theme'
import { defaultThemes } from './default-themes'
import { mergeMaps } from './generate/helpers'
import { variantInherit, variantScoped } from './generate/variants'

import {
  GeneratedShortcutsEntries,
  GeneratedShortcutsMap,
} from './generate/types'
import { generatedShortcutsMapToStaticShortcuts } from './generate/utils'
import { preflights as basePreflights } from './generated/base.json'
import {
  preflights as styledPreflights,
  rules as styledRules,
  shortcuts as styledShortcuts,
} from './generated/styled.json'
import {
  preflights as styledRtlPreflights,
  rules as styledRtlRules,
  shortcuts as styledRtlShortcuts,
} from './generated/styled.rtl.json'
import {
  preflights as unstyledPreflights,
  rules as unstyledRules,
  shortcuts as unstyledShortcuts,
} from './generated/unstyled.json'
import {
  preflights as unstyledRtlPreflights,
  rules as unstyledRtlRules,
  shortcuts as unstyledRtlShortcuts,
} from './generated/unstyled.rtl.json'
import {
  preflights as utilitiesStyledPreflights,
  rules as utilitiesStyledRules,
  shortcuts as utilitiesStyledShortcuts,
} from './generated/utilities-styled.json'
import {
  preflights as utilitiesUnstyledPreflights,
  rules as utilitiesUnstyledRules,
  shortcuts as utilitiesUnstyledShortcuts,
} from './generated/utilities-unstyled.json'
import {
  preflights as utilitiesPreflights,
  rules as utilitiesRules,
  shortcuts as utilitiesShortcuts,
} from './generated/utilities.json'
import { getSelectors } from './utils/preset'
import { kebabCase } from './utils/case'
import { DaisyExtendTheme } from './types'

const defaultOptions = {
  styled: true,
  themes: false as
    | boolean
    | Array<string | Record<string, Record<string, string>>>,
  base: true,
  utils: true,
  rtl: false,
  darkTheme: 'dark',
}

export const presetDaisy = <Theme extends object = object>(
  options: Partial<typeof defaultOptions> = {}
): Preset => {
  options = { ...defaultOptions, ...options }

  const generatedPreflights: string[] = []

  let styles: GeneratedShortcutsEntries | GeneratedShortcutsMap = new Map()
  let rules: StaticRule[] = []

  if (options.styled) {
    if (options.rtl) {
      styles = styledRtlShortcuts as GeneratedShortcutsEntries

      generatedPreflights.push(styledRtlPreflights)

      rules = styledRtlRules as StaticRule[]
    } else {
      styles = styledShortcuts as GeneratedShortcutsEntries
      generatedPreflights.push(styledPreflights)

      rules = styledRules as StaticRule[]
    }
  } else {
    // eslint-disable-next-line no-lonely-if
    if (options.rtl) {
      styles = unstyledRtlShortcuts as GeneratedShortcutsEntries
      generatedPreflights.push(unstyledRtlPreflights)

      rules = unstyledRtlRules as StaticRule[]
    } else {
      styles = unstyledShortcuts as GeneratedShortcutsEntries
      generatedPreflights.push(unstyledPreflights)

      rules = unstyledRules as StaticRule[]
    }
  }

  // Merge utitlities
  if (options.utils) {
    styles = mergeMaps(
      [
        styles,
        utilitiesShortcuts as GeneratedShortcutsEntries,
        utilitiesUnstyledShortcuts as GeneratedShortcutsEntries,
        utilitiesStyledShortcuts as GeneratedShortcutsEntries,
      ],
      true
    )

    rules = [
      ...rules,
      ...(utilitiesRules as StaticRule[]),
      ...(utilitiesUnstyledRules as StaticRule[]),
      ...(utilitiesStyledRules as StaticRule[]),
    ]

    generatedPreflights.push(
      utilitiesPreflights,
      utilitiesUnstyledPreflights,
      utilitiesStyledPreflights
    )
  }

  const preflights: Preflight[] = [
    {
      getCSS: () => generatedPreflights.join('\n'),
    },
  ]

  if (options.base) {
    preflights.unshift({
      getCSS: () => basePreflights,
      layer: 'daisy-1-base',
    })
  }

  const shortcuts = generatedShortcutsMapToStaticShortcuts(styles, {
    uniques: true,
    defaultMeta: { layer: 'daisy-3-components' },
  })

  const selectors = getSelectors(Object.keys(defaultThemes))

  const variablesPreflights: Preflight[] = []

  for (const [themeName, theme] of Object.entries(defaultThemes)) {
    if (theme.variables) {
      variablesPreflights.push({
        getCSS: () => {
          // const rootNode =C

          const selector = selectors[themeName] ?? `[data-theme="${themeName}"]`

          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const declarations = Object.entries(theme.variables!).map(
            ([key, value]) => {
              return `${kebabCase(key)}:${value}`
            }
          )

          return `${selector} { ${declarations.join(';')} }`
        },
        layer: 'daisy-1-base',
      })
    }
  }

  preflights.push(...variablesPreflights)

  const presetThemeConfig = presetTheme({
    theme: defaultThemes,
    selectors,
    prefix: '--daisy',
  })

  // const presetThemePreflights = presetThemeConfig.preflights

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  presetThemeConfig.preflights![0].layer = 'daisy-1-base'

  return {
    name: 'unocss-preset-daisy',
    preflights,
    presets: [presetThemeConfig],
    rules,
    shortcuts,
    variants: [variantInherit, variantScoped],
  }
}
