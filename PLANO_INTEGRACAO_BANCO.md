# Plano de integracao com banco de dados — MAESTTRO

Este documento descreve como sair do `localStorage` e passar a usar banco de dados real, mantendo o front atual na Locaweb (`maesttro.campsantoandre.org.br`).

---

## 1. Recomendacao: Supabase (principal)

| Criterio | Supabase | MySQL Locaweb |
|----------|----------|---------------|
| Autenticacao admin | Nativa (Auth) | Precisa desenvolver |
| API REST | Automatica | Precisa API PHP/Node |
| Upload de imagens/videos | Storage incluso | FTP ou S3 separado |
| Tempo de implementacao | Menor | Maior |
| Custo inicial | Gratuito ate certo volume | Incluso na hospedagem |
| LGPD / seguranca | RLS + politicas | Depende do dev |

**Conclusao:** use **Supabase** como backend e mantenha o front estatico na Locaweb. O MySQL da Locaweb so vale se houver dev PHP/Node dedicado na mesma hospedagem.

---

## 2. Arquitetura alvo

```
Cliente (Locaweb)                    Supabase (nuvem)
─────────────────                    ────────────────
index.html  ──┐
admin.html  ──┼──► supabase-js ────► PostgreSQL (dados)
contrato.html ┘                  └──► Storage (midias)
                                   └──► Auth (admin)
```

O front continua em HTML/JS na Locaweb. Um novo arquivo `supabase-client.js` centraliza leitura e gravacao.

---

## 3. Modelo de dados (PostgreSQL / Supabase)

Execute no SQL Editor do Supabase:

```sql
-- Extensao para UUID
create extension if not exists "pgcrypto";

-- ============================================================
-- CONTEUDO PUBLICO (home, vitrine, previas)
-- ============================================================

create table home_content (
  id text primary key default 'default',
  hero_image text not null,
  preview_background text not null,
  category_images jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

create table service_cards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  tag text not null default 'Inspiracao',
  copy text not null,
  image text not null,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table preview_videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  formation text not null,
  music text not null,
  description text,
  image_url text not null,
  video_url text,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- CATALOGO MUSICAL (admin)
-- ============================================================

create table instrument_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int not null default 0
);

create table instruments (
  id text primary key,
  name text not null,
  category text not null,
  price numeric(10,2) not null,
  heavy boolean not null default false,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table songs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text not null default 'A definir',
  moment text not null,
  copy text,
  image_url text,
  midi_url text,
  tags text[] default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- AGENDA
-- ============================================================

create table blocked_dates (
  id uuid primary key default gen_random_uuid(),
  event_date date not null unique,
  reason text not null default 'evento ja contratado',
  created_at timestamptz not null default now()
);

-- ============================================================
-- LEADS E SIMULACOES
-- ============================================================

create table leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  event_type text not null,
  event_date date,
  location text,
  zip_code text,
  budget text,
  consent boolean not null default false,
  status text not null default 'novo',
  created_at timestamptz not null default now()
);

create table simulations (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  event_kind text not null,
  venue text,
  style text,
  rite text,
  emotion text,
  event_moment text,
  duration_minutes text,
  musical_style text,
  story_song text,
  formation text,
  instruments jsonb not null default '[]',
  moments jsonb not null default '[]',
  total_estimated numeric(10,2),
  transport jsonb,
  raw_state jsonb,
  updated_at timestamptz not null default now()
);

-- ============================================================
-- CONTRATOS
-- ============================================================

create table contract_drafts (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete set null,
  simulation_id uuid references simulations(id) on delete set null,
  contract_name text not null,
  contract_email text not null,
  nationality text,
  rg text,
  cpf text,
  marital_status text,
  profession text,
  address text,
  witness_name text,
  witness_cpf text,
  witness_email text,
  event_date date,
  total numeric(10,2),
  payment_method text,
  payment_summary jsonb,
  notes text,
  status text not null default 'rascunho',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- INDICES
-- ============================================================

create index idx_leads_email on leads(email);
create index idx_leads_created on leads(created_at desc);
create index idx_blocked_dates_date on blocked_dates(event_date);
create index idx_contract_drafts_status on contract_drafts(status);
```

---

## 4. Politicas de seguranca (RLS)

