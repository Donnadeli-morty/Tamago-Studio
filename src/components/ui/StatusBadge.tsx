import { preencher, site } from '../../lib/data'
import type { Figure, Status } from '../../lib/schema'
import { Icon, type NomeIcone } from './Icon'

// Cor + ícone + texto: o status nunca depende só de cor (spec §7)
const aparencia: Record<Status, { icone: NomeIcone; classe: string }> = {
  disponivel: { icone: 'check', classe: 'text-status-disponivel border-status-disponivel/35 bg-status-disponivel/10' },
  ultimas: { icone: 'chama', classe: 'text-status-ultimas border-status-ultimas/40 bg-status-ultimas/10' },
  encomenda: { icone: 'pincel', classe: 'text-status-encomenda border-status-encomenda/35 bg-status-encomenda/10' },
  esgotado: { icone: 'sino', classe: 'text-status-esgotado border-status-esgotado/35 bg-status-esgotado/10' },
}

export function StatusBadge({
  status,
  stock,
  editionSize,
  detalhado = false,
  compacto = false,
  className = '',
}: Pick<Figure, 'status' | 'stock' | 'editionSize'> & { detalhado?: boolean; compacto?: boolean; className?: string }) {
  const { icone, classe } = aparencia[status]
  // Escassez honesta: só mostra número quando o estoque existe no JSON
  const escassez =
    status === 'ultimas' && stock !== undefined
      ? detalhado && editionSize
        ? preencher(site.ui.stockOf, { n: stock, total: editionSize })
        : preencher(site.ui.stockLeft, { n: stock })
      : detalhado && status === 'disponivel' && stock !== undefined && editionSize
        ? preencher(site.ui.stockOf, { n: stock, total: editionSize })
        : null

  // Compacto (cards de 2 colunas no celular): "Últimas unidades · Restam 1" quebrava em 4 linhas.
  // O card mostra só o nome do status; o número fica na ficha da peça ("1 de 5 disponíveis").
  const mostrarEscassez = escassez && !compacto

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide whitespace-nowrap backdrop-blur-sm ${classe} ${className}`}
    >
      <Icon nome={icone} className="size-3.5" />
      <span>{site.status[status].label}</span>
      {mostrarEscassez && <span className="font-medium">· {escassez}</span>}
    </span>
  )
}
