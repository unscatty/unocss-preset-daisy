import { type StaticRule } from 'unocss'
import { GeneratedShortcutsEntries } from './generate/types'

declare module '*.json' {
  export const rules: StaticRule[]
  export const shortcuts: GeneratedShortcutsEntries
  export const preflights: string
}
