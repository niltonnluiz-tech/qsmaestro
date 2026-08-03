# Projeto MAESTTRO para Wix

Este pacote contem duas opcoes:

1. `maesttro-home-wix-embed.html`
   - Arquivo unico, com CSS, JS e imagens embutidos.
   - Abra o arquivo, copie todo o codigo e cole no Wix em: Add Elements > Embed Code > Embed HTML.
   - Recomendado para testar a HOME rapidamente dentro do Wix.

2. `codigo-completo-multiarquivo/`
   - Projeto completo em arquivos separados: HTML, CSS, JS e assets.
   - Use se for hospedar fora do Wix ou se for adaptar com Velo/Wix Studio.

Limitacoes no Wix Embed:

- O Wix Embed funciona como iframe.
- Links para paginas separadas, admin real, uploads persistentes e login seguro precisam ser implementados com Wix Velo ou, preferencialmente, Supabase/backend.
- O prototipo usa localStorage, suficiente para demonstracao, mas nao para producao real.

Arquivos principais:

- HOME Wix: `maesttro-home-wix-embed.html`
- Projeto completo: `codigo-completo-multiarquivo/index.html`
- Admin: `codigo-completo-multiarquivo/admin.html`
- Contrato: `codigo-completo-multiarquivo/contrato.html`
- Quem somos: `codigo-completo-multiarquivo/quem-somos.html`
