# SPEC-DRIVEN — Landing Page de Conversão · TAMAGO Figures

> **Versão:** 1.0 · **Status:** Aguardando aprovação (Fase 0) · **Data:** 05/10/2026
> **Escopo desta versão:** Framework + Especificações de UX.
> **Fora do escopo (a adaptar depois):** paleta de cores, logo, referências visuais, copy final.
> **Nome de trabalho:** TAMAGO (provisório) · Instagram: @tamagofigures

---

## 0. Decisões já tomadas

| Decisão | Definição |
|---|---|
| Modelo de venda | **Híbrido:** algumas figures **pronta entrega** + outras **sob encomenda** |
| Logística | **Envio** para todo o Brasil (sem retirada como fluxo principal) |
| Catálogo | Sim, galeria de peças com status individual por figure |
| Checkout | **Sem e-commerce/gateway nesta fase.** Conversão via WhatsApp (`wa.me`) com mensagem dinâmica |
| Backend | Nenhum. Dados em JSON estático |
| Hospedagem alvo | Hostinger (hPanel), build estático `dist/` |

---

## 1. Project Overview

| Item | Definição |
|---|---|
| **Propósito** | Converter visitantes (principalmente do Instagram) em conversas no WhatsApp para compra ou encomenda |
| **Público-alvo** | Colecionadores de figures (games, anime, cultura pop), presenteadores e fãs de arte física |
| **Diferencial** | Detalhe de resina 16K, pintura artesanal, base assinada ("Obrigado" + nome do comprador); a peça tratada como **arte de coleção** |
| **Conversão primária** | Clique em "Pedir no WhatsApp" com mensagem pré-preenchida contendo o nome da figure |
| **Conversão secundária** | Seguir @tamagofigures · entrar na lista "avise-me do próximo drop" |
| **Tom** | Premium, artístico, próximo. Arte primeiro, venda depois |

---

## 2. Arquitetura de Informação

### 2.1 Sitemap (single page, 9 seções, fluxo AIDA)

```
01 HEADER ............ sticky, CTA persistente
02 HERO .............. Atenção: figure em destaque + promessa + CTA
03 OBRAS (galeria) ... Interesse: grid filtrável com status por peça
04 PROCESSO .......... Interesse: resina 16K → pintura → assinatura
05 DETALHE / ZOOM .... Desejo: macro da peça, escala real, base assinada
06 COMO PEDIR ........ Desejo: 3 passos, separa pronta entrega x encomenda
07 PROVA SOCIAL ...... Confiança: fotos de clientes (UGC), depoimentos
08 FAQ ............... Objeções: prazo, frete, pintura, personalização
09 CTA FINAL+FOOTER .. Ação: WhatsApp + Instagram + lista de drops
```

### 2.2 Jornada do usuário (mobile-first; ~85% do tráfego vem do Instagram)

```
Instagram (bio/story)
   → Hero (entende em 3s)
   → Rola a galeria
   → Abre uma peça (ProductSheet)
   → "Quero esta" → WhatsApp com mensagem pronta
```

**Meta:** no máximo **2 toques** da peça até o WhatsApp.

### 2.3 Dois fluxos de compra (modelo híbrido)

| Status da peça | CTA exibido | Mensagem WhatsApp | Informação mostrada |
|---|---|---|---|
| `disponivel` (pronta entrega) | **Quero esta** | "Oi! Vi a figure *{nome}* (pronta entrega) e quero comprar." | Prazo de envio (ex.: despacho em X dias úteis) |
| `ultimas` | **Garantir a minha** | idem + "últimas unidades" | Badge de escassez + estoque restante |
| `encomenda` | **Encomendar** | "Oi! Quero encomendar a figure *{nome}*." | Prazo de produção + envio |
| `esgotado` | **Avise-me quando voltar** | "Oi! Quero ser avisado quando a *{nome}* voltar." | Selo "Esgotado" |

---

## 3. Especificações de UX

### 3.1 Princípios

1. **A peça é a heroína.** UI minimalista que não compete com o produto.
2. **CTA sempre a um polegar de distância** (mobile).
3. **Escassez honesta** ("3 de 5 disponíveis"), nunca falsa.
4. **Zero fricção:** sem cadastro, sem formulário longo.
5. **Clareza de prazo.** Pronta entrega e encomenda precisam ser inconfundíveis a olho.
6. **Performance é UX.** Imagens pesadas em site de arte quebram a conversão.

