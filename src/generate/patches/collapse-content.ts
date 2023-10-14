import { ShortcutInfo, type Patch } from '../types'

export const patchCollapseContent: Patch = (
  { rules, shortcuts, preflights },
  styleName
) => {
  if (styleName !== 'styled') {
    return {
      rules,
      shortcuts,
      preflights,
    }
  }

  const collapseContentShortcut = shortcuts.get('collapse-content')

  if (collapseContentShortcut) {
    const collapseContentNormalizedSelector =
      '.collapse-title,_.collapse_>_input[type="checkbox"],_.collapse_>_input[type="radio"],_.collapse-content'

    const filteredShortcuts: ShortcutInfo[] = collapseContentShortcut.shortcuts.filter(
      (shortcut) => {
        if (shortcut.isDynamic) {
          // Remove the dynamic selector if matches the collapse content selector
          return shortcut.normalizedSelector !== collapseContentNormalizedSelector
        }

        return true
      }
    )

    shortcuts.set('collapse-content', {
      isDynamic: collapseContentShortcut.isDynamic,
      shortcuts: filteredShortcuts,
      meta: { layer: 'daisy-4-components' },
    })
  }

  return {
    rules,
    shortcuts,
    preflights,
  }
}
