import postcss from 'postcss'
import { RuleMeta, ShortcutValue, StaticRule } from 'unocss'

export type GeneratedShortcutsMap = Map<string, ShortcutValue[]>

export interface GeneratedAssets {
  rules: StaticRule[]
  shortcuts: GeneratedShortcutsMap
  preflights: string | postcss.Root
}

export interface PatchableShortcutValue {
  values: string | ShortcutValue[]
  meta?: RuleMeta
}

export type PatchableShortcutsMap = Map<string, PatchableShortcutValue>

export type PatchableAssets = Omit<GeneratedAssets, 'shortcuts'> & {
  shortcuts: PatchableShortcutsMap
}

export interface Patch {
  (assets: PatchableAssets, styleName: string): PatchableAssets
}
