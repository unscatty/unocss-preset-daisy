import { writeFile } from 'node:fs'
import {
  base,
  styled,
  styledRtl,
  unstyled,
  unstyledRtl,
  utilities,
  utilitiesStyled,
  utilitiesUnstyled,
} from 'daisy-untailwind'
import { generateShortcutsRulesAndPreflights, replaceTwPrefix } from './helpers'
import { applyPatches, patches } from './patch'
import { varsLookup } from './utils'

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
    styleFile.css,
    varsLookup
  )

  const {
    rules: patchedRules,
    shortcuts: patchedShortcuts,
    preflights: patchablePreflights,
  } = applyPatches(patches, { rules, shortcuts, preflights }, styleFile.name)

  const jsonContent = JSON.stringify(
    {
      rules: patchedRules,
      shortcuts: [...patchedShortcuts.entries()],
      preflights: patchablePreflights.toString(),
    },
    // eslint-disable-next-line unicorn/no-null
    null,
    2
  )

  console.log(`Generating shortcuts for ${styleFile.filename} components`)

  writeFile(
    `./src/generated/${styleFile.filename}`,
    replaceTwPrefix(jsonContent),
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
