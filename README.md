# TAMAGO Figures · landing page

Landing de conversão para figures em resina 16K. Leva quem vem do Instagram até
o WhatsApp com a mensagem pronta, no máximo 2 toques depois de escolher a peça.
Especificação completa em [SPEC.md](SPEC.md).

**Stack:** Vite + React 19 + TypeScript strict · Tailwind CSS 4 · GSAP/ScrollTrigger + Lenis ·
`<model-viewer>` (3D sob demanda) · Zod · Vitest. Site 100% estático, sem backend.

## Comandos

| Comando | O que faz |
|---|---|
| `pnpm dev` | Servidor local em http://localhost:5173 |
| `pnpm build` | Valida os JSONs, gera `dist/` e pré-renderiza o HTML |
| `pnpm preview` | Serve o `dist/` para conferir o build |
| `pnpm test` | Testes (dados, mensagens do WhatsApp, fluxo peça → ficha → CTA) |
| `pnpm lint` | ESLint |
| `pnpm imagens` | Converte as fotos de `media/originais/` em AVIF + WebP |
| `pnpm placeholders` | Recria as fotos provisórias |
| `pnpm empacotar` | Gera os zips de entrega em `entregas/` (rodar depois do build) |

> Não rode `pnpm build` com o `pnpm dev` aberto na mesma pasta.

## Onde editar (nada de conteúdo fica no código)

| Quero mudar… | Arquivo |
|---|---|
| Peças, status, estoque, prazos, fotos | `src/data/figures.json` |
| Textos, telefone do WhatsApp, mensagens, FAQ, depoimentos, links | `src/data/site.json` |
| Cores e fontes | `src/styles/tokens.css` (o teste `contraste.test.ts` reprova cor sem contraste AA) |
| Título/descrição para Google e compartilhamento | `index.html` |
| Segurança (CSP), HTTPS e cache no servidor | `public/.htaccess` |

Os dois JSONs são conferidos pelo schema (`src/lib/schema.ts`) no `dev`, no `build` e nos testes.
Um campo errado (ex.: `"status": "promocao"`) **derruba o build** com a linha do problema:

```
Dados inválidos:
  figures.json → 0.status: Invalid option: expected one of "disponivel"|"ultimas"|"encomenda"|"esgotado"
```

### Status de uma peça

| `status` | Selo | Botão | Mensagem no WhatsApp |
|---|---|---|---|
| `disponivel` | Pronta entrega | Quero esta | "…(pronta entrega) e quero comprar." |
| `ultimas` | Últimas unidades · Restam N | Garantir a minha | "…(pronta entrega, últimas unidades)…" |
| `encomenda` | Sob encomenda | Encomendar | "Quero encomendar a figure…" |
| `esgotado` | Esgotado | Avise-me quando voltar | "Quero ser avisado quando… voltar." |

- `stock` é o número real em estoque. A escassez exibida vem só dele, nunca é inventada.
- `editionSize` (opcional) é o tamanho da tiragem e gera o "3 de 5 disponíveis".
- `shipDays` é o prazo de despacho (pronta entrega); `leadTimeDays`, o de produção (encomenda).
- `featured: true` destaca a peça. A primeira peça-destaque vira o card grande da galeria.

### Link direto para uma peça

`https://seudominio.com.br/#obra/ronin-do-crepusculo` abre a página com a ficha da peça.
Serve para story, bio e respostas no direct. O botão voltar do celular fecha a ficha.

## Estrutura da loja (07/10/2026)

O site virou uma loja com pedido pelo WhatsApp (sem carrinho nem pagamento online), no modelo da WPrime/JPC. Cada página é um HTML pré-renderizado próprio:

| Endereço | Página |
|---|---|
| `/` | Vitrine: hero (o chamariz), destaques, universos, atalho para o processo, como pedir, dúvidas |
| `/figures/` | Catálogo: abas de universo, busca, disponibilidade, tamanho, preço, ordenação. Os filtros ficam na URL (`/figures/?universo=anime&disponibilidade=pronta`), então o link filtrado pode ser compartilhado |
| `/figures/<slug>/` | Página da figure: fotos/3D, preço, estoque real, prazo, nome na base (vai na mensagem), ficha técnica, relacionadas, dados estruturados de produto para o Google |
| `/como-e-feita/` | Como nasce uma figure: processo, detalhes de perto, fotos de clientes |
| `/404.html` · `/sitemap.xml` | Gerados no build |

**Adicionar uma figure:** copie um bloco em `src/data/figures.json`, troque `id`, `slug` (vira o endereço), `name`, `universe`, `heightCm`, `status`, `price` (reais, inteiro), `addedAt` (AAAA-MM-DD) e as fotos. Ela aparece sozinha no catálogo, nas contagens, nos relacionados, no sitemap e ganha página própria no próximo `pnpm build`.

**Preços:** os atuais são **provisórios** e aparecem marcados assim na tela. Com os preços reais no JSON, mude `catalog.pricesPlaceholder` para `false` em `site.json`.

**Domínio:** troque `seo.siteUrl` em `site.json` (canonical, Open Graph, sitemap e robots.txt usam ele).

## Identidade visual (logo oficial, 06/10/2026)

