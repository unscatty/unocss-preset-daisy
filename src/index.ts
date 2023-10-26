// <reference path="./data-json.d.ts" />
import { Shortcut, StaticRule, type Preflight, type Preset } from 'unocss'
import { presetTheme } from 'unocss-preset-theme'
import { defaultDaisyThemes, getDefaultThemes } from './default-themes'
import { mergeMaps } from './generate/helpers'
import {
  variantWeakInherit,
  variantInherit,
  variantScoped,
  variantTheme,
} from './generate/variants'

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
import { DaisyExtendTheme, DaisyPresetOptions } from './types'
import {
  extractVarsPreflights,
  getSelectors,
  processThemes,
  scopeThemeShortcuts,
} from './utils/preset'

const defaultOptions: DaisyPresetOptions = {
  styled: true,
  themes: getDefaultThemes(['light', 'dark']),
  base: true,
  utils: true,
  rtl: false,
  darkTheme: 'dark',
}

// TODO: default and dark theme
export const presetDaisy = <Theme extends object = object>(
  options: DaisyPresetOptions<Theme> = {}
): Preset<DaisyExtendTheme<Theme>> => {
  options = { ...defaultOptions, ...options }

  let themes: NonNullable<DaisyPresetOptions['themes']> = {}

  if (options.themes) {
    themes = options.themes === true ? defaultDaisyThemes : options.themes
  }

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

  // TODO: Move keyframes to theme config
  const preflights: Preflight[] = [
    {
      getCSS: () => generatedPreflights.join('\n'),
      layer: 'daisy-1-4-keyframes',
    },
  ]

  if (options.base) {
    preflights.unshift({
      getCSS: () => basePreflights,
      layer: 'daisy-1-1-base',
    })
  }

  const processedThemes = processThemes(
    themes,
    defaultDaisyThemes,
    '--daisy-vars-'
  )

  const selectors = getSelectors(Object.keys(processedThemes))

  // Shortcuts
  // Scoped shortcuts in themes
  const [scopedStaticShortcuts, scopedDynamicShortcuts] = scopeThemeShortcuts(
    processedThemes,
    selectors,
    rules
  )

  // Merge scoped shortcuts with generated shortcuts
  styles = mergeMaps([styles, scopedStaticShortcuts])

  const shortcuts: Shortcut[] = generatedShortcutsMapToStaticShortcuts(styles, {
    uniques: true,
    defaultMeta: { layer: 'daisy-3-components' },
  })

  // Add dynamic shortcuts
  shortcuts.push(...scopedDynamicShortcuts)

  const variablesPreflights: Preflight[] = extractVarsPreflights(
    processedThemes,
    selectors,
    'daisy-1-3-theme-vars'
  )

  preflights.push(...variablesPreflights)

  const presetThemeConfig = presetTheme<DaisyExtendTheme<Theme>>({
    theme: processedThemes,
    selectors,
    prefix: '--daisy',
  })

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  presetThemeConfig.preflights![0].layer = 'daisy-1-2-theme-colors'

  return {
    name: 'unocss-preset-daisy',
    preflights,
    presets: [presetThemeConfig],
    rules,
    shortcuts,
    variants: [
      variantInherit,
      variantWeakInherit,
      variantScoped,
      variantTheme(selectors),
    ],
  }
}

export {
  defaultDaisyThemes,
  excludeDefaultThemes,
  getDefaultThemes,
} from './default-themes'
