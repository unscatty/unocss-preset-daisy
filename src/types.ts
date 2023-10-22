import type { UserShortcuts } from 'unocss'

export interface Colors {
  [key: string]:
    | (Colors & {
        DEFAULT?: string
      })
    | string
}

export type DaisyExtendTheme<Theme extends object = object> = Theme &
  Partial<{
    inherit: string
    variables: Record<string, string>
    shortcuts: UserShortcuts
    colors: Colors
  }>

export type DaisyPresetOptions<Theme extends object = object> = Partial<{
  styled: boolean
  themes: boolean | Record<string, DaisyExtendTheme<Theme>>
  base: boolean
  utils: boolean
  rtl: boolean
  darkTheme: string
}>
