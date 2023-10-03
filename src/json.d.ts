import { StaticShortcut, type StaticRule } from 'unocss'

declare module '*.json' {
  export const rules: StaticRule[]
  export const shortcuts: StaticShortcut[]
  export const preflights: string
}