### 3.2 Wireframes (mobile-first)

**Hero**
```
┌──────────────────────────────┐
│ ☰   TAMAGO       [WhatsApp]  │  ← sticky
├──────────────────────────────┤
│                              │
│       [ FIGURE HERO ]        │  ← imagem/vídeo/3D (slot)
│       rotação ao scroll      │
│                              │
│   {HEADLINE — slot}          │  ← H1
│   Figures em resina 16K,     │
│   pintadas à mão.            │
│                              │
│   [ Ver as obras ]           │  ← CTA secundário
│   [ Pedir no WhatsApp ]      │  ← CTA primário
│   ● {N} peças prontas p/ envio│  ← escassez real
└──────────────────────────────┘
```

**Galeria "Obras"**
```
┌──────────────────────────────┐
│ [Todas][Pronta entrega]      │
│ [Encomenda][Games][Anime]    │  ← chips de filtro (scroll horizontal)
│ ┌──────────┐ ┌──────────┐    │
│ │  foto    │ │  foto    │    │
│ │  Lucia   │ │  Link    │    │
│ │ ● Pronta │ │ ◐ Encom. │    │
│ └──────────┘ └──────────┘    │
└──────────────────────────────┘
          clique → ProductSheet
```

**ProductSheet (bottom sheet no mobile / modal no desktop)**
```
┌──────────────────────────────┐
│ [ carrossel 4–6 fotos ]      │
│ Nome · Altura · Material     │
│ Status: Pronta entrega       │
│ Envio: despacho em X dias    │
│ ou                           │
│ Status: Sob encomenda        │
│ Produção: ~X dias + envio    │
│ [ Quero esta → WhatsApp ]    │
└──────────────────────────────┘
```

**Como Pedir**
```
① Escolha a peça → ② Chame no WhatsApp → ③ Receba em casa, assinada
   (pronta entrega: envio rápido · encomenda: produzimos para você)
```

### 3.3 Padrões de conversão

| Elemento | Especificação |
|---|---|
| **CTA primário** | Sempre visível: barra sticky inferior (mobile), pill no header (desktop) |
| **Mensagem WhatsApp** | `https://wa.me/55XXXXXXXXXXX?text=` + texto via `encodeURIComponent`, variando por `status` (ver 2.3) |
| **Escassez** | Vem do campo `stock` no JSON, editado manualmente. Esgotado vira "Avise-me" |
| **Prova social** | Priorizar fotos de clientes (UGC) sobre texto |
| **Detalhe assinado** | Seção dedicada à base com "Obrigado" + espaço para o nome do comprador |
| **Microcopy** | Verbos de ação ("Quero esta", "Encomendar"), nunca "Enviar" |

### 3.4 FAQ (objeções obrigatórias)

- Qual a diferença entre **pronta entrega** e **encomenda**?
- Prazo de produção e de envio
- Frete: como é calculado, quais regiões, embalagem
- A pintura está inclusa?
- Posso personalizar a peça (cor, nome na base)?
- Como a peça chega protegida (embalagem anti-impacto)?
- Cuidados com a figure (luz solar, limpeza)
- Formas de pagamento (a combinar no WhatsApp)

### 3.5 Estados de interface a cobrir

Carregando (skeleton nas imagens) · Vazio (filtro sem resultado) · Erro (imagem falhou) · Offline · Esgotado · Foco por teclado · Reduced motion.

---

## 4. Matriz de Componentes

| Componente | Props principais | Estados | Variações |
|---|---|---|---|
| `Button` | `variant`, `size`, `href`, `trackId` | idle · hover · active · focus-visible · disabled · loading | primary · secondary · ghost |
| `StickyCTA` | `label`, `message` | visível · oculto (no hero) · pressionado | mobile bar · desktop pill |
| `Header` | `links[]` | transparente · sólido (pós-scroll) · menu aberto | mobile · desktop |
| `Hero` | `title`, `subtitle`, `media`, `readyCount` | loading · ready · reduced-motion | imagem · vídeo · frames |
| `FilterChips` | `options[]`, `active` | idle · active · focus | scroll horizontal no mobile |
| `ProductCard` | `figure` | idle · hover · esgotado | grande · normal |
| `ProductSheet` | `figure`, `onClose` | fechado · abrindo · aberto | modal (desktop) · bottom sheet (mobile) |
| `ImageCarousel` | `images[]`, `alt[]` | idle · arrastando · zoom | swipe · setas |
| `StatusBadge` | `status`, `stock?` | disponível · últimas · encomenda · esgotado | |
| `ProcessStep` | `index`, `title`, `media` | idle · in-view | |
| `Testimonial` | `author`, `photo`, `text` | idle | foto · texto |
| `FAQItem` | `q`, `a` | fechado · aberto | acordeão |
| `WhatsAppLink` | `phone`, `figure?`, `status?` | idle · hover | genérico · por peça |
| `NotifyForm` | `onSubmit` | idle · enviando · sucesso · erro | validado com Zod |

