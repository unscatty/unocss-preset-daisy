import { StaticRule } from 'unocss'
import { type Patch } from '../types'

export const patchTransitionProperty: Patch = (
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

  const transitionAllNoOutlineRule: StaticRule = [
    'transition-no-outline',
    {
      'transition-property':
        'color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter',
    },
  ]

  rules.unshift(transitionAllNoOutlineRule)

  for (const [, data] of shortcuts) {
    for (let index = 0; index < data.values.length; index++) {
      const shortcutValue = data.values[index]

      if (shortcutValue.endsWith('transition')) {
        // Remove `transition` from the end of the shortcut value
        const shortVariants = shortcutValue.slice(
          0,
          -'transition'.length
        )

        // Add `transition-property` to the end of the shortcut value
        data.values[
          index
        ] = `${shortVariants}transition-no-outline`
      }
    }
  }

  return {
    rules,
    shortcuts,
    preflights,
  }
}
