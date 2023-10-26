import { Variant } from 'unocss'
import { variantGetBracket } from '@unocss/rule-utils'
import { bracket } from './helpers'

export const variantInherit: Variant = {
  name: 'inherit',
  match(matcher, ctx) {
    const variant = variantGetBracket(
      'inherit-',
      matcher,
      ctx.generator.config.separators
    )

    if (variant) {
      const [match, rest] = variant
      const selector = bracket(match)

      // if (selector && selector.includes('&')) {
      if (selector) {
        return {
          matcher: rest,
          handle(input, next) {
            return next({
              ...input,
              selector: selector.replace(/&/g, input.selector),
            })
          },
          order: 998,
        }
      }
    }
  },
  order: 998,
  multiPass: false,
}


export const variantWeakInherit: Variant = {
  name: 'weak-inherit',
  match(matcher, ctx) {
    const variant = variantGetBracket(
      'weak-inherit-',
      matcher,
      ctx.generator.config.separators
    )

    if (variant) {
      const [match, rest] = variant
      const selector = bracket(match)

      // if (selector && selector.includes('&')) {
      if (selector) {
        return {
          matcher: rest,
          handle(input, next) {
            return next({
              ...input,
              selector: selector.replace(/&/g, input.selector),
            })
          },
          order: -998,
        }
      }
    }
  },
  order: -998,
  multiPass: false,
}
