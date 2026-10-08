import { createContext, useContext } from 'react'

type Rolagem = {
  /** Rola até um seletor (#obras) respeitando o header fixo e o reduced motion. */
  rolarPara: (alvo: string) => void
  /** Trava/destrava a rolagem da página (ex.: com o ProductSheet aberto). */
  travar: (travado: boolean) => void
}

export const RolagemContexto = createContext<Rolagem>({ rolarPara: () => {}, travar: () => {} })

export function useRolagem() {
  return useContext(RolagemContexto)
}
