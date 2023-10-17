import { type Patch } from '../types'

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
    const collapseContentPrefixToRemove =
      'inherit-[.collapse-title,_.collapse_>_input[type="checkbox"],_.collapse_>_input[type="radio"],_&]:'

    const valuesArray = collapseContentShortcut.values

    const filteredShortcuts = valuesArray.filter(
      (shortcut) => !shortcut.startsWith(collapseContentPrefixToRemove)
    )

    shortcuts.set('collapse-content', {
      values: filteredShortcuts,
      meta: { layer: 'daisy-4-priority-components' },
    })
  }

  return {
    rules,
    shortcuts,
    preflights,
  }
}
