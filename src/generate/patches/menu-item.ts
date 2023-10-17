import { StaticRule } from 'unocss'
import { type Patch } from '../types'

export const patchMenuItem: Patch = (
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

  const menuShortcut = shortcuts.get('menu')

  if (menuShortcut) {
    const menuItemTransitionRule: StaticRule = [
      'transition-menu-item',
      {
        'transition-property':
          'color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter',
        'transition-timing-function': 'cubic-bezier(0, 0, 0.2, 1)',
        'transition-duration': '200ms',
      },
    ]

    rules.unshift(menuItemTransitionRule)

    const menuItemPatch =
      'inherit-[&_:where(li:not(.menu-title)_>_*:not(ul):not(details):not(.menu-title)),_&_:where(li:not(.menu-title)_>_details_>_summary:not(.menu-title))]:transition-menu-item'

    shortcuts.set('menu', {
      ...menuShortcut,
      values: [...menuShortcut.values, menuItemPatch],
    })
  }

  return {
    rules,
    shortcuts,
    preflights,
  }
}
