import { useCallback, useSyncExternalStore } from 'react'
import { escreverFiltros, lerFiltros, type Filtros } from './catalogo'

const EVENTO = 'tamago:filtros'

const assinar = (avisar: () => void) => {
  window.addEventListener('popstate', avisar)
  window.addEventListener(EVENTO, avisar)
  return () => {
    window.removeEventListener('popstate', avisar)
    window.removeEventListener(EVENTO, avisar)
  }
}

/**
 * Os filtros do catálogo moram na URL (?universo=anime&tamanho=p): o link
 * compartilhado abre igual, e o "voltar" do navegador desfaz o último filtro.
 * No servidor (pré-render) a busca é vazia: o HTML sai com o catálogo completo
 * e o navegador aplica a URL logo na hidratação, sem divergência.
 */
export function useFiltrosDaUrl(): [Filtros, (novos: Filtros) => void] {
  const busca = useSyncExternalStore(
    assinar,
    () => window.location.search,
    () => '',
  )
  const filtros = lerFiltros(busca)
  const definir = useCallback((novos: Filtros) => {
    const url = `${window.location.pathname}${escreverFiltros(novos)}`
    // replaceState mantém o estado atual (ex.: o painel de filtros aberto no celular)
    window.history.replaceState(window.history.state, '', url)
    window.dispatchEvent(new Event(EVENTO))
  }, [])
  return [filtros, definir]
}
