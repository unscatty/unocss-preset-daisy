import { Variant } from 'unocss'
import { variantGetBracket } from '@unocss/rule-utils'
import { bracket } from './helpers'

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
          selector: (s) => `${scope} ${s}`,
        }
      }
    }
  },
}