A logo é um ovo de cristal sobre linho, com dois filhotes de dragão (um azul, um preto de asa vermelha). Ela define a paleta:

- **Dois temas, os mesmos tokens** (`src/styles/tokens.css`): **Dia** é o padrão (linho avermelhado, tinta ameixa) e **Noite** é o escopo `.tema-noite`, usado no hero como uma janela noturna arredondada sobre o linho.
- **Regra dos dois dragões:** azul (`acento`) só na ação (botões de WhatsApp, foco); vermelho (`brasa`, `chama`) no destaque (sobretítulos, números, passos, divisores, hover, filete do rodapé).
- **Logo:** gerada por `node scripts/marca.mjs` a partir de `media/marca/logo-original.webp` (fundo de linho vira transparência). Saída em `public/img/marca/` e `public/favicon.png`. Componentes: `Marca` (palavra), `Emblema` (ovo), `Lockup` (completa), em `src/components/ui/Marca.tsx`. Só sobre áreas claras.
- **Fontes:** Cinzel nos títulos, Nunito no texto, Caveat nas notas a giz.
- O teste `src/styles/contraste.test.ts` confere o contraste AA dos dois temas.
- Design system no Claude Design: https://claude.ai/artifact/3Gh7LzYC9hGfMj1kL1MjMi

## Copy

A revisão de texto (skill super-copy) está em `copy/relatorio-copy.html`: cada troca com antes, depois e motivo.
Regra que vale para qualquer edição futura: **nenhuma prova inventada**. Depoimento, número ou garantia só entra se for real.

## Fotos

1. Coloque as fotos em `media/originais/`, nas mesmas pastas e com o mesmo nome do `src` no JSON:
   `"src": "/img/obras/ronin-do-crepusculo-frente"` → `media/originais/obras/ronin-do-crepusculo-frente.jpg`
2. Apague `media/originais/.provisorio` quando as fotos forem reais.
3. `pnpm imagens`: gera 480/800/1200 px em AVIF e WebP em `public/img/` e mostra o tamanho de cada original.
4. Ajuste `w` e `h` no JSON para a proporção real da foto (evita "pulo" de layout).

A foto do hero também é pré-carregada no `<head>` do `index.html`. Se trocar o caminho do hero, troque lá também.

Na base assinada da seção "De perto", o texto digitado aparece sobre a foto em `detail.baseTextTop`
(% da altura). Ajuste esse valor com a foto real.

## Modelo 3D (peças-destaque)

Exporte o STL para `.glb` (Blender: *File → Export → glTF Binary*, com Draco se possível),
coloque em `public/models/` e preencha `"model3d": "/models/nome.glb"` na peça. O slide
"3D" aparece sozinho no carrossel. O visualizador (~290 KB) só é baixado quando a pessoa chega nesse slide.

## Analytics

Em `site.json → analytics`: `"provider": "plausible"` + `plausibleDomain`, ou `"ga4"` + `ga4Id`.
Eventos (spec §9): `cta_whatsapp_click` (source, figure, status), `figure_open`, `filter_used`,
`notify_submit`, `instagram_click`, `scroll_75`. No dev, os eventos aparecem no console.

## Lista "avise-me do próximo drop"

Sem `notify.endpoint`, o formulário abre o app de e-mail da pessoa (mailto). Para receber
os e-mails numa planilha/painel, crie um formulário no Formspree e cole a URL em `notify.endpoint`.
O site não guarda nenhum dado pessoal.

## Antes de lançar (pendências da spec §13)

- [ ] Telefone oficial em `whatsapp.phone` (hoje é `5511999999999`)
- [ ] Fotos reais (todas as imagens marcadas "FOTO PROVISÓRIA") e `.glb` das peças-destaque
- [ ] Lista real de figures, status, estoque e prazos em `figures.json`
- [ ] Prazos, frete, embalagem e versão sem pintura no FAQ (itens marcados `[PROVISÓRIO]`)
- [ ] Depoimentos e fotos de clientes reais (trocar `"placeholder": true` por `false`)
- [ ] Logo oficial (hoje a marca é texto em `src/components/ui/Marca.tsx`; favicon provisório em `public/favicon.svg`)
- [ ] Headline e copy finais; título, descrição e imagem de compartilhamento no `index.html`
- [ ] E-mail de contato em `notify.mailto` e texto legal do rodapé
- [ ] Analytics configurado

## Decisões além da spec

- **Pré-renderização no build** (`scripts/prerender.mjs`): o HTML chega pronto e o React só hidrata.
  Ganha LCP e SEO sem precisar de servidor.
- **Zod só no build/testes** e `zod/mini` no navegador, para o formulário. O bundle inicial ficou em 141 KB gzip (meta: 150).
- **Entrada do hero em CSS** em vez de GSAP: a animação começa na primeira pintura, sem esperar o JS.
- **Três famílias de fonte** (a spec pede no máximo 2): a Caveat das anotações não é pré-carregada e só aparece abaixo da primeira dobra no celular.
- **ESLint flat config** no lugar do oxlint que vem no template do Vite, como pede a spec.
- **Campos extras opcionais** no schema: `editionSize`, `material` e `description` na peça; `baseTextTop` na seção de detalhe.
- **Imagens em `public/img/`** (e não em `src/assets/`), porque o JSON referencia o caminho por texto.
