// Gera os dois zips de entrega (spec §11) em entregas/:
//   tamago-dist-AAAA-MM-DD.zip    → conteúdo de dist/ (subir no public_html da Hostinger)
//   tamago-codigo-AAAA-MM-DD.zip  → código-fonte, sem node_modules/dist
//
// Usa o tar.exe do Windows (bsdtar), que grava os caminhos com barra "/".
// O Compress-Archive do PowerShell grava com "\" e o extrator do hPanel cria
// arquivos com barra no nome: o site sobe sem CSS/JS. Por isso a checagem no fim.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = fileURLToPath(new URL('..', import.meta.url))
const dist = join(raiz, 'dist')
const saida = join(raiz, 'entregas')
const data = new Date().toISOString().slice(0, 10)
// Caminho absoluto: no Git Bash, "tar" seria o GNU tar, que não gera zip
const TAR = process.platform === 'win32' ? join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'tar.exe') : 'tar'

if (!existsSync(join(dist, 'index.html'))) {
  console.error('dist/ não existe. Rode `pnpm build` antes.')
  process.exit(1)
}
if (!existsSync(join(dist, '.htaccess'))) {
  console.error('dist/.htaccess sumiu: confira public/.htaccess.')
  process.exit(1)
}
mkdirSync(saida, { recursive: true })

const zipDist = join(saida, `tamago-dist-${data}.zip`)
const zipCodigo = join(saida, `tamago-codigo-${data}.zip`)
for (const z of [zipDist, zipCodigo]) rmSync(z, { force: true })

// Conteúdo de dist/ na RAIZ do zip (sem a pasta dist/ e sem prefixo "./")
execFileSync(TAR, ['-a', '-c', '-f', zipDist, '-C', dist, ...readdirSync(dist)], { stdio: 'inherit' })

const arquivosCodigo = [
  'src', 'public', 'scripts', 'media', 'copy', 'index.html', 'package.json', 'pnpm-lock.yaml',
  'vite.config.ts', 'tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json',
  'eslint.config.js', '.prettierrc.json', '.gitignore', 'README.md', 'DEPLOY.md', 'SPEC.md',
].filter((x) => existsSync(join(raiz, x)))
// Enquanto media/ só tiver fotos provisórias (marcador criado pelo `pnpm placeholders`),
// elas ficam fora do zip: pesam dezenas de MB e são recriadas com
// `pnpm placeholders && pnpm imagens`. Fotos reais entram normalmente.
const soProvisorias = existsSync(join(raiz, 'media/originais/.provisorio'))
const excluir = soProvisorias ? ['--exclude=media', '--exclude=public/img'] : []
execFileSync(TAR, ['-a', '-c', '-f', zipCodigo, ...excluir, '-C', raiz, ...arquivosCodigo], { stdio: 'inherit' })
if (soProvisorias) console.log('Fotos provisórias fora do zip do código (recrie com pnpm placeholders && pnpm imagens).')

// Trava de segurança: nenhuma entrada com barra invertida
for (const z of [zipDist, zipCodigo]) {
  const lista = execFileSync(TAR, ['-t', '-f', z], { encoding: 'utf8' })
  if (lista.includes('\\')) {
    console.error(`${z}: caminho com "\\" encontrado. NÃO suba este zip.`)
    process.exit(1)
  }
  if (z === zipDist && !/^index\.html$/m.test(lista)) {
    console.error('index.html não está na raiz do zip do dist.')
    process.exit(1)
  }
}
console.log(`\nOK:\n  ${zipDist}\n  ${zipCodigo}`)
