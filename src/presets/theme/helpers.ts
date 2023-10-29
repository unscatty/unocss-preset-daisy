export function wrapVar(name: string) {
  return `var(${name})`
}

export function wrapRGBA(v: string, alpha?: string | number) {
  if (alpha === undefined) {
    return `rgb(${v})`
  }

  return `rgba(${v}, ${alpha})`
}

export function wrapCSSFunction(
  name: string,
  v: string,
  alpha: string | number | undefined
) {
  return `${name}(${
    alpha === undefined ? v : [v, alpha].join(name.includes('rgb') ? ',' : ' ')
  })`
}

export function getThemeVal(theme: any, keys: string[], index = 0) {
  for (const key of keys) {
    theme = theme[key]
    if (theme === undefined) {
      return
    }
  }
  return Array.isArray(theme) ? theme[index] : theme
}

export function getThemeNamesSorted<Theme>(
  themes: Record<string, Theme>,
  themeOrder?: string[]
) {
  const sortedThemeNames: string[] = []

  for (const themeName of themeOrder ?? []) {
    if (themes[themeName]) {
      sortedThemeNames.push(themeName)
    }
  }

  for (const themeName in themes) {
    if (!sortedThemeNames.includes(themeName)) {
      sortedThemeNames.push(themeName)
    }
  }

  return sortedThemeNames
}

export function objectToCss(cssObject: {
  selector: string
  body: string
  parent?: string
}) {
  const { selector, body, parent } = cssObject

  const rule = `${selector} {${body}}`

  return parent ? `${parent} {\n${rule}\n}` : rule
}

export const extractKeys = <T extends Record<string, any>>(
  obj: T,
  keys: (keyof T)[],
  removeKeys = false
) => {
  const result = {} as Partial<T>

  for (const key of keys) {
    if (obj[key] !== undefined) {
      result[key] = obj[key]
    }

    if (removeKeys) {
      delete obj[key]
    }
  }

  return result
}
