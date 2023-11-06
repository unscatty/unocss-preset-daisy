import { themeOrder as daisyDefaultThemesOrder } from 'daisy-untailwind'
import { Shortcut, StaticRule, type Preflight, type Preset } from 'unocss'
import { defaultDaisyThemes, getDefaultThemes } from './default-themes'
import { mergeMaps } from './generate/helpers'
import {
  variantInherit,
  variantScoped,
  variantTheme,
  variantWeakInherit,
} from './generate/variants'
import { presetTheme } from './presets/theme'

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
import { DaisyExtendTheme, DaisyPresetOptions, DaisySelectors } from './types'
import {
  defaultSelectorFn,
  getSelectors,
  processThemes,
  scopeThemeShortcuts,
} from './utils/preset'

const defaultColorSchemeOption = {
  dark: 'dark',
}

const defaultOptions: DaisyPresetOptions = {
  styled: true,
  themes: getDefaultThemes(['light', 'dark']),
  base: true,
  utils: true,
  rtl: false,
  selectors: defaultSelectorFn,
  useColorScheme: defaultColorSchemeOption,
  rootTheme: 'light',
}

export const presetDaisy = <Theme extends object = object>(
  options: DaisyPresetOptions<Theme> = {}
): Preset<DaisyExtendTheme<Theme>> => {
  options = { ...defaultOptions, ...options }

  // Resolve themes
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

  // Resolve selectors
  const themeSelectors =
    typeof options.selectors === 'function'
      ? getSelectors(Object.keys(processedThemes), options.selectors)
      : options.selectors ?? {}

  const presetThemeConfig = presetTheme<DaisyExtendTheme<Theme>>({
    themes: structuredClone(processedThemes),
    selectors: themeSelectors,
    prefix: '--daisy',
    layer: 'daisy-1-2-themes',
    themeOrder: daisyDefaultThemesOrder,
    useColorScheme: options.useColorScheme,
    rootTheme: options.rootTheme,
  })

  const selectorsWithRoot: DaisySelectors =
    presetThemeConfig.options?.selectors ?? themeSelectors

  // Shortcuts
  // Scoped shortcuts in themes
  // Dynamic shortcuts won't be merged with generated shortcuts, they will override them
  const [scopedStaticShortcuts, scopedDynamicShortcuts] = scopeThemeShortcuts(
    processedThemes,
    selectorsWithRoot,
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
      variantTheme(selectorsWithRoot),
    ],
  }
}

export {
  defaultDaisyThemes,
  excludeDefaultThemes,
  getDefaultThemes,
} from './default-themes'
