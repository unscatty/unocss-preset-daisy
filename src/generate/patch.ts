import {
  patchCollapseContent,
  patchOutlined,
  patchTransitionProperty,
} from './patches/index'
import { GeneratedAssets, Patch } from './types'

export const patches = [
  // Adds transition-no-outline rule to styled assets
  patchTransitionProperty,
  patchCollapseContent,
  patchOutlined,
]

export const applyPatches = (
  patches: Patch[],
  { rules, shortcuts, preflights }: GeneratedAssets,
  styleName: string
): GeneratedAssets => {
  let patchableShortcutsMap = shortcuts
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
