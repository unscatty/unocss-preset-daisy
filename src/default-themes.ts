import colorNames from 'daisyui/src/theming/colorNames'
import colorFunctions from 'daisyui/src/theming/functions'
import daisyDefaultThemes from 'daisyui/src/theming/themes'
import { defaultVarsLookup, invertObject, replaceSpace } from './generate/utils'
import { Colors } from './types'
import { isEmptyObject } from './utils/object'

const extractThemeName = (selector: string) => {
  const selectorRegex = /\[data-theme=([^\]]+)]/
  const match = selector.match(selectorRegex)

  if (match) {
    return match[1]
  }

  return selector
}

const invertedColorNames = invertObject(colorNames)

type ConvertedThemeColors = Partial<{
  colors: Colors
  variables: Record<string, string>
  fontFamily: Record<string, string>
}>

const convertThemeColors = (
  themeColors: Record<string, Record<string, string>>
): Record<string, ConvertedThemeColors> => {
  const convertedThemeColors: Record<string, ConvertedThemeColors> = {}

  for (const [themeName, theme] of Object.entries(themeColors)) {
    const convertedTheme = colorFunctions.convertColorFormat(theme, 'hsl')
    const convertedThemeWithVars: ConvertedThemeColors = {}

    const themeColors: Colors = {}
    const themeVariables: Record<string, string> = {}
    const themeBaseColor: Record<string, string> = {}

    for (const [key, value] of Object.entries(convertedTheme)) {
      const colorName = invertedColorNames[key]

      if (colorName) {
        // Is a color
        if (colorName.startsWith('base-')) {
          // Is a base color
          const baseColorName = colorName.replace('base-', '')
          themeBaseColor[baseColorName] = `hsl(${replaceSpace(value)})`
        } else {
          themeColors[colorName] = `hsl(${replaceSpace(value)})`
        }
      } else if (key === 'fontFamily') {
        convertedThemeWithVars.fontFamily = {
          sans: value,
        }
      } else {
        // Is a variable
        themeVariables[defaultVarsLookup[key] ?? key] = value
      }
    }

    if (!isEmptyObject(themeBaseColor)) {
      themeColors.base = themeBaseColor
    }

    convertedThemeWithVars.colors = themeColors
    convertedThemeWithVars.variables = themeVariables

    convertedThemeColors[extractThemeName(themeName)] = convertedThemeWithVars
  }

  return convertedThemeColors
}

export const defaultThemes: Record<string, ConvertedThemeColors> =
  convertThemeColors(daisyDefaultThemes)

export const getDefaultThemes = (themeNames: string[]) => {
  const selectedThemes: typeof defaultThemes = {}

  for (const themeName of themeNames) {
    if (defaultThemes[themeName]) {
      selectedThemes[themeName] = defaultThemes[themeName]
    }
  }

  return selectedThemes
}
