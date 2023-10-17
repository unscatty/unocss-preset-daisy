import { RuleMeta, StaticShortcut } from 'unocss'
import { GeneratedShortcutsMap } from './types'

export const generatedShortcutsMapToStaticShortcuts = (
  shortcutsMap: GeneratedShortcutsMap,
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
