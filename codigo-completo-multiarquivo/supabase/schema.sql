-- MAESTTRO - Schema Supabase (PostgreSQL)
-- Executar no SQL Editor do painel Supabase

create extension if not exists "pgcrypto";

-- ============================================================
-- CONTEUDO PUBLICO
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
-- CATALOGO MUSICAL
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

-- ============================================================
-- SEED: instrumentos do prototipo
-- ============================================================

insert into instruments (id, name, category, price, heavy) values
  ('violino-1', 'Violino I', 'Cordas', 800, false),
  ('violino-2', 'Violino II', 'Cordas', 800, false),
  ('violoncelo', 'Violoncelo', 'Cordas', 900, true),
  ('piano', 'Piano/Teclado', 'Teclas', 1000, false),
  ('sax', 'Saxofone', 'Sopros', 900, false),
  ('contrabaixo', 'Contrabaixo acustico', 'Cordas', 900, true),
  ('voz', 'Voz solista', 'Vozes', 850, false);

insert into instrument_categories (name, sort_order) values
  ('Cordas', 1),
  ('Sopros', 2),
  ('Vozes', 3),
  ('Teclas', 4),
  ('Estrutura', 5),
  ('Recepcao', 6);

insert into home_content (id, hero_image, preview_background, category_images) values (
  'default',
  './assets/capa-quartetto-serenatta.jpeg',
  './assets/celebration-light.png',
  '{"casamento":"./assets/ceremony-garden.png","debutante":"./assets/celebration-light.png","bodas":"./assets/music-details.png"}'
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

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

-- Leitura publica
create policy "public read home" on home_content for select using (true);
create policy "public read cards" on service_cards for select using (active = true);
create policy "public read videos" on preview_videos for select using (active = true);
create policy "public read instruments" on instruments for select using (active = true);
create policy "public read categories" on instrument_categories for select using (true);
create policy "public read songs" on songs for select using (active = true);
create policy "public read blocked dates" on blocked_dates for select using (true);

-- Cliente pode inserir
create policy "public insert leads" on leads for insert with check (true);
create policy "public insert simulations" on simulations for insert with check (true);
create policy "public insert contracts" on contract_drafts for insert with check (true);

-- Admin autenticado
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
