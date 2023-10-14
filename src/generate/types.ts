import postcss from 'postcss'
import { RuleMeta, ShortcutValue, StaticRule } from 'unocss'

export type GeneratedShortcutsMap = Map<string, ShortcutWrapper>

export interface GeneratedAssets {
  rules: StaticRule[]
  shortcuts: GeneratedShortcutsMap
  preflights: string | postcss.Root
}

export interface Patch {
  (assets: GeneratedAssets, styleName: string): GeneratedAssets
}

export interface DynamicShortcutInfo {
  isDynamic: true
  rawSelector?: string
  // Maybe useful for patching
  normalizedSelector: string
  selectorWithNest: string
  media?: string
  values: string[]
}

export interface StaticShortcutInfo {
  isDynamic: false
  values: ShortcutValue[],
}

export type ShortcutInfo = DynamicShortcutInfo | StaticShortcutInfo

export interface ShortcutWrapper {
  isDynamic: boolean
  shortcuts: ShortcutInfo[]
  meta?: RuleMeta
}
