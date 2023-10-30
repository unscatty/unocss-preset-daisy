import { variantGetParameter } from '@unocss/rule-utils'
import { VariantObject, toArray } from 'unocss'

export const variantTheme = (
  selectors: Record<string, string | string[]>
): VariantObject => ({
  name: 'theme',
  match(matcher, ctx) {
    const variant = variantGetParameter(
      'theme-',
      matcher,
      ctx.generator.config.separators
    )

    if (variant) {
      const [match, rest] = variant

      const themeSelectors = selectors[match]

      if (!themeSelectors) {
        return
      }

      const selectorsArray = toArray(themeSelectors)

      return {
        matcher: rest,
        selector: (s) =>
          selectorsArray.map((selector) => `${selector} ${s}`).join(','),
        order: 999,
      }
    }
  },
  order: 999,
  multiPass: true,
})
