// <reference path="./data-json.d.ts" />
import postcss from 'postcss'
import { parse, type CssInJs } from 'postcss-js'

import {
  type Preset,
  type Preflight,
  type StaticShortcut,
  type ShortcutValue,
  StaticRule,
} from 'unocss'
import camelCase from 'camelcase'
import colors from 'daisyui/src/theming/index'
import themes from 'daisyui/src/theming/themes'
import colorFunctions from 'daisyui/src/theming/functions'
import { mergeMaps } from './generate/helpers'

import { preflights as basePreflights } from './generated/base.json'
import {
  rules as utilitiesRules,
  shortcuts as utilitiesShortcuts,
  preflights as utilitiesPreflights,
} from './generated/utilities.json'
import {
  rules as utilitiesUnstyledRules,
  shortcuts as utilitiesUnstyledShortcuts,
  preflights as utilitiesUnstyledPreflights,
} from './generated/utilities-unstyled.json'
import {
  rules as utilitiesStyledRules,
  shortcuts as utilitiesStyledShortcuts,
  preflights as utilitiesStyledPreflights,
} from './generated/utilities-styled.json'
import {
  rules as styledRules,
  shortcuts as styledShortcuts,
  preflights as styledPreflights,
} from './generated/styled.json'
import {
  rules as styledRtlRules,
  shortcuts as styledRtlShortcuts,
  preflights as styledRtlPreflights,
} from './generated/styled.rtl.json'
import {
  rules as unstyledRules,
  shortcuts as unstyledShortcuts,
  preflights as unstyledPreflights,
} from './generated/unstyled.json'
import {
  rules as unstyledRtlRules,
  shortcuts as unstyledRtlShortcuts,
  preflights as unstyledRtlPreflights,
} from './generated/unstyled.rtl.json'
import {
  mergePatchableShortcutsMaps,
  patchableShortcutsMapToStaticShortcuts,
  staticShortcutsToPatchableShortcutsMap,
} from './generate/utils'
import { PatchableShortcutsMap } from './generate/types'
// import { writeFileSync } from 'fs'

const processor = postcss()
const process = (object: CssInJs) =>
  processor.process(object, { parser: parse })

const replaceSpace = (css: string) =>
  // HSL
  // 123 4% 5% -> 123, 4%, 5%
  // eslint-disable-next-line unicorn/better-regex
  css.replace(/([\d.]+) ([\d.%]+) ([\d.%]+)/g, '$1, $2, $3')

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

export const presetDaisy = (
  options: Partial<typeof defaultOptions> = {}
): Preset => {
  options = { ...defaultOptions, ...options }

  const generatedPreflights: string[] = []

  let styles: PatchableShortcutsMap
  let rules: StaticRule[] = []

  if (options.styled) {
    if (options.rtl) {
      styles = staticShortcutsToPatchableShortcutsMap(
        styledRtlShortcuts as StaticShortcut[]
      )

      generatedPreflights.push(styledRtlPreflights)

      rules = styledRtlRules as StaticRule[]
    } else {
      styles = staticShortcutsToPatchableShortcutsMap(
        styledShortcuts as StaticShortcut[]
      )
      generatedPreflights.push(styledPreflights)

      rules = styledRules as StaticRule[]
    }
  } else {
    // eslint-disable-next-line no-lonely-if
    if (options.rtl) {
      styles = staticShortcutsToPatchableShortcutsMap(
        unstyledRtlShortcuts as StaticShortcut[]
      )
      generatedPreflights.push(unstyledRtlPreflights)

      rules = unstyledRtlRules as StaticRule[]
    } else {
      styles = staticShortcutsToPatchableShortcutsMap(
        unstyledShortcuts as StaticShortcut[]
      )
      generatedPreflights.push(unstyledPreflights)

      rules = unstyledRules as StaticRule[]
    }
  }

  // Merge utitlities
  if (options.utils) {
    styles = mergePatchableShortcutsMaps(
      [
        styles,
        staticShortcutsToPatchableShortcutsMap(
          utilitiesShortcuts as StaticShortcut[]
        ),
        staticShortcutsToPatchableShortcutsMap(
          utilitiesUnstyledShortcuts as StaticShortcut[]
        ),
        staticShortcutsToPatchableShortcutsMap(
          utilitiesStyledShortcuts as StaticShortcut[]
        ),
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
      utilitiesPreflights as string,
      utilitiesUnstyledPreflights as string,
      utilitiesStyledPreflights as string
    )
  }

  const preflights: Preflight[] = [
    {
      getCSS: () => generatedPreflights.join('\n'),
    },
  ]

  if (options.base) {
    preflights.unshift({
      getCSS: () => basePreflights as string,
      layer: 'daisy-0-base',
    })
  }

  colorFunctions.injectThemes(
    (theme) => {
      preflights.push({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        getCSS: () => replaceSpace(process(theme).css),
        layer: 'daisy-2-themes',
      })
    },
    (key) => {
      if (key === 'daisyui.themes') {
        return options.themes
      }

      if (key === 'daisyui.darkTheme') {
        return options.darkTheme
      }
    },
    themes,
    'hsl'
  )

  const shortcuts = patchableShortcutsMapToStaticShortcuts(styles, {
    uniques: true,
  })

  return {
    name: 'unocss-preset-daisy',
    preflights,
    theme: {
      colors: {
        ...Object.fromEntries(
          Object.entries(colors)
            .filter(
              ([color]) =>
                // Already in @unocss/preset-mini
                // https://github.com/unocss/unocss/blob/0f7efcba592e71d81fbb295332b27e6894a0b4fa/packages/preset-mini/src/_theme/colors.ts#L11-L12
                !['transparent', 'current'].includes(color) &&
                // Added below
                !color.startsWith('base')
            )
            .map(([color, value]) => [camelCase(color), value])
        ),
        base: Object.fromEntries(
          Object.entries(colors)
            .filter(([color]) => color.startsWith('base'))
            .map(([color, value]) => [color.replace('base-', ''), value])
        ),
      },
    },
    rules,
    shortcuts,
  }
}
