import { defineConfig, loadEnv } from 'vite'
import unocss from 'unocss/vite'

export default defineConfig(({ command, mode }) => {
  let base = '/'

  if (command === 'build' && mode === 'gh-pages') {
    const env = loadEnv(mode, process.cwd())
    base = env.VITE_REPO_NAME

    console.log(`Building for gh-pages, base url: ${base}`)
  }

  return {
    base,
    plugins: [unocss()],
  }
})
