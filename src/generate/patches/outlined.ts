import { type Patch } from '../types'

export const patchOutlined: Patch = (
  { rules, shortcuts, preflights },
  styleName
) => {
  if (styleName !== 'styled') {
    return {
      rules,
      shortcuts,
      preflights,
    }
  }

  for (const [shorcutName, data] of shortcuts) {
    if (shorcutName.endsWith('-outline')) {
      data.meta = { layer: 'daisy-4-components' }
    }
  }

  return {
    rules,
    shortcuts,
    preflights,
  }
}
