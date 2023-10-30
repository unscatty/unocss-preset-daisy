/* eslint-disable unicorn/no-array-reduce */
import type { Preset } from '@unocss/core'
import { mergeDeep, toArray } from '@unocss/core'
import { parseCssColor } from '@unocss/rule-utils'
import {
  DaisyColorScheme,
  DaisySelectors,
  DaisyUseColorSchemeOption,
} from '../../types'
import { entriesIterable } from '../../utils/object'
import {
  extractKeys,
  getThemeNamesSorted,
  getThemeVal,
  objectToCss,
  wrapCSSFunction,
  wrapVar,
} from './helpers'

const PRESET_THEME_RULE = 'PRESET_THEME_RULE'

const keysToRemoveFromThemes = [
  'colorScheme',
  'variables',
  'inherit',
  'shortcuts',
]

// TODO: move this preset to its own package
export interface PresetThemeOptions<Theme extends Record<string, any>> {
  /**
   * Multiple themes
   */
  themes: Record<string, Theme>
  /**
   * The prefix of the generated css variables
   * @default --un-preset-theme
   */
  prefix?: string
  /**
   * Customize the selectors of the generated css variables
   * @default { light: ':root', [themeName]: '.[themeName]' }
   */
  selectors?: DaisySelectors
  useColorScheme?: DaisyUseColorSchemeOption
  rootTheme?: string
  layer?: string
  themeOrder?: string[]
}

export interface DaisyPresetExportOptions {
  readonly selectors?: DaisySelectors
}

/**
 * @deprecated use `PresetThemeOptions` instead
 * @see PresetThemeOptions
 */
export type PresetTheme<Theme extends Record<string, any>> =
  PresetThemeOptions<Theme>

interface ThemeValue {
  theme: Record<string, Record<string, string>>
  name: string
}

