import type { UserShortcuts } from 'unocss'

export type DaisyDefaultThemeNames =
  | 'light'
  | 'dark'
  | 'cupcake'
  | 'bumblebee'
  | 'emerald'
  | 'corporate'
  | 'synthwave'
  | 'retro'
  | 'cyberpunk'
  | 'valentine'
  | 'halloween'
  | 'garden'
  | 'forest'
  | 'aqua'
  | 'lofi'
  | 'pastel'
  | 'fantasy'
  | 'wireframe'
  | 'black'
  | 'luxury'
  | 'dracula'
  | 'cmyk'
  | 'autumn'
  | 'business'
  | 'acid'
  | 'lemonade'
  | 'night'
  | 'coffee'
  | 'winter'

export type DaisyDefaultVarNames =
  | 'roundedBox'
  | 'roundedBtn'
  | 'roundedBadge'
  | 'animationBtn'
  | 'animationInput'
  | 'btnTextCase'
  | 'btnFocusScale'
  | 'borderBtn'
  | 'tabBorder'
  | 'tabRadius'

export type DaisyThemeVars = Partial<{ [k in DaisyDefaultVarNames]: string }> &
  Record<string, string>

export type DaisyGeneratedTheme<Theme extends object = object> =
  Partial<Theme> &
    Partial<{
      colorScheme: string
      colors: DaisyColors
      variables: DaisyThemeVars
      fontFamily: Record<string, string>
    }>

export type DaisyColors = {
  [key: string]:
    | (DaisyColors & {
        DEFAULT?: string
      })
    | string
}

export type DaisyExtendTheme<Theme extends object = object> = Partial<Theme> &
  DaisyGeneratedTheme<Theme> &
  Partial<{
    inherit: DaisyDefaultThemeNames
    shortcuts: UserShortcuts
  }>

export type DaisyPresetOptionsThemes<Theme extends object = object> =
  | boolean
  | (Partial<{
      [key in DaisyDefaultThemeNames]: DaisyExtendTheme<Theme> | false
    }> &
      Record<string, DaisyExtendTheme<Theme> | false>)

export type DaisyThemes<Theme extends object = object> = Record<
  string,
  DaisyExtendTheme<Theme>
>

export type DaisyThemesOrNot<Theme extends object = object> = Exclude<
  DaisyPresetOptionsThemes<Theme>,
  boolean
>

export type DaisySelectorFn = (themeName: string) => string | string[]

export type DaisySelectors = Record<string, string | string[]>

export type DaisySelectorOptions = DaisySelectors | DaisySelectorFn

export type DaisyColorScheme = {
  light?: string
  dark?: string
}

export type DaisyUseColorSchemeOption = boolean | DaisyColorScheme

export type DaisyPresetOptions<Theme extends object = object> = Partial<{
  styled: boolean
  themes: DaisyPresetOptionsThemes<Theme>
  base: boolean
  utils: boolean
  rtl: boolean
  selectors: DaisySelectorOptions
  rootTheme: string
  useColorScheme: DaisyUseColorSchemeOption
}>
