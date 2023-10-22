// <reference path="./data-json.d.ts" />
import postcss from 'postcss'
import { parse, type CssInJs } from 'postcss-js'

import camelCase from 'camelcase'
import colorFunctions from 'daisyui/src/theming/functions'
import colors from 'daisyui/src/theming/index'
import themes from 'daisyui/src/theming/themes'
import { StaticRule, type Preflight, type Preset } from 'unocss'

import { variantInherit, variantScoped } from './generate/variants'

import { mergeMaps } from './generate/helpers'
import { GeneratedShortcutsEntries, GeneratedShortcutsMap } from './generate/types'
import {
  generatedShortcutsMapToStaticShortcuts,
  replaceSimpleVar,
  varsLookup,
} from './generate/utils'
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

const processor = postcss()
const process = (object: CssInJs) =>
  processor.process(object, { parser: parse })

const replaceSpace = (css: string) =>
  // HSL
  // 123 4% 5% -> 123, 4%, 5%
  css.replace(/([\d.]+) ([\d%.]+) ([\d%.]+)/g, '$1, $2, $3')

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

  colorFunctions.injectThemes(
    (theme) => {
      preflights.push({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        getCSS: () => {
          const rootNode = process(theme).root

          rootNode.walkDecls((decl) => {
            decl.prop = varsLookup[decl.prop] ?? decl.prop
          })

          return replaceSpace(rootNode.toString())
        },
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

  const shortcuts = generatedShortcutsMapToStaticShortcuts(styles, {
    uniques: true,
    defaultMeta: { layer: 'daisy-3-components' },
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
            .map(([color, value]) => [
              camelCase(color),
              replaceSimpleVar(value, varsLookup),
            ])
        ),
        base: Object.fromEntries(
          Object.entries(colors)
            .filter(([color]) => color.startsWith('base'))
            .map(([color, value]) => [color.replace('base-', ''), replaceSimpleVar(value, varsLookup)])
        ),
      },
    },
    rules,
    shortcuts,
    variants: [variantInherit, variantScoped],
  }
}
