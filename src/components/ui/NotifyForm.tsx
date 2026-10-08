import { useId, useState, type FormEvent } from 'react'
import { track } from '../../lib/analytics'
import { site } from '../../lib/data'
import { EmailDrop } from '../../lib/formulario'
import { Button } from './Button'

const N = site.notify

type Estado = 'idle' | 'enviando' | 'sucesso' | 'mailto' | 'erro' | 'invalido'

/**
 * "Avise-me do próximo drop" (spec §4). Sem dados guardados no site (spec §5.1):
 * com endpoint (Formspree/Web3Forms) faz POST; sem endpoint abre o mailto.
 */
export function NotifyForm({ onSubmit }: { onSubmit?: (email: string) => void }) {
  const [email, setEmail] = useState('')
  const [estado, setEstado] = useState<Estado>('idle')
  const idCampo = useId()
  const idMsg = useId()

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    const ok = EmailDrop.safeParse({ email: email.trim() })
    if (!ok.success) return setEstado('invalido')

    track('notify_submit')
    onSubmit?.(ok.data.email)

    if (!N.endpoint) {
      const assunto = encodeURIComponent(`Lista de drops — ${site.brand.name}`)
      const corpo = encodeURIComponent(`Quero ser avisado do próximo drop: ${ok.data.email}`)
      window.location.href = `mailto:${N.mailto}?subject=${assunto}&body=${corpo}`
      return setEstado('mailto')
    }

    setEstado('enviando')
    try {
      const r = await fetch(N.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: ok.data.email, origem: 'landing-drop' }),
      })
      if (!r.ok) throw new Error(String(r.status))
      setEstado('sucesso')
      setEmail('')
    } catch {
      setEstado('erro')
    }
  }

  const mensagem =
    estado === 'sucesso' ? N.success : estado === 'mailto' ? N.mailtoNote : estado === 'erro' ? N.error : estado === 'invalido' ? N.invalid : ''
  const problema = estado === 'erro' || estado === 'invalido'

  return (
    <form onSubmit={enviar} noValidate className="w-full">
      <label htmlFor={idCampo} className="mb-2 block text-sm font-semibold">
        {N.emailLabel}
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id={idCampo}
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (problema) setEstado('idle')
          }}
          aria-invalid={estado === 'invalido'}
          aria-describedby={idMsg}
          placeholder="voce@email.com"
          className="min-h-12 flex-1 rounded-full border border-linha bg-fundo px-5 text-base placeholder:text-texto-suave/60 focus:border-acento focus:outline-none aria-invalid:border-status-ultimas"
        />
        <Button type="submit" variant="secondary" loading={estado === 'enviando'}>
          {estado === 'enviando' ? N.sending : N.submit}
        </Button>
      </div>
      <p id={idMsg} role="status" className={`mt-3 min-h-5 text-sm ${problema ? 'text-status-ultimas' : 'text-status-disponivel'}`}>
        {mensagem}
      </p>
    </form>
  )
}