export function presetTheme<T extends Record<string, any>>(
  options: PresetThemeOptions<T>
): Preset<T> {
  const {
    prefix = '--un-preset-theme',
    themes: originalThemes,
    selectors: themeSelectors = {},
    rootTheme,
    layer,
    useColorScheme,
    themeOrder,
  } = options

  const themes = structuredClone(originalThemes)

  // Sort theme names
  const sortedThemeNames = getThemeNamesSorted(themes, themeOrder)

  // Resolve root theme
  let rootThemeName: string

  if (rootTheme && themes[rootTheme]) {
    rootThemeName = rootTheme
  } else if (themes.light) {
    rootThemeName = 'light'
  } else {
    rootThemeName = sortedThemeNames[0] ?? ''
  }

  // Resolve color scheme
  let colorScheme: DaisyColorScheme = {}

  if (useColorScheme) {
    colorScheme =
      useColorScheme === true
        ? { light: 'light', dark: 'dark' }
        : useColorScheme

    if (colorScheme.light && !themes[colorScheme.light]) {
      if (themes.light) {
        colorScheme.light = 'light'
      } else if (themes[rootThemeName]?.colorScheme === 'light') {
        colorScheme.light = rootThemeName
      } else {
        // Find theme with light color scheme
        const themeWithLightColorScheme = sortedThemeNames.find(
          (themeName) => themes[themeName].colorScheme === 'light'
        )

        // Use first theme if no theme with light color scheme is found
        colorScheme.light = themeWithLightColorScheme ?? sortedThemeNames[0]
      }
    }

    if (colorScheme.dark && !themes[colorScheme.dark]) {
      if (themes.dark) {
        colorScheme.dark = 'dark'
      } else {
        // Find theme with dark color scheme
        const themeWithDarkColorScheme = sortedThemeNames.find(
          (themeName) => themes[themeName].colorScheme === 'dark'
        )

        // Use first theme if no theme with dark color scheme is found
        colorScheme.dark =
          themeWithDarkColorScheme ?? sortedThemeNames[1] ?? sortedThemeNames[0]
      }
    }
  }

  // Override root theme if color scheme light theme is present
  if (colorScheme.light) {
    rootThemeName = ''
  }

  // Add root theme selector to selectors
  const clonedSelectors = structuredClone(themeSelectors)

  // Add root selector to root theme if set
  if (clonedSelectors[rootThemeName]) {
    clonedSelectors[rootThemeName] = [
      ':root',
      ...toArray(clonedSelectors[rootThemeName]),
    ]
  }

  // Add root theme selector to light color scheme theme if set
  if (colorScheme.light && clonedSelectors[colorScheme.light]) {
    clonedSelectors[colorScheme.light] = [
      ':root',
      ...toArray(clonedSelectors[colorScheme.light]),
    ]
  }

  // Add root theme selector to dark color scheme theme if set
  if (colorScheme.dark && clonedSelectors[colorScheme.dark]) {
    clonedSelectors[colorScheme.dark] = [
      ':root',
      ...toArray(clonedSelectors[colorScheme.dark]),
    ]
  }

  // Extract theme variables and other properties
  const extraThemeProps: Record<string, Partial<T>> = {}

  for (const [themeName, themeValues] of entriesIterable(themes)) {
    extraThemeProps[themeName] = extractKeys(
      themeValues,
      keysToRemoveFromThemes,
      true
    )
  }

  // Make selectors readonly
  const selectors: Readonly<DaisySelectors> = clonedSelectors

  const themeNames = sortedThemeNames
  const varsRE = new RegExp(`var\\((${prefix}[\\w-]*)\\)`)
  const themeValues = new Map<string, ThemeValue>()
  const usedTheme: Array<ThemeValue> = []

  const setThemeValue = <T>(options: {
    originalTheme: T
    name: string
    themeKeys: string[]
    index?: number
    isColor?: boolean
  }) => {
    const {
      name,
      themeKeys,
      originalTheme,
      index = 0,
      isColor = false,
    } = options

    themeValues.set(name, {
      theme: themeNames.reduce(
        (obj, key) => {
          let themeValue =
            getThemeVal(themes[key], themeKeys, index) ||
            (key === rootThemeName || key === colorScheme.light
              ? getThemeVal(originalTheme, themeKeys)
              : undefined)
          if (themeValue) {
            if (isColor && typeof themeValue === 'string') {
              const cssColor = parseCssColor(themeValue)
              if (cssColor?.components) {
                // uno v0.57 uses space-separated values
                themeValue = cssColor.components.join(' ')
              }
            }

            obj[key] = {
              [name]: themeValue,
            }
          }

          return obj
        },
        {} as ThemeValue['theme']
      ),
      name,
    })
  }

  return {
    name: 'unocss-preset-theme',
    extendTheme(originalTheme) {
      const recursiveTheme = (
        curTheme: Record<string, any>,
        preKeys: string[] = []
      ) => {
        for (const key of Object.keys(curTheme ?? {})) {
          const val = Reflect.get(curTheme, key)
          const themeKeys = [...preKeys, key]

          if (Array.isArray(val)) {
            for (const [index] of val.entries()) {
              const name = [prefix, ...themeKeys, index].join('-')
              setThemeValue({ originalTheme, name, themeKeys, index })
              val[index] = wrapVar(name)
            }
          } else if (typeof val === 'string') {
            const name = [prefix, ...themeKeys].join('-')
            if (themeKeys[0] === 'colors') {
              const cssColor = parseCssColor(val) || val
              if (typeof cssColor === 'string') {
                setThemeValue({
                  name,
                  themeKeys,
                  originalTheme,
                  index: 0,
                  isColor: true,
                })
                curTheme[key] = wrapVar(name)
              } else {
                setThemeValue({
                  originalTheme,
                  name,
                  themeKeys,
                  index: 0,
                  isColor: true,
                })
                curTheme[key] = wrapCSSFunction(
                  cssColor.type,
                  wrapVar(name),
                  cssColor?.alpha
                )
              }
            } else {
              setThemeValue({ originalTheme, name, themeKeys, index: 0 })
              curTheme[key] = wrapVar(name)
            }
          } else {
            recursiveTheme(val, themeKeys)
          }
        }
        return curTheme
      }

      return mergeDeep(
        originalTheme,
        recursiveTheme(
          themeNames.reduce((obj, key) => {
            return mergeDeep(obj, themes[key])
          }, {} as T)
        )
      )
    },
    rules: [
      [
        new RegExp(`^${PRESET_THEME_RULE}:(.*):`),
        (re) => {
          return usedTheme.reduce((obj, e) => {
            const key = re?.[1]
            if (!key || !e.theme[key]) {
              return obj
            }
            return {
              ...obj,
              ...e.theme[key],
            }
          }, {})
        },
        {
          internal: false,
        },
      ],
    ],
    variants: [
      {
        name: 'preset-theme-rule',
        match(matcher) {
          if (matcher.includes(PRESET_THEME_RULE)) {
            return {
              matcher,
              handle: (input, next) => {
                const themeName =
                  input.selector.match(/:([\w-]+)\\:\d+/)?.[1] ?? ''

                let parentSelector = ''

                // Handle prefers-color-scheme
                if (colorScheme.light && themeName === colorScheme.light) {
                  parentSelector = '@media (prefers-color-scheme: light)'
                } else if (colorScheme.dark && themeName === colorScheme.dark) {
                  parentSelector = '@media (prefers-color-scheme: dark)'
                }

                const selector = toArray(
                  selectors[themeName] ?? `.${themeName}`
                ).join(',')

                return next({
                  ...input,
                  selector,
                  parent: parentSelector,
                })
              },
            }
          }
        },
      },
    ],
    options: {
      selectors,
    } as DaisyPresetExportOptions,
    preflights: [
      {
        layer,
        async getCSS(context) {
          const themesTimestamps = themeNames.reduce(
            (map, themeName) => {
              // Add Date.now() to avoid cache
              map[themeName] = Date.now()
              return map
            },
            {} as Record<string, number>
          )

          const { matched: themeCSSMap } = await context.generator.generate(
            themeNames.map(
              (themeName) =>
                `${PRESET_THEME_RULE}:${themeName}:${
                  themesTimestamps[themeName] ?? Date.now()
                }`
            ),
            { preflights: false, extendedInfo: true }
          )

          // Generate CSS in order
          const themesCSSSorted: {
            selector: string
            body: string
            parent?: string
          }[] = []

          for (const themeName of sortedThemeNames) {
            const themeValues = themeCSSMap.get(
              `${PRESET_THEME_RULE}:${themeName}:${themesTimestamps[themeName]}`
            )

            const theme = themes[themeName]
            const themeExtraProps = extraThemeProps[themeName]

            if (themeValues && theme) {
              const themeCSSData = themeValues.data[0]

              const themeCSSBody = [themeCSSData[2]]

              if (
                themeExtraProps?.variables &&
                typeof themeExtraProps.variables === 'object'
              ) {
                const themeVariablesDecls: string[] = []

                for (const [prop, value] of entriesIterable(
                  themeExtraProps.variables
                )) {
                  themeVariablesDecls.push(`${prop}:${value}`)
                }

                themeCSSBody.push(themeVariablesDecls.join(';') + ';')
              }

              if (themeExtraProps?.colorScheme) {
                themeCSSBody.unshift(
                  `color-scheme:${themeExtraProps.colorScheme};`
                )
              }

              const cssObject = {
                selector: themeCSSData[1] ?? `.${themeName}`,
                body: themeCSSBody.join(''),
                parent: themeCSSData[3],
              }

              if (
                themeName === colorScheme.light ||
                themeName === colorScheme.dark ||
                themeName === rootThemeName
              ) {
                // prefers-color-scheme and root theme should be at the top
                themesCSSSorted.unshift(cssObject)
                // Add theme without parent, nor root selector to the list
                const themeSelectors = toArray(
                  selectors[themeName] ?? `.${themeName}`
                ).filter((selector) => selector !== ':root')

                if (themeName !== rootThemeName) {
                  themesCSSSorted.push({
                    ...cssObject,
                    selector: themeSelectors.join(','), // Remove :root selector
                    parent: undefined,
                  })
                }
              } else {
                themesCSSSorted.push(cssObject)
              }
            }
          }

          return themesCSSSorted
            .map((cssObject) => objectToCss(cssObject))
            .join('\n')
        },
      },
    ],
    postprocess(util) {
      for (const [, val] of util.entries) {
        if (typeof val === 'string') {
          const varName = val.match(varsRE)?.[1]
          if (varName) {
            const values = themeValues.get(varName)
            if (values) {
              usedTheme.push(values)
            }
          }
        }
      }
    },
  }
}

export default presetTheme
