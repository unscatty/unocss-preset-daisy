import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig([
  {
    name: 'generate',
    entries: ['./'],
    declaration: false,
    sourcemap: false,
    clean: true,
    rollup: {
      esbuild: {
        minify: true,
      },
    },
  },
])
