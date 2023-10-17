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