### 4.1 Modelo de dados (validado com Zod)

```ts
const Figure = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  universe: z.enum(['games', 'anime', 'autoral', 'outros']),
  heightCm: z.number().positive(),
  status: z.enum(['disponivel', 'ultimas', 'encomenda', 'esgotado']),
  stock: z.number().int().nonnegative().optional(),      // só p/ pronta entrega
  shipDays: z.number().int().optional(),                 // despacho (pronta entrega)
  leadTimeDays: z.number().int().optional(),             // produção (encomenda)
  featured: z.boolean().default(false),
  model3d: z.string().optional(),                        // .glb (peças-destaque)
  images: z.array(z.object({
    src: z.string(), alt: z.string(),
    w: z.number(), h: z.number(),
  })).min(1),
});
```

Dados em `src/data/figures.json`. Textos, telefone e links em `src/data/site.json`. **Nada fixo no código.**

---

## 5. Stack e Framework

| Camada | Escolha | Alternativa 1 | Alternativa 2 | Justificativa |
|---|---|---|---|---|
| **Bundler** | Vite (última estável) | Astro | Next.js | SPA estática, deploy simples na Hostinger. Astro se SEO/zero-JS for prioridade |
| **UI** | React 19 + TypeScript strict | Vue 3.5 | Svelte 5 | Padrão consolidado nos seus projetos |
| **Estilo** | Tailwind CSS 4 (`@theme`) | CSS Modules | vanilla-extract | Tokens centralizados: trocar paleta = editar 1 arquivo |
| **Animação** | GSAP 3 + ScrollTrigger | Motion | Anime.js | Timelines e scrub |
| **Scroll** | Lenis | Locomotive Scroll v5 | nativo | Leve e mantido |
| **3D (peças-destaque)** | `<model-viewer>` | React Three Fiber | Spline embed | Mais leve e seguro; R3F só para efeitos customizados |
| **Validação** | Zod | Valibot | ArkType | Catálogo e formulários |
| **Testes** | Vitest + Testing Library | Playwright (E2E) | — | Unidade + fluxo do CTA |
| **Pacotes** | pnpm | npm | — | Lockfile seguro |
| **Qualidade** | ESLint flat config + Prettier | Biome | — | |

> **Nota 3D:** com o arquivo da figure (STL → GLB) dá para oferecer um **visualizador interativo** (gira a peça com o dedo). Recomendação para a v1: foto em todas as peças + modelo 3D em **1–2 peças-destaque**.

### 5.1 Segurança e manutenção

- Renovate ou Dependabot ativo + `pnpm audit` no CI.
- Critério de libs: mantenedor ativo, commits < 6 meses, licença MIT/Apache.
- CSP restritiva; nenhum script de terceiros além do analytics.
- Sem dados pessoais armazenados: `NotifyForm` usa `mailto:` ou serviço externo (Formspree/Web3Forms).
- Sempre `encodeURIComponent` em qualquer texto que entre na URL do `wa.me`.
- Ativar HTTPS e headers de segurança no hPanel.

---

## 6. Performance (Core Web Vitals, mobile 4G)

| Métrica | Meta |
|---|---|
| LCP | < 2.5s (alvo prático < 2.0s) |
| INP | < 200ms (substitui o FID) |
| CLS | < 0.1 |
| JS inicial | < 150 KB gzip |
| Peso do hero | < 250 KB |

### 6.1 Plano de mídia

- **Imagens:** AVIF (principal) + WebP (fallback) via `<picture>` com `srcset`/`sizes`.
- `width` e `height` explícitos em todas as imagens (zero CLS).
- Hero: `fetchpriority="high"`, sem lazy. Demais: `loading="lazy"` + `decoding="async"`.
- **Fotografia de produto:** fundo limpo e iluminação consistente. Pesa mais na conversão do que qualquer efeito.
- **Vídeo (opcional):** macro de 5–8s, AV1/VP9 + H.264 de fallback, `muted playsinline`, sem autoplay pesado.
- **Fontes:** máximo 2 famílias, `font-display: swap`, subset e preload.
- **Three.js / model-viewer:** import dinâmico, carregado só ao entrar na viewport.

