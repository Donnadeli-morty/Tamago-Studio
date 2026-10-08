/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'
import { Figures, Site } from './src/lib/schema.ts'

// Valida src/data/*.json contra o schema (spec §4.1) no dev, a cada edição, e no build.
// No build, erro = build falha. No dev, o erro aparece no terminal e na tela (overlay).
function validarDados(): Plugin {
  const validar = () => {
    const ler = (p: string) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'))
    const erros = [
      ['figures.json', Figures.safeParse(ler('./src/data/figures.json'))],
      ['site.json', Site.safeParse(ler('./src/data/site.json'))],
    ] as const
    const msgs = erros.flatMap(([arquivo, r]) =>
      r.success ? [] : r.error.issues.map((i) => `${arquivo} → ${i.path.join('.') || '(raiz)'}: ${i.message}`),
    )
    if (msgs.length) throw new Error(`Dados inválidos:\n  ${msgs.join('\n  ')}`)
  }
  return {
    name: 'tamago:validar-dados',
    buildStart: validar,
    handleHotUpdate({ file, server }) {
      if (!/src[\\/]data[\\/].+\.json$/.test(file)) return
      try {
        validar()
      } catch (e) {
        server.config.logger.error(String((e as Error).message))
        server.ws.send({ type: 'error', err: { message: (e as Error).message, stack: '' } })
        return []
      }
    },
  }
}

// Injeta <link rel="preload"> só para os dois arquivos de fonte que a primeira
// dobra usa (subset latino). Os demais subsets ficam por conta do unicode-range.
function preloadFontes(): Plugin {
  return {
    name: 'tamago:preload-fontes',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        if (!ctx.bundle) return []
        return Object.keys(ctx.bundle)
          .filter((arquivo) => /(cinzel|nunito)-latin-wght-normal.*\.woff2$/.test(arquivo))
          .map((arquivo) => ({
            tag: 'link',
            attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: `/${arquivo}`, crossorigin: '' },
            injectTo: 'head' as const,
          }))
      },
    },
  }
}

export default defineConfig({
  plugins: [validarDados(), react(), tailwindcss(), preloadFontes()],
  build: {
    target: 'es2022',
    // model-viewer (three.js) é grande, mas só carrega sob demanda num chunk próprio.
    chunkSizeWarningLimit: 1200,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
