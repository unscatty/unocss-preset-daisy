import colorNames from 'daisyui/src/theming/colorNames'
import colorFunctions from 'daisyui/src/theming/functions'
import daisyDefaultThemes from 'daisyui/src/theming/themes'
import { invertObject, replaceSpace } from './generate/utils'
import {
  DaisyColors,
  DaisyGeneratedTheme,
  DaisyDefaultThemeNames,
} from './types'
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

export const convertThemeColors = (
  themeColors: Record<string, string>
): DaisyGeneratedTheme => {
  const convertedTheme = colorFunctions.convertColorFormat(themeColors, 'hsl')
  const convertedThemeWithVars: DaisyGeneratedTheme = {}

  const convertedThemeColors: DaisyColors = {}
  const themeVariables: Record<string, string> = {}
  const themeBaseColor: Record<string, string> = {}

  for (const [key, value] of Object.entries(convertedTheme)) {
    const colorName = invertedColorNames[key]

    if (colorName) {
      // Is a color
      convertedThemeColors[colorName] = `hsl(${replaceSpace(value)})`
    } else if (key === 'fontFamily') {
      convertedThemeWithVars.fontFamily = {
        sans: value,
      }
    } else if (key === 'color-scheme') {
      convertedThemeWithVars.colorScheme = value
    } else {
      // Is a variable
      themeVariables[key] = value
    }
  }

  if (!isEmptyObject(themeBaseColor)) {
    convertedThemeColors.base = themeBaseColor
  }

  convertedThemeWithVars.colors = convertedThemeColors
  convertedThemeWithVars.variables = themeVariables

  return convertedThemeWithVars
}

const converDefaultThemes = (
  themeColors: Record<string, Record<string, string>>
): Record<string, DaisyGeneratedTheme> => {
  const convertedThemeColors: Record<string, DaisyGeneratedTheme> = {}

  for (const [themeName, theme] of Object.entries(themeColors)) {
    const convertedThemeWithVars = convertThemeColors(theme)

    convertedThemeColors[extractThemeName(themeName)] = convertedThemeWithVars
  }

  return convertedThemeColors
}

export const defaultDaisyThemes: Record<
  DaisyDefaultThemeNames,
  DaisyGeneratedTheme
> = converDefaultThemes(daisyDefaultThemes)

export const getDefaultThemes = (themeNames: DaisyDefaultThemeNames[]) => {
  const selectedThemes: Record<string, DaisyGeneratedTheme> = {}

  for (const themeName of themeNames) {
    if (defaultDaisyThemes[themeName]) {
      selectedThemes[themeName] = defaultDaisyThemes[themeName]
    }
  }

  return selectedThemes
}
