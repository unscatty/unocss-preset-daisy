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

export type DaisyGeneratedTheme<Theme extends object = object> =
  Partial<Theme> &
    Partial<{
      colorScheme: string
      colors: DaisyColors
      variables: Record<string, string>
      fontFamily: Record<string, string>
    }>

export interface DaisyColors {
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

export type DaisyPresetOptions<Theme extends object = object> = Partial<{
  styled: boolean
  themes: boolean | Record<string, DaisyExtendTheme<Theme>>
  base: boolean
  utils: boolean
  rtl: boolean
  darkTheme: string
}>
