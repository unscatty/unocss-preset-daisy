import {
  DynamicShortcut,
  DynamicShortcutMatcher,
  Shortcut,
  StaticShortcut
} from 'unocss'
import { GeneratedShortcutsMap, ShortcutWrapper } from './types'

export const removeSubstringFromEnd = (
  mainString: string,
  substringToRemove: string
) =>
  mainString.endsWith(substringToRemove)
    ? mainString.slice(0, mainString.length - substringToRemove.length)
    : mainString

const complexShortcutToDynamicShortcut = (
  shortcutName: string,
  shortcut: ShortcutWrapper
): DynamicShortcut => {
  const regex = new RegExp(`^${shortcutName}$`)

  const shortcutMatcher: DynamicShortcutMatcher = (_, context) => {
    const removedSelector = removeSubstringFromEnd(
      context.rawSelector,
      shortcutName
    )

    const shortcutValues: string[] = shortcut.shortcuts.flatMap(
      (shortcutInfo) => {
        if (shortcutInfo.isDynamic) {
          const { selectorWithNest, media, values } = shortcutInfo

          return values.map(
            (value) =>
              `${
                media ?? ''
              }[${selectorWithNest}]:${removedSelector}${value}`
          )
        } else {
          return shortcutInfo.values.map(
            (value) => `${removedSelector}${value}`
          )
        }
      }
    )

    if (removedSelector.length > 0) {
      // Modifiers are present
      // Reset variants so they get re-evaluated

      // @ts-ignore
      context.variantMatch[2] = []
      // @ts-ignore
      context.variantMatch[3] = new Set()
    }

    return shortcutValues
  }

  if (shortcut.meta) {
    return [regex, shortcutMatcher, shortcut.meta]
  }

  return [regex, shortcutMatcher]
}

export const generatedShortcutsToShortcuts = (
  shortcuts: GeneratedShortcutsMap
): Shortcut[] => {
  const result: Shortcut[] = []

  for (const [shortcutName, shortcut] of shortcuts) {
    if (shortcut.isDynamic) {
      // Dynamic shortcut
      const dynamicShortcut = complexShortcutToDynamicShortcut(
        shortcutName,
        shortcut
      )

      result.push(dynamicShortcut)
    } else {
      // Static shortcut
      // Just get all the values and add them to the result as static shortcuts
      const shorcutValues = shortcut.shortcuts.flatMap(
        (shortcutInfo) => shortcutInfo.values
      )

      const staticShortcut: StaticShortcut = shortcut.meta
        ? [shortcutName, shorcutValues, shortcut.meta]
        : [shortcutName, shorcutValues]

      result.push(staticShortcut)
    }
  }

  return result
}

export const getRepeatedClassNames = (classNames: string[]): string[] => {
  // Get the most repeated class names
  const classNamesCountMap = new Map<string, number>()

  for (const className of classNames) {
    if (classNamesCountMap.has(className)) {
      classNamesCountMap.set(
        className,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        classNamesCountMap.get(className)! + 1
      )
    } else {
      classNamesCountMap.set(className, 1)
    }
  }

  const mostRepeatedClassNamesCount = Math.max(...classNamesCountMap.values())

  const mostRepeatedClassNames = [...classNamesCountMap]
    .filter(([, count]) => count === mostRepeatedClassNamesCount)
    .map(([className]) => className)

  return mostRepeatedClassNames
}

export const replaceSubByIndexes = (
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

export const normalizeSelector = (selector: string) => {
  return selector.replace(/\s+/g, '_')
}
