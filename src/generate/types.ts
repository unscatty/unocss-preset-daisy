import postcss from 'postcss'
import { RuleMeta, StaticRule } from 'unocss'

export type GeneratedShortcutsMap = Map<
  string,
  { values: string[]; meta?: RuleMeta }
>

export interface GeneratedAssets {
  rules: StaticRule[]
  shortcuts: GeneratedShortcutsMap
  preflights: string | postcss.Root
}

export interface Patch {
  (assets: GeneratedAssets, styleName: string): GeneratedAssets
}
