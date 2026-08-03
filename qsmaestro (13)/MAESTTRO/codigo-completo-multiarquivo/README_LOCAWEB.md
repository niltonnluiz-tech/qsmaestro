# Publicar o MAESTTRO na Locaweb

Este guia cobre a hospedagem compartilhada da Locaweb (Apache + FTP/Gerenciador de Arquivos).

## Cenario recomendado: subdominio

Dominio principal: `campsantoandre.org.br` (site institucional)
Subdominio do MAESTTRO: `maesttro.campsantoandre.org.br`

Alternativas validas: `app.campsantoandre.org.br` ou `plataforma.campsantoandre.org.br`

---

## Passo 1 — Criar o subdominio no painel Locaweb

1. Acesse https://painel.locaweb.com.br
2. Abra **Hospedagem de Sites**
3. Selecione **campsantoandre.org.br**
4. Va em **Dominios** ou **Subdominios** (nome pode variar no painel)
5. Clique em **Criar subdominio**
6. Informe: `maesttro`
7. Confirme a criacao

A Locaweb criara uma pasta para o subdominio. Os nomes mais comuns sao:

- `public_html/maesttro/`
- `maesttro.campsantoandre.org.br/`

Anote qual pasta o painel indicou — e nela que os arquivos devem ir.

---

## Passo 2 — Enviar os arquivos

Envie **todo o conteudo desta pasta** para a pasta do subdominio (nao para a raiz do dominio principal):

```
public_html/maesttro/          ← exemplo; use a pasta que o painel criou
├── .htaccess
├── index.html
├── admin.html
├── contrato.html
├── quem-somos.html
├── app.js
├── admin-auth.js
├── contrato.js
├── styles.css
└── assets/
    └── (todas as imagens)
```

Nao envie para `public_html/` se o site principal de `campsantoandre.org.br` deve continuar intacto.

Nao e necessario enviar `vercel.json`, `netlify.toml` nem `README_DEPLOY.md`.

### Via Gerenciador de Arquivos

1. Entre na pasta do subdominio (`maesttro/` ou equivalente)
2. Envie todos os arquivos do projeto
3. Confirme que `index.html` e `.htaccess` estao na raiz dessa pasta

### Via FTP (FileZilla / WinSCP)

| Campo  | Valor                              |
|--------|------------------------------------|
| Host   | `ftp.campsantoandre.org.br`        |
| Porta  | `21`                               |
| Pasta  | pasta do subdominio (ex.: `public_html/maesttro/`) |

Credenciais de FTP ficam no painel da Locaweb.

---

## Passo 3 — Ativar HTTPS no subdominio

No painel da Locaweb:

1. Va em **SSL / Certificado**
2. Ative o Let's Encrypt para `maesttro.campsantoandre.org.br`
3. Aguarde alguns minutos para propagar

---

## Passo 4 — Testar

| URL | Pagina |
|-----|--------|
| `https://maesttro.campsantoandre.org.br/` | Home / cliente |
| `https://maesttro.campsantoandre.org.br/admin` | Admin |
| `https://maesttro.campsantoandre.org.br/contrato` | Contrato |
| `https://maesttro.campsantoandre.org.br/quem-somos` | Institucional |

URLs com `.html` tambem funcionam (`/admin.html`, etc.).

---

## DNS (se o subdominio nao abrir)

Se o subdominio foi criado no painel mas ainda nao resolve, confira no painel de DNS da Locaweb:

| Tipo  | Nome     | Destino              |
|-------|----------|----------------------|
| A     | maesttro | IP da hospedagem     |
| CNAME | maesttro | campsantoandre.org.br|

A Locaweb costuma criar isso automaticamente ao cadastrar o subdominio. Se nao criar, adicione manualmente e aguarde ate 24h (geralmente minutos).

---

## Link do site principal para o MAESTTRO

No site de `campsantoandre.org.br`, adicione um botao ou link apontando para:

```
https://maesttro.campsantoandre.org.br/
```

Exemplo de HTML:

```html
<a href="https://maesttro.campsantoandre.org.br/" target="_blank" rel="noopener">
  Acessar plataforma MAESTTRO
</a>
```

---

## Observacoes

- O projeto usa caminhos relativos (`./assets/`, `./admin.html`) — funciona em subdominio sem alterar codigo.
- Este e um prototipo frontend: dados ficam no `localStorage` do navegador.
- A pasta `assets/` precisa estar completa para as imagens aparecerem.
- O login do admin nao e seguro para producao (credenciais no JavaScript).

## Problemas comuns

**Subdominio nao abre / DNS_PROBE_FINISHED_NXDOMAIN**
- Aguarde propagacao do DNS (ate 24h)
- Confira se o subdominio foi criado no painel Locaweb

**Pagina em branco ou erro 500**
- Verifique se o `.htaccess` foi enviado para a pasta do subdominio
- Se persistir, renomeie `.htaccess` para `.htaccess.bak` e teste com URLs `.html`

**Imagens quebradas**
- Confirme que a pasta `assets/` foi enviada junto com os demais arquivos

**Abre o site errado (dominio principal em vez do MAESTTRO)**
- Os arquivos provavelmente foram para `public_html/` em vez da pasta do subdominio
