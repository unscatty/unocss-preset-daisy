import { writeFile } from 'node:fs'
import base from './daisy-untailwind/base'
import styled from './daisy-untailwind/styled'
import styledRtl from './daisy-untailwind/styled.rtl'
import unstyled from './daisy-untailwind/unstyled'
import unstyledRtl from './daisy-untailwind/unstyled.rtl'
import utilitiesStyled from './daisy-untailwind/utilities-styled'
import utilitiesUnstyled from './daisy-untailwind/utilities-unstyled'
import utilities from './daisy-untailwind/utilities'
import {
  generateShortcutsRulesAndPreflights,
  replacePrefix,
} from './helpers'
import { applyPatches, patches } from './patch'
import { patchableShortcutsMapToStaticShortcuts } from './utils'

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

  console.log(`Generating shortcuts for ${styleFile.filename} components`)

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
