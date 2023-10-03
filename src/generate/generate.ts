import { writeFile } from 'node:fs'
import base from './daisy-untailwind/base.js'
import styled from './daisy-untailwind/styled.js'
import styledRtl from './daisy-untailwind/styled.rtl.js'
import unstyled from './daisy-untailwind/unstyled.js'
import unstyledRtl from './daisy-untailwind/unstyled.rtl.js'
import utilitiesStyled from './daisy-untailwind/utilities-styled.js'
import utilitiesUnstyled from './daisy-untailwind/utilities-unstyled.js'
import utilities from './daisy-untailwind/utilities.js'
import {
  generateShortcutsRulesAndPreflights,
  replacePrefix,
} from './helpers.js'
import { applyPatches, patches } from './patch.js'
import { patchableShortcutsMapToStaticShortcuts } from './utils.js'

const styleFiles = [
  { name: 'styled', css: styled, filename: 'styled.json' },
  { name: 'unstyled', css: unstyled, filename: 'unstyled.json' },
  { name: 'utilities', css: utilities, filename: 'utilities.json' },
  {
    name: 'utilities-styled',
    css: utilitiesStyled,
    filename: 'utilities-styled.json',
  },
  {
    name: 'utilities-unstyled',
    css: utilitiesUnstyled,
    filename: 'utilities-unstyled.json',
  },
  { name: 'base', css: base, filename: 'base.json' },
  { name: 'styled.rtl', css: styledRtl, filename: 'styled.rtl.json' },
  { name: 'unstyled.rtl', css: unstyledRtl, filename: 'unstyled.rtl.json' },
]

for (const styleFile of styleFiles) {
  const { rules, shortcuts, preflights } = generateShortcutsRulesAndPreflights(
    styleFile.css
  )

  const {
    rules: patchedRules,
    shortcuts: patchedShortcuts,
    preflights: patchablePreflights,
  } = applyPatches(patches, { rules, shortcuts, preflights }, styleFile.name)

  const jsonContent = JSON.stringify(
    {
      rules: patchedRules,
      shortcuts: patchableShortcutsMapToStaticShortcuts(patchedShortcuts, {
        defaultMeta: {
          layer: 'daisy-3-components',
        },
        uniques: true,
      }),
      preflights: patchablePreflights.toString(),
    },
    // eslint-disable-next-line unicorn/no-null
    null,
    2
  )

  writeFile(
    `./src/generated/${styleFile.filename}`,
    replacePrefix(jsonContent),
    {
      flag: 'w',
    },
    (err) => {
      if (err) {
        console.error(err)
      }
    }
  )
}
