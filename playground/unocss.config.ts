import { defineConfig, presetIcons, presetUno } from 'unocss'

import { presetDaisy } from '../dist/index'

export default defineConfig({
  presets: [
    presetUno(),
    presetDaisy({
      themes: true,
    }),
    presetIcons(),
  ],
})
