import { variantGetBracket } from '@unocss/rule-utils'
import { Variant } from 'unocss'
import { bracket, splitSelector } from './helpers'

export const variantScoped: Variant = {
  name: 'scoped',
  match(matcher, ctx) {
    const variant = variantGetBracket(
      'scoped-',
      matcher,
      ctx.generator.config.separators
    )

    if (variant) {
      const [match, rest] = variant
      const scope = bracket(match)
      if (scope) {
        return {
          matcher: rest,
          selector: (s) => {
            const selectors = s.includes(',') ? splitSelector(s) : [s]
            // Handle multiple selectors
            return selectors
              .map((selector) => {
                // Handle selector already scoped
                return selectors.some((s) => s.startsWith(scope + ' '))
                  ? selector
                  : `${scope} ${selector}`
              })
              .join(',')
          },
          order: 1000,
        }
      }
    }
  },
  order: 1000,
  multiPass: true,
}
