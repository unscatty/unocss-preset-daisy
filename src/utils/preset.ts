export const defaultSelectorFn = (themeName: string) => {
  return `[data-theme="${themeName}"]`
}

export const getSelectors = (
  themeNames: string[],
  selectorFn = defaultSelectorFn
) => {
  const selectors: Record<string, string> = {}

  for (const themeName of themeNames) {
    if (themeName === 'light') {
      selectors.light = ':root'
    } else {
      selectors[themeName] = selectorFn(themeName)
    }
  }

  return selectors
}

// export const inheritTheme = <Theme extends object = object>(
//   theme: Theme,
//   defaultThemes: Theme,
// ): Theme => {
//   const inheritTheme = theme[inherit]

//   if (!inheritTheme) {
//     throw new Error(`Cannot find theme "${inherit}"`)
//   }

//   return mergeDeep({}, inheritTheme, theme)
// }

