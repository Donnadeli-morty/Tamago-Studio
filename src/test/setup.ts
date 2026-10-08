import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => cleanup())

// jsdom não implementa estas APIs de navegador; os testes simulam o básico.
// Reduced motion ligado: os testes não dependem de animação.
window.matchMedia = vi.fn((query: string) => ({
  matches: query.includes('reduce'),
  media: query,
  onchange: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  addListener: vi.fn(),
  removeListener: vi.fn(),
  dispatchEvent: vi.fn(),
})) as unknown as typeof window.matchMedia

class IO {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = () => []
}
window.IntersectionObserver = IO as unknown as typeof IntersectionObserver

Element.prototype.scrollTo = vi.fn() as never
window.scrollTo = vi.fn() as never

if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true
  }
  HTMLDialogElement.prototype.close = function () {
    this.open = false
  }
}