---

## 7. Acessibilidade (WCAG 2.2 AA)

- [ ] Contraste ≥ 4.5:1 (texto) e 3:1 (UI) — validar ao definir a paleta
- [ ] `:focus-visible` em todos os interativos, ordem de tab lógica
- [ ] HTML semântico (`header/main/section/footer`), um único `h1`
- [ ] `alt` descritivo em cada foto (nome, material, detalhe)
- [ ] Modal com focus trap, `Esc` fecha, `aria-modal`, foco retorna ao gatilho
- [ ] Alvos de toque ≥ 44×44px (mínimo WCAG 2.2: 24px)
- [ ] `prefers-reduced-motion`: desliga parallax/scrub, mantém fade simples
- [ ] FAQ com `aria-expanded` e `aria-controls`
- [ ] Carrossel navegável por teclado, sem autoplay
- [ ] Status (pronta/encomenda/esgotado) nunca só por cor: sempre com texto/ícone

---

## 8. Plano de Animação (nível UX)

| Momento | Efeito | Duração / easing |
|---|---|---|
| Entrada do hero | Fade + leve scale da peça | 0.9s · `power3.out` |
| Scroll no hero | Rotação/parallax sutil (scrub) | `scrub: 1` |
| Cards da galeria | Stagger reveal ao entrar na viewport | 0.6s · stagger 0.08 |
| Hover no card (desktop) | Elevação + zoom 1.03 | 0.3s |
| Abrir ProductSheet | Slide-up (mobile) / fade-scale (desktop) | 0.4s · `power2.out` |
| Seção Processo | Reveal por etapa (pin opcional) | — |

**Regra:** a animação guia o olhar para o produto e o CTA; nunca atrasa o clique nem bloqueia o primeiro render.

---

## 9. Mensuração

Analytics leve (Plausible ou GA4). Eventos:

| Evento | Parâmetros |
|---|---|
| `cta_whatsapp_click` | `source` (hero / sticky / sheet / final), `figure`, `status` |
| `figure_open` | `figure`, `status` |
| `filter_used` | `filter` |
| `notify_submit` | — |
| `instagram_click` | `source` |
| `scroll_75` | — |

**Funil:** visitou → abriu peça → clicou no WhatsApp. Permite comparar conversão de **pronta entrega x encomenda** e descobrir quais figures atraem e quais vendem.

---

## 10. Estrutura do Projeto

```
tamago-landing/
├─ src/
│  ├─ app/                  (App.tsx, providers)
│  ├─ components/
│  │  ├─ ui/                (Button, Chip, StatusBadge...)
│  │  └─ sections/          (Hero, Gallery, Process, Faq...)
│  ├─ data/                 (figures.json, site.json)
│  ├─ lib/                  (whatsapp.ts, analytics.ts, schema.ts)
│  ├─ styles/               (tokens.css → @theme, global.css)
│  └─ assets/               (images/, models/)
├─ public/
├─ SPEC.md                  (este documento)
└─ package.json
```

---

## 11. Entregáveis de Build

- Código-fonte completo (zip)
- `dist/` pronto para upload na Hostinger (zip)
- Conteúdo placeholder claramente identificado (fotos, textos, telefone) para troca antes do lançamento

---

## 12. Roadmap de Execução

| Fase | Entrega |
|---|---|
| **0** | Aprovação desta spec |
| **1** | Design tokens (paleta/fontes como placeholders) + componentes base |
| **2** | Seções + dados (`figures.json`) + fluxo WhatsApp por status |
| **3** | Animações + visualizador 3D das peças-destaque |
| **4** | Auditoria (Lighthouse, a11y, testes) + build/deploy |

---

## 13. Pendências (para você adaptar depois)

- [ ] Paleta de cores e tokens
- [ ] Logo e identidade TAMAGO
- [ ] Referências visuais e direção de arte
- [ ] Headline, copy e tom de voz finais
- [ ] Número de WhatsApp oficial
- [ ] Prazos reais (despacho, produção) e política de frete
- [ ] Fotos profissionais das peças e arquivos GLB (destaques)
- [ ] Lista inicial de figures e status de cada uma
