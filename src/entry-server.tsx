import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { App } from './app/App'
import { PaginaDaRota } from './app/paginas'
import { caminhosEstaticos, metadados, resolverRota } from './app/rotas'

/** Usado só no build (scripts/prerender.mjs): o HTML e os metadados de cada página. */
export function render(caminho: string): { html: string; meta: ReturnType<typeof metadados> } {
  const rota = resolverRota(caminho)
  const html = renderToString(
    <StrictMode>
      <App rota={rota}>
        <PaginaDaRota rota={rota} />
      </App>
    </StrictMode>,
  )
  return { html, meta: metadados(rota) }
}

export { caminhosEstaticos }