```sql
alter table home_content enable row level security;
alter table service_cards enable row level security;
alter table preview_videos enable row level security;
alter table instruments enable row level security;
alter table instrument_categories enable row level security;
alter table songs enable row level security;
alter table blocked_dates enable row level security;
alter table leads enable row level security;
alter table simulations enable row level security;
alter table contract_drafts enable row level security;

-- Leitura publica: conteudo do site e agenda
create policy "public read home" on home_content for select using (true);
create policy "public read cards" on service_cards for select using (active = true);
create policy "public read videos" on preview_videos for select using (active = true);
create policy "public read instruments" on instruments for select using (active = true);
create policy "public read categories" on instrument_categories for select using (true);
create policy "public read songs" on songs for select using (active = true);
create policy "public read blocked dates" on blocked_dates for select using (true);

-- Cliente pode criar lead, simulacao e rascunho de contrato
create policy "public insert leads" on leads for insert with check (true);
create policy "public insert simulations" on simulations for insert with check (true);
create policy "public insert contracts" on contract_drafts for insert with check (true);

-- Admin autenticado: acesso total
create policy "admin all home" on home_content for all using (auth.role() = 'authenticated');
create policy "admin all cards" on service_cards for all using (auth.role() = 'authenticated');
create policy "admin all videos" on preview_videos for all using (auth.role() = 'authenticated');
create policy "admin all instruments" on instruments for all using (auth.role() = 'authenticated');
create policy "admin all categories" on instrument_categories for all using (auth.role() = 'authenticated');
create policy "admin all songs" on songs for all using (auth.role() = 'authenticated');
create policy "admin all blocked" on blocked_dates for all using (auth.role() = 'authenticated');
create policy "admin read leads" on leads for select using (auth.role() = 'authenticated');
create policy "admin read simulations" on simulations for select using (auth.role() = 'authenticated');
create policy "admin read contracts" on contract_drafts for select using (auth.role() = 'authenticated');
create policy "admin update contracts" on contract_drafts for update using (auth.role() = 'authenticated');
```

Crie usuarios admin em **Authentication > Users** no painel Supabase.

---

## 5. Mapeamento localStorage → banco

| localStorage atual | Tabela Supabase | Quem grava |
|--------------------|-----------------|------------|
| `maesttro-blocked-dates` | `blocked_dates` | Admin |
| `maesttro-home-content` | `home_content` | Admin |
| `maesttro-service-cards` | `service_cards` | Admin |
| `maesttro-preview-videos` | `preview_videos` | Admin |
| `maesttro-contract-context` | `simulations` + `leads` | Cliente |
| `maesttro-contract-draft` | `contract_drafts` | Cliente |
| `maesttro-admin-session` | Supabase Auth (JWT) | Admin |
| Instrumentos hardcoded em `app.js` | `instruments` | Admin (seed inicial) |

---

## 6. Novos arquivos no projeto

```
codigo-completo-multiarquivo/
├── supabase-config.js      # URL + anon key (publica)
├── supabase-client.js      # funcoes read/write
├── supabase-auth.js        # login admin real
└── supabase/
    └── schema.sql          # SQL deste plano
```

### supabase-config.js (exemplo)

```javascript
window.MAESTTRO_SUPABASE = {
  url: "https://SEU_PROJETO.supabase.co",
  anonKey: "SUA_ANON_KEY_PUBLICA"
};
```

A `anonKey` pode ficar no front. Dados sensiveis ficam protegidos pelo RLS.

### supabase-client.js (funcoes principais)

```javascript
// Carregar ao iniciar o site
async function loadPublicContent() { /* home_content, service_cards, preview_videos, instruments, blocked_dates */ }

// Lead form (index.html)
async function saveLead(lead) { /* insert leads, retorna lead.id */ }

// Montagem musical
async function saveSimulation(leadId, state) { /* insert/update simulations */ }

// Contrato
async function saveContractDraft(draft) { /* insert contract_drafts */ }

// Admin
async function upsertBlockedDate(date, reason) { /* insert blocked_dates */ }
async function deleteBlockedDate(date) { /* delete */ }
async function upsertServiceCard(card) { /* insert/update service_cards */ }
async function uploadMedia(file, folder) { /* Supabase Storage → retorna URL publica */ }
```

---

## 7. Alteracoes por arquivo existente

### `app.js` (maior mudanca)

| Funcao atual | Mudanca |
|--------------|---------|
| `readStorage` / `writeStorage` | Substituir por `supabase-client.js` com fallback localStorage |
| `bindLeadForm` submit | Apos validar, chamar `saveLead()` |
| `persistContractContext` | Chamar `saveSimulation()` |
| `persistBlockedDates` | Admin: `upsertBlockedDate()` |
| `persistVisualContent` | Admin: gravar em `home_content`, `service_cards`, `preview_videos` |
| `validateLeadDate` | Consultar `blocked_dates` via API, nao localStorage |
| `instruments` (array fixo) | Carregar de `instruments` no boot |

### `admin-auth.js`

| Atual | Novo |
|-------|------|
| Credenciais hardcoded | `supabase.auth.signInWithPassword()` |
| Sessao em localStorage | Sessao JWT gerenciada pelo Supabase |

Remover completamente:

```javascript
const adminCredentials = { user: "CEO", password: "Cb@210691" };
```

### `contrato.js`

| Atual | Novo |
|-------|------|
| `writeContractStorage(draft)` | `saveContractDraft(draft)` |
| `readContractStorage(context)` | Buscar ultima `simulation` do `lead_id` na sessao |

### HTML (`index.html`, `admin.html`, `contrato.html`)

