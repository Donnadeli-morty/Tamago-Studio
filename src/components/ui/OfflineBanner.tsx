import { useSyncExternalStore } from 'react'
import { site } from '../../lib/data'
import { Icon } from './Icon'

const assinar = (avisar: () => void) => {
  window.addEventListener('online', avisar)
  window.addEventListener('offline', avisar)
  return () => {
    window.removeEventListener('online', avisar)
    window.removeEventListener('offline', avisar)
  }
}

/** Estado offline (spec §3.5): aviso discreto no topo, some sozinho quando a rede volta. */
export function OfflineBanner() {
  const online = useSyncExternalStore(assinar, () => navigator.onLine, () => true)
  if (online) return null
  return (
    <div role="status" className="fixed inset-x-3 top-[4.5rem] z-50 mx-auto flex max-w-xl items-start gap-3 rounded-2xl border border-status-ultimas/40 bg-superficie-2/95 p-4 text-sm shadow-xl backdrop-blur md:top-24">
      <Icon nome="wifi" className="mt-0.5 size-5 shrink-0 text-status-ultimas" />
      {site.ui.offline}
    </div>
  )
}
