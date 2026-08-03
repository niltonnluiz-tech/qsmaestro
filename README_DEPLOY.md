# Projeto MAESTTRO - Pacote de publicacao

Este pacote contem o front atual da plataforma MAESTTRO para o Quartetto Serenatta.

## Paginas

- `index.html`: experiencia do cliente
- `admin.html`: area administrativa do prototipo
- `quem-somos.html`: pagina institucional
- `contrato.html`: formulario para minuta de contrato
- `assets/`: imagens e logos

## Como publicar rapidamente

### Opcao recomendada para o prototipo: Vercel

1. Crie uma conta em https://vercel.com.
2. Suba esta pasta para um repositorio GitHub.
3. Na Vercel, clique em `Add New Project`.
4. Importe o repositorio.
5. Como este projeto e estatico, deixe o build vazio.
6. Publique.
7. Em `Settings > Domains`, adicione o dominio desejado.

Arquivos incluidos para Vercel:

- `vercel.json`: clean URLs e headers basicos de seguranca.

### Alternativa simples: Netlify

1. Crie uma conta em https://www.netlify.com.
2. Va em `Sites`.
3. Arraste esta pasta ou conecte o GitHub.
4. Configure o dominio em `Domain management`.

Arquivos incluidos para Netlify:

- `netlify.toml`: pasta de publicacao, redirects e headers basicos.

## Observacao importante sobre seguranca

Esta entrega e um front/prototipo navegavel. Ela pode ser publicada para validacao, apresentacao e teste comercial, mas ainda nao deve ser tratada como plataforma final segura.

Antes de producao real, o dev deve mover para backend:

- login do admin;
- cadastro de clientes;
- dados de leads;
- bloqueio de agenda;
- uploads de fotos, videos e MIDIs;
- valores de instrumentos;
- calculo de deslocamento, CEP e pedagios;
- pagamento com Mercado Pago;
- geracao e armazenamento da minuta de contrato.

## Stack sugerida para producao

- Frontend: Vercel com Next.js ou React.
- Banco, autenticacao e storage: Supabase.
- Pagamentos: Mercado Pago.
- Rotas, CEP e distancia: Google Maps Platform, Mapbox ou API brasileira de rotas/pedagios.
- Emails/transacional: Resend, SendGrid ou equivalente.

## Rotas desejadas na versao final

- `/`: cliente
- `/admin`: admin
- `/quem-somos`: institucional
- `/contrato`: dados para minuta

## Usuario admin do prototipo

- Usuario: CEO
- Senha: Cb@210691

Na producao, nao manter credenciais no front. Usar autenticacao real com backend e permissoes por perfil.
