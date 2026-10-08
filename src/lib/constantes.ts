// Listas fixas do domínio. Ficam fora do schema.ts para que os componentes
// possam usá-las sem levar o Zod completo para o bundle do navegador.
export const STATUS = ['disponivel', 'ultimas', 'encomenda', 'esgotado'] as const
export const UNIVERSOS = ['games', 'anime', 'autoral', 'outros'] as const
