import type { SVGProps } from 'react'

// Ícones inline (sem lib externa): traço 1.75, herdam a cor do texto.
const caminhos = {
  whatsapp: (
    <path
      fill="currentColor"
      stroke="none"
      d="M12 2.2a9.7 9.7 0 0 0-8.4 14.6L2.2 21.8l5.1-1.3A9.7 9.7 0 1 0 12 2.2Zm0 17.7c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 19.9Zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.8 1c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 0 0-.7.3 2.8 2.8 0 0 0-.9 2.1 4.9 4.9 0 0 0 1 2.6 11.2 11.2 0 0 0 4.3 3.8c1.6.7 2.2.7 3 .6.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1l-.5-.3Z"
    />
  ),
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </>
  ),
  seta: <path d="M5 12h14m-5-5 5 5-5 5" />,
  fechar: <path d="M6 6l12 12M18 6 6 18" />,
  anterior: <path d="m15 5-7 7 7 7" />,
  proxima: <path d="m9 5 7 7-7 7" />,
  menu: <path d="M4 7h16M4 12h16M4 17h10" />,
  mais: <path d="M12 5v14M5 12h14" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  chama: (
    <path d="M12 3c.5 3-2.5 4.5-2.5 8a2.5 2.5 0 0 0 5 0c0-1-.5-1.8-.5-1.8S17 11 17 15a5 5 0 0 1-10 0c0-5 5-7 5-12Z" />
  ),
  pincel: (
    <path d="M14.5 4.5 19.5 9.5 11 18l-5-5 8.5-8.5ZM6 13l-2 2.5c-.8 1-.5 3.5-.5 3.5s2.5.3 3.5-.5L9.5 16" />
  ),
  sino: <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16Zm4 4a2 2 0 0 0 4 0" />,
  cubo: <path d="M12 3 20 7.5v9L12 21l-8-4.5v-9L12 3Zm0 0v0M4 7.5l8 4.5 8-4.5M12 12v9" />,
  regua: <path d="M4 15 15 4l5 5L9 20l-5-5Zm4-3 2 2m1-5 2 2m1-5 2 2" />,
  caixa: <path d="M3 8 12 3l9 5v8l-9 5-9-5V8Zm0 0 9 5 9-5M12 13v8" />,
  wifi: <path d="M2 2l20 20M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 5-2.7M19 13a10 10 0 0 0-2.5-1.8M2 9a15 15 0 0 1 4.5-2.8M22 9a15 15 0 0 0-11-3.9M12 20h0" />,
  imagem: <path d="M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5M15 9h0" />,
} as const

export type NomeIcone = keyof typeof caminhos

export function Icon({ nome, ...props }: { nome: NomeIcone } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {caminhos[nome]}
    </svg>
  )
}
