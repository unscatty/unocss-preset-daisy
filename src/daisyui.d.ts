declare module 'daisyui/src/theming/index' {
  // The value can also be a string, ignore them as they are filtered
  const colors: Record<string, string>
  export default colors
}

declare module 'daisyui/dist/utilities' {
  import type { CssInJs } from 'postcss-js'

  const utilities: CssInJs
  export default utilities
}

declare module 'daisyui/dist/base' {
  import type { CssInJs } from 'postcss-js'

  const base: CssInJs
  export default base
}

declare module 'daisyui/dist/unstyled' {
  import type { CssInJs } from 'postcss-js'

  const unstyled: CssInJs
  export default unstyled
}

declare module 'daisyui/dist/unstyled.rtl' {
  import type { CssInJs } from 'postcss-js'

  const unstyledRtl: CssInJs
  export default unstyledRtl
}

declare module 'daisyui/dist/styled' {
  import type { CssInJs } from 'postcss-js'

  const styled: CssInJs
  export default styled
}

declare module 'daisyui/dist/styled.rtl' {
  import type { CssInJs } from 'postcss-js'

  const styledRtl: CssInJs
  export default styledRtl
}

declare module 'daisyui/dist/utilities-unstyled' {
  import type { CssInJs } from 'postcss-js'

  const utilitiesUnstyled: CssInJs
  export default utilitiesUnstyled
}

declare module 'daisyui/dist/utilities-styled' {
  import type { CssInJs } from 'postcss-js'

  const utilitiesStyled: CssInJs
  export default utilitiesStyled
}

declare module 'daisyui/src/theming/themes' {
  const themes: Record<string, Record<string, string>>
  export default themes
}

declare module 'daisyui/src/theming/functions' {
  import type { CssInJs } from 'postcss-js'

  export function injectThemes(
    addBase: (theme: CssInJs) => void,
    config: (key: string) => unknown,
    themes: Record<string, Record<string, string>>,
    colorFunction: 'hsl' | 'lch',
  ): void
}
