import postcss from 'postcss'
import { RuleMeta, StaticRule } from 'unocss'

export type GeneratedShortcutsName = string
export type GeneratedShortcutsValue = { values: string[]; meta?: RuleMeta }

export type GeneratedShortcutsMap = Map<
  GeneratedShortcutsName,
  GeneratedShortcutsValue
>

export type GeneratedShortcutsEntries = [
  GeneratedShortcutsName,
  GeneratedShortcutsValue,
][]

export type GeneratedShortcutsIterable = Iterable<
  [GeneratedShortcutsName, GeneratedShortcutsValue]
>
export interface GeneratedAssets {
  rules: StaticRule[]
  shortcuts: GeneratedShortcutsMap
  preflights: string | postcss.Root
}

export interface Patch {
  (assets: GeneratedAssets, styleName: string): GeneratedAssets
}