Adicionar antes dos scripts existentes:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="./supabase-config.js"></script>
<script src="./supabase-client.js"></script>
```

Em `admin.html`, trocar `admin-auth.js` por `supabase-auth.js`.

---

## 8. Storage para midias (imagens e videos)

No Supabase: **Storage** > criar bucket `maesttro-media` (publico para leitura).

```
maesttro-media/
├── hero/
├── categories/
├── cards/
├── previews/
└── midis/
```

Substituir `data:` URLs e `URL.createObjectURL` por upload real:

```javascript
async function uploadMedia(file, folder) {
  const path = `${folder}/${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from("maesttro-media")
    .upload(path, file);
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage
    .from("maesttro-media")
    .getPublicUrl(path);
  return publicUrl;
}
```

---

## 9. Implementacao em fases

### Fase 1 — Fundacao (1–2 dias)
- [ ] Criar projeto Supabase
- [ ] Executar `schema.sql`
- [ ] Configurar RLS e usuario admin
- [ ] Criar `supabase-config.js`, `supabase-client.js`
- [ ] Migrar `blocked_dates` (agenda compartilhada)

**Resultado:** datas bloqueadas funcionam para todos os visitantes.

### Fase 2 — Leads (1–2 dias)
- [ ] `saveLead()` no submit do formulario
- [ ] Painel admin: listar leads (nova secao ou Supabase Dashboard)
- [ ] E-mail de notificacao (Supabase Edge Function ou Resend)

**Resultado:** equipe recebe contatos reais.

### Fase 3 — Conteudo admin (2–3 dias)
- [ ] Migrar imagens, cards, videos, instrumentos
- [ ] Upload via Supabase Storage
- [ ] Login admin com Supabase Auth

**Resultado:** gestao centralizada, visivel para todos.

### Fase 4 — Contratos (2–3 dias)
- [ ] Salvar `simulations` e `contract_drafts`
- [ ] Remover coleta de CPF ate revisar LGPD, ou criptografar em repouso
- [ ] Exportar minuta (PDF via Edge Function)

**Resultado:** fluxo comercial completo.

### Fase 5 — Pagamentos (futuro)
- [ ] Mercado Pago via Edge Function
- [ ] Webhook de confirmacao
- [ ] Atualizar `contract_drafts.status`

---

## 10. Dados iniciais (seed)

Popular instrumentos atuais do prototipo:

```sql
insert into instruments (id, name, category, price, heavy) values
  ('violino-1', 'Violino I', 'Cordas', 800, false),
  ('violino-2', 'Violino II', 'Cordas', 800, false),
  ('violoncelo', 'Violoncelo', 'Cordas', 900, true),
  ('piano', 'Piano/Teclado', 'Teclas', 1000, false),
  ('sax', 'Saxofone', 'Sopros', 900, false),
  ('contrabaixo', 'Contrabaixo acustico', 'Cordas', 900, true),
  ('voz', 'Voz solista', 'Vozes', 850, false);

insert into home_content (id, hero_image, preview_background, category_images) values (
  'default',
  './assets/capa-quartetto-serenatta.jpeg',
  './assets/celebration-light.png',
  '{"casamento":"./assets/ceremony-garden.png","debutante":"./assets/celebration-light.png","bodas":"./assets/music-details.png"}'
);
```

Depois do Storage configurado, troque URLs `./assets/...` pelas URLs publicas do Supabase.

---

## 11. LGPD — antes de coletar CPF real

1. Publicar **Politica de Privacidade** em `campsantoandre.org.br`
2. Checkbox de consentimento explicito no contrato
3. Definir prazo de retencao dos dados
4. Permitir exclusao sob solicitacao
5. Considerar criptografar CPF/RG ou usar tabela separada com acesso restrito

Enquanto isso, exibir aviso no formulario:

> "Protótipo em homologacao. Nao informe dados sensiveis reais ate a versao final."

---

## 12. Checklist de configuracao Supabase

1. Criar conta em https://supabase.com
2. Novo projeto: `maesttro-serenatta`
3. SQL Editor → colar `schema.sql`
4. Authentication → Email → criar usuario admin
5. Storage → bucket `maesttro-media`
6. Settings → API → copiar `URL` e `anon public key`
7. Colar em `supabase-config.js`
8. Subir front atualizado na Locaweb

---

## 13. Custo estimado

| Servico | Custo inicial |
|---------|---------------|
| Locaweb (subdominio) | Ja contratado |
| Supabase Free | R$ 0 ate ~50k linhas / 1 GB storage |
| Resend (e-mails) | Gratuito ate 3k/mes |
| Mercado Pago | Taxa por transacao |

---

## 14. Proximo passo imediato

Ordem recomendada para comecar hoje:

1. Criar projeto Supabase
2. Executar o SQL da secao 3 + RLS da secao 4
3. Implementar **Fase 1** (agenda + `blocked_dates`)
4. Implementar **Fase 2** (leads)

Posso implementar a Fase 1 no codigo (arquivos `supabase-config.js`, `supabase-client.js` e alteracoes em `app.js`) quando voce tiver a URL e a anon key do Supabase.
