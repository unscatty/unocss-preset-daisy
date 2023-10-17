import { patchCollapseContent, patchMenuItem, patchOutlined } from './patches/index'
import { GeneratedAssets, Patch, PatchableAssets } from './types'
import { generatedShortcutsMapToPatchableShortcutsMap } from './utils'

export const patches = [patchCollapseContent, patchMenuItem, patchOutlined]

export const applyPatches = (
  patches: Patch[],
  { rules, shortcuts, preflights }: GeneratedAssets,
  styleName: string
): PatchableAssets => {
  let patchableShortcutsMap =
    generatedShortcutsMapToPatchableShortcutsMap(shortcuts)
  let patchablePreflights = preflights
  let patchableRules = rules

  for (const patch of patches) {
    const {
      rules: patchedRules,
      shortcuts: patchedShortcuts,
      preflights: patchedPreflights,
    } = patch(
      {
        rules: patchableRules,
        shortcuts: patchableShortcutsMap,
        preflights: patchablePreflights,
      },
      styleName
    )

    patchableRules = patchedRules
    patchableShortcutsMap = patchedShortcuts
    patchablePreflights = patchedPreflights
  }

  return {
    rules: patchableRules,
    shortcuts: patchableShortcutsMap,
    preflights: patchablePreflights,
  }
}
