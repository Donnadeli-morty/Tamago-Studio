# Deploy na Hostinger (hPanel)

O site é estático: não precisa de Node no servidor. O que vai para a Hostinger é o
conteúdo da pasta `dist/`.

## 1. Gerar o pacote

```bash
pnpm build
pnpm empacotar
```

Saída em `entregas/`:

- `tamago-dist-AAAA-MM-DD.zip`: é este que sobe para o servidor
- `tamago-codigo-AAAA-MM-DD.zip`: backup do código-fonte

**Não compacte o `dist/` pelo Explorer nem pelo `Compress-Archive`.** Os dois gravam
os caminhos com `\`, e o extrator do hPanel cria arquivos chamados `assets\index.js`
em vez da pasta `assets/`: o site sobe sem CSS nem JS. O `pnpm empacotar` grava
com `/` e confere isso antes de terminar.

## 2. Subir

1. hPanel → **Sites** → seu domínio → **Gerenciador de Arquivos** → `public_html`
2. Apague o `default.php`/`index.php` de exemplo, se existir
3. **Upload** do `tamago-dist-….zip` → botão direito → **Extract** dentro de `public_html`
4. Confira: `public_html/index.html`, `public_html/.htaccess`, `public_html/assets/`, `public_html/img/`
   (o `.htaccess` começa com ponto; ative "mostrar arquivos ocultos" se não aparecer)
5. Apague o zip do servidor

## 3. HTTPS e cabeçalhos

1. hPanel → **Segurança → SSL**: instalar o certificado (gratuito) antes de tudo.
   O `.htaccess` redireciona HTTP → HTTPS e `www` → sem `www`.
2. Se o domínio oficial for **com** `www`, inverta a regra no `public/.htaccess` antes do build.
3. Ativando Plausible/GA4 ou o Formspree, os domínios já estão liberados na CSP do `.htaccess`.
   Outro serviço externo precisa entrar lá, senão o navegador bloqueia.

## 4. Conferir depois de publicar

- [ ] Abrir no celular pelo link da bio do Instagram
- [ ] Clicar em uma peça → botão → WhatsApp abre com o nome da figure na mensagem
- [ ] `https://dominio/#obra/<slug>` abre direto a ficha
- [ ] [PageSpeed Insights](https://pagespeed.web.dev/) na URL publicada: meta LCP < 2,5 s, CLS < 0,1, INP < 200 ms
- [ ] [securityheaders.com](https://securityheaders.com/) mostrando os cabeçalhos do `.htaccess`
