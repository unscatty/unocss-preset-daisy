import { writeFile } from 'node:fs'
import { CssInJs } from 'postcss-js'
import styled from './daisy-untailwind/styled'
import unstyled from './daisy-untailwind/unstyled'
import utilities from './daisy-untailwind/utilities'
import utilitiesStyled from './daisy-untailwind/utilities-styled'
import utilitiesUnstyled from './daisy-untailwind/utilities-unstyled'

import base from './daisy-untailwind/base'
import styledRtl from './daisy-untailwind/styled.rtl'
import unstyledRtl from './daisy-untailwind/unstyled.rtl'
import { generateShortcutsRulesAndPreflights, replacePrefix } from './helpers'

const styleFiles = [
  { css: styled as CssInJs, filename: 'styled.json' },
  { css: unstyled as CssInJs, filename: 'unstyled.json' },
  { css: utilities as CssInJs, filename: 'utilities.json' },
  { css: utilitiesStyled as CssInJs, filename: 'utilities-styled.json' },
  { css: utilitiesUnstyled as CssInJs, filename: 'utilities-unstyled.json' },
  { css: base as CssInJs, filename: 'base.json' },
  { css: styledRtl as CssInJs, filename: 'styled.rtl.json' },
  { css: unstyledRtl as CssInJs, filename: 'unstyled.rtl.json' },
]

for (const styleFile of styleFiles) {
  const { rules, shortcuts, preflights } = generateShortcutsRulesAndPreflights(
    styleFile.css
  )

  const jsonContent = JSON.stringify(
    {
      rules,
      shortcuts: [...shortcuts.entries()],
      preflights: preflights.toString(),
    },
    // eslint-disable-next-line unicorn/no-null
    null,
    2
  )

  writeFile(
    `../generated/${styleFile.filename}`,
    replacePrefix(jsonContent),
    (err) => {
      if (err) {
        console.error(err)
      }
    }
  )
}
