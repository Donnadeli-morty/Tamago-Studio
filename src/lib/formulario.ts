import * as z from 'zod/mini'

// Validação que roda no navegador: usa o zod/mini (poucos KB) em vez do Zod completo.
/** Formulário "avise-me do próximo drop" (NotifyForm). */
export const EmailDrop = z.object({ email: z.email() })
