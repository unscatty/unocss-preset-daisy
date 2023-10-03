import { type ShortcutValue, type StaticRule } from 'unocss'

declare module '*.json' {
  export const rules: StaticRule[]
  export const shortcuts: [string, ShortcutValue[]][]
  export const preflights: string
}
