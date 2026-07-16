# MAESTTRO no Wix - instrucao para DEV

## Melhor opcao dentro do Wix

Use o arquivo:

`maesttro-home-wix-embed-leve.html`

Ele contem a HOME completa com HTML, CSS e JavaScript em um unico arquivo.

## Como subir no Wix

1. No Wix, abra a pagina onde o MAESTTRO deve aparecer.
2. Adicione um elemento: `Embed Code` > `Embed HTML`.
3. Abra o arquivo `maesttro-home-wix-embed-leve.html`.
4. Copie todo o codigo.
5. Cole no campo de HTML do Wix.
6. Ajuste o tamanho do iframe para ocupar a largura da pagina.

## Imagens

Antes de publicar, suba estes arquivos da pasta `codigo-completo-multiarquivo/assets/` no Media Manager do Wix:

- `capa-quartetto-serenatta.jpeg`
- `celebration-light.png`
- `ceremony-garden.png`
- `logo-transparent.png`
- `logo_basic.png`
- `music-details.png`
- `quartetto-performance.png`
- `quartetto-real.jpg`

Depois, substitua no arquivo `maesttro-home-wix-embed-leve.html` as ocorrencias de:

- `./assets/capa-quartetto-serenatta.jpeg`
- `./assets/celebration-light.png`
- `./assets/ceremony-garden.png`
- `./assets/logo-transparent.png`
- `./assets/logo_basic.png`
- `./assets/music-details.png`
- `./assets/quartetto-performance.png`
- `./assets/quartetto-real.jpg`

pelas URLs publicas geradas pelo Wix.

## Arquivo auto-contido

Tambem existe o arquivo:

`maesttro-home-wix-embed.html`

Ele ja contem as imagens embutidas em base64, mas ficou muito pesado. Use apenas se o Wix aceitar o tamanho. A versao leve e mais indicada.

## Projeto completo

A pasta `codigo-completo-multiarquivo/` contem o projeto inteiro com:

- `index.html`
- `admin.html`
- `quem-somos.html`
- `contrato.html`
- `styles.css`
- `app.js`
- `contrato.js`
- assets

Essa pasta e melhor para Vercel/Netlify ou para um dev adaptar em Wix Velo.

## Observacao importante

O Embed HTML do Wix roda como iframe. Para login admin real, cadastro de clientes, uploads persistentes, videos, musicas, agenda e contratos, a implementacao final deve usar Wix Velo ou Supabase/backend.
