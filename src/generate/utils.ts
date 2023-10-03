import { RuleMeta, StaticShortcut } from 'unocss'
import { GeneratedShortcutsMap, PatchableShortcutsMap } from './types'

export const patchableShortcutsMapToStaticShortcuts = (
  shortcutsMap: PatchableShortcutsMap,
  options?: {
    defaultMeta?: RuleMeta
    uniques?: boolean
  }
): StaticShortcut[] => {
  const { defaultMeta, uniques = false } = options ?? {};
  const staticShortcuts: StaticShortcut[] = []

  for (const [shortcutName, data] of shortcutsMap) {
    let uniqueShortcutValues = data.values

    if (uniques) {
      uniqueShortcutValues =
        typeof data.values === 'string'
          ? [...new Set(data.values.split(' '))].join(' ')
          : [...new Set(data.values)]
    }

    if (data.meta && Object.keys(data.meta).length > 0) {
      staticShortcuts.push([shortcutName, uniqueShortcutValues, data.meta])
    } else if (defaultMeta) {
      staticShortcuts.push([shortcutName, uniqueShortcutValues, defaultMeta])
    } else {
      staticShortcuts.push([shortcutName, uniqueShortcutValues])
    }
  }

  return staticShortcuts
}

export const staticShortcutsToPatchableShortcutsMap = (
  staticShortcuts: StaticShortcut[]
): PatchableShortcutsMap => {
  const shortcutsMap: PatchableShortcutsMap = new Map()

  for (const [shortcutName, values, meta] of staticShortcuts) {
    shortcutsMap.set(shortcutName, { values, meta })
  }

  return shortcutsMap
}

export const generatedShortcutsMapToPatchableShortcutsMap = (
  shortcutsMap: GeneratedShortcutsMap
): PatchableShortcutsMap => {
  const patchableShortcutsMap: PatchableShortcutsMap = new Map()

  for (const [shortcutName, values] of shortcutsMap) {
    patchableShortcutsMap.set(shortcutName, { values })
  }

  return patchableShortcutsMap
}

export const mergePatchableShortcutsMaps = (
  shortcutsMaps: PatchableShortcutsMap[],
  uniques = false
): PatchableShortcutsMap => {
  if (shortcutsMaps.length === 0) {
    return new Map()
  }

  const mergedShortcutsMap: PatchableShortcutsMap = new Map(
    structuredClone(shortcutsMaps[0])
  )

  for (const shortcutsMap of shortcutsMaps.slice(1)) {
    for (const [shortcutName, data] of shortcutsMap) {
      const exisitingData = mergedShortcutsMap.get(shortcutName)

      if (exisitingData) {
        mergedShortcutsMap.set(shortcutName, {
          values: [...exisitingData.values, ...data.values],
          meta:
            exisitingData.meta || data.meta
              ? {
                  ...exisitingData.meta,
                  ...data.meta,
                }
              : undefined,
        })
      } else {
        mergedShortcutsMap.set(shortcutName, data)
      }
    }
  }

  if (uniques) {
    // Remove duplicate shortcut values
    for (const [shortcutName, data] of mergedShortcutsMap) {
      mergedShortcutsMap.set(shortcutName, {
        values:
          typeof data.values === 'string'
            ? [...new Set(data.values.split(' '))].join(' ')
            : [...new Set(data.values)],
        meta: data.meta,
      })
    }
  }

  return mergedShortcutsMap
}
