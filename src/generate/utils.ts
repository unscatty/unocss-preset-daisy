import colorNames from 'daisyui/src/theming/colorNames.js'
import themeDefaults from 'daisyui/src/theming/themeDefaults.js'
import { parse as parseCSSValues } from 'postcss-values-parser'
import { RuleMeta, StaticShortcut } from 'unocss'
import { GeneratedShortcutsMap, GeneratedShortcutsEntries } from './types'

export const colorNamesVarReplacements = Object.fromEntries(
  Object.entries(invertObject(colorNames)).map(([key, value]) => [
    key,
    prefixVarName(value, '--daisy-colors-'),
  ])
)

export const defaultVarsLookup = Object.fromEntries(
  Object.entries(themeDefaults.variables).map(([varName]) => [
    varName,
    prefixVarName(varName, '--daisy-vars-'),
  ])
)

export const varsLookup = {
  ...defaultVarsLookup,
  ...colorNamesVarReplacements,
}

export const generatedShortcutsMapToStaticShortcuts = (
  shortcutsMap: GeneratedShortcutsMap | GeneratedShortcutsEntries,
  options?: {
    defaultMeta?: RuleMeta
    uniques?: boolean
  }
): StaticShortcut[] => {
  const { defaultMeta, uniques = false } = options ?? {}
  const staticShortcuts: StaticShortcut[] = []

  for (const [
    shortcutName,
    { values: shortcutValues, meta: shortcutMeta },
  ] of shortcutsMap) {
    let newShortcutValues = shortcutValues

    if (uniques) {
      newShortcutValues = [...new Set(shortcutValues)]
    }

    if (defaultMeta || shortcutMeta) {
      staticShortcuts.push([
        shortcutName,
        newShortcutValues,
        { ...defaultMeta, ...shortcutMeta },
      ])
    } else {
      staticShortcuts.push([shortcutName, newShortcutValues])
    }
  }

  return staticShortcuts
}

const replaceSubByIndexes = (
  inputString: string,
  replacements: [string, number, number][]
) => {
  // Sort the replacements by startIndex in descending order
  replacements.sort((a, b) => b[1] - a[1])

  let replacedString = inputString

  for (const [replacement, startIndex, endIndex] of replacements) {
    if (
      startIndex < 0 ||
      endIndex < startIndex ||
      endIndex > replacedString.length
    ) {
      // Skip invalid replacement instructions
      continue
    }

    const firstPart = replacedString.slice(0, startIndex)
    const lastPart = replacedString.slice(endIndex)
    replacedString = firstPart + replacement + lastPart
  }

  return replacedString
}

export const replaceSelectorWithPlaceholder = (
  inputSelector: string,
  componentClassName: string,
  classTokens: { name: string; pos: [number, number] }[],
  placeholder = '&'
) => {
  return replaceSubByIndexes(
    inputSelector,
    classTokens
      .filter(({ name }) => name === componentClassName)
      .map(({ pos }) => [placeholder, pos[0], pos[1]])
  )
}

export const normalizeSelector = (selector: string) => {
  return selector.replace(/\s+/g, '_')
}

export function invertObject<T extends Record<string, string>>(obj: T) {
  const newObj = {} as Record<string, string>

  for (const [key, value] of Object.entries(obj)) {
    newObj[value] = key
  }

  return newObj
}

export const replaceVariables = (
  rawCSS: string,
  variablesLookup: Record<string, string>
) => {
  try {
    const root = parseCSSValues(rawCSS)

    root.walkFuncs((node) => {
      if (node.isVar) {
        const variable = node.nodes[0]

        if (
          variable.type === 'word' &&
          variable.isVariable &&
          variable.value in variablesLookup
        ) {
          variable.value = variablesLookup[variable.value]
        }
      }
    })

    return root.toString()
  } catch {
    return rawCSS
  }
}

export function prefixVarName(varName: string, prefix: string) {
  if (varName.startsWith('--')) {
    return `${prefix}${varName.slice(2)}`
  }

  return `${prefix}${varName}`
}

export const replaceSimpleVar = (
  rawCSS: string,
  varsLookup: Record<string, string> = {}
) => {
  const varRegex = /var\(([\w-]+)\)/g

  return rawCSS.replace(varRegex, (_, varName) => {
    const replacedVarName = varsLookup[varName] ?? varName

    return `var(${replacedVarName})`
  })
}

export const makeid = (length: number) => {
  let result = ''
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length

  for (let counter = 0; counter < length; counter++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }

  return result
}

export const replaceSpace = (css: string) =>
  // HSL
  // 123 4% 5% -> 123, 4%, 5%
  css.replace(/([\d.]+) ([\d%.]+) ([\d%.]+)/g, '$1, $2, $3')
