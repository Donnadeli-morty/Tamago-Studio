import { Catalogo } from '../pages/Catalogo'
import { ComoEFeita } from '../pages/ComoEFeita'
import { Home } from '../pages/Home'
import { NaoEncontrada } from '../pages/NaoEncontrada'
import { Produto } from '../pages/Produto'
import type { Rota } from './rotas'

/**
 * A página de cada rota, com tudo importado de uma vez: usado no pré-render e nos testes.
 * No navegador, main.tsx carrega só o código da página aberta (divisão por rota).
 */
export function PaginaDaRota({ rota }: { rota: Rota }) {
  switch (rota.tipo) {
    case 'home':
      return <Home />
    case 'catalogo':
      return <Catalogo />
    case 'processo':
      return <ComoEFeita />
    case 'produto':
      return <Produto figure={rota.figure} />
    default:
      return <NaoEncontrada />
  }
}
