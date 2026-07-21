-- MAESTTRO - Schema Supabase (PostgreSQL) - Idempotente e Seguro
-- Executar no SQL Editor do painel Supabase

create extension if not exists "pgcrypto";

-- ============================================================
-- CONTEUDO PUBLICO
-- ============================================================

create table if not exists home_content (
  id text primary key default 'default',
  hero_image text not null,
  preview_background text not null,
  category_images jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists service_cards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  tag text not null default 'Inspiracao',
  copy text not null,
  image text not null,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists preview_videos (
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

create table if not exists instrument_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int not null default 0
);

create table if not exists instruments (
  id text primary key,
  name text not null,
  category text not null,
  price numeric(10,2) not null,
  heavy boolean not null default false,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists songs (
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

create table if not exists blocked_dates (
  id uuid primary key default gen_random_uuid(),
  event_date date not null unique,
  reason text not null default 'evento ja contratado',
  created_at timestamptz not null default now()
);

-- ============================================================
-- LEADS E SIMULACOES
-- ============================================================

create table if not exists leads (
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

create table if not exists simulations (
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

create table if not exists contract_drafts (
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

create index if not exists idx_leads_email on leads(email);
create index if not exists idx_leads_created on leads(created_at desc);
create index if not exists idx_blocked_dates_date on blocked_dates(event_date);
create index if not exists idx_contract_drafts_status on contract_drafts(status);

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
  ('voz', 'Voz solista', 'Vozes', 850, false)
on conflict (id) do nothing;

insert into instrument_categories (name, sort_order) values
  ('Cordas', 1),
  ('Sopros', 2),
  ('Vozes', 3),
  ('Teclas', 4),
  ('Estrutura', 5),
  ('Recepcao', 6)
on conflict (name) do nothing;

insert into home_content (id, hero_image, preview_background, category_images) values (
  'default',
  './assets/capa-quartetto-serenatta.jpeg',
  './assets/celebration-light.png',
  '{"casamento":"./assets/ceremony-garden.png","debutante":"./assets/celebration-light.png","bodas":"./assets/music-details.png"}'
)
on conflict (id) do nothing;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
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
-- Leitura publica
drop policy if exists "public read home" on home_content;
drop policy if exists "public_read_home" on home_content;
create policy "public read home" on home_content for select using (true);

drop policy if exists "public read cards" on service_cards;
drop policy if exists "public_read_cards" on service_cards;
create policy "public read cards" on service_cards for select using (active = true);

drop policy if exists "public read videos" on preview_videos;
drop policy if exists "public_read_videos" on preview_videos;
create policy "public read videos" on preview_videos for select using (active = true);

drop policy if exists "public read instruments" on instruments;
drop policy if exists "public_read_instruments" on instruments;
create policy "public read instruments" on instruments for select using (active = true);

drop policy if exists "public read categories" on instrument_categories;
drop policy if exists "public_read_categories" on instrument_categories;
create policy "public read categories" on instrument_categories for select using (true);

drop policy if exists "public read songs" on songs;
drop policy if exists "public_read_songs" on songs;
create policy "public read songs" on songs for select using (active = true);

drop policy if exists "public read blocked dates" on blocked_dates;
drop policy if exists "public_read_blocked_dates" on blocked_dates;
create policy "public read blocked dates" on blocked_dates for select using (true);

-- Cliente pode inserir
drop policy if exists "public insert leads" on leads;
drop policy if exists "public_insert_leads" on leads;
create policy "public insert leads" on leads for insert with check (true);

drop policy if exists "public insert simulations" on simulations;
drop policy if exists "public_insert_simulations" on simulations;
create policy "public insert simulations" on simulations for insert with check (true);

drop policy if exists "public insert contracts" on contract_drafts;
drop policy if exists "public_insert_contracts" on contract_drafts;
create policy "public insert contracts" on contract_drafts for insert with check (true);

-- Admin autenticado
drop policy if exists "admin all home" on home_content;
drop policy if exists "admin_all_home" on home_content;
create policy "admin all home" on home_content for all using (auth.role() = 'authenticated');

drop policy if exists "admin all cards" on service_cards;
drop policy if exists "admin_all_cards" on service_cards;
create policy "admin all cards" on service_cards for all using (auth.role() = 'authenticated');

drop policy if exists "admin all videos" on preview_videos;
drop policy if exists "admin_all_videos" on preview_videos;
create policy "admin all videos" on preview_videos for all using (auth.role() = 'authenticated');

drop policy if exists "admin all instruments" on instruments;
drop policy if exists "admin_all_instruments" on instruments;
create policy "admin all instruments" on instruments for all using (auth.role() = 'authenticated');

drop policy if exists "admin all categories" on instrument_categories;
drop policy if exists "admin_all_categories" on instrument_categories;
create policy "admin all categories" on instrument_categories for all using (auth.role() = 'authenticated');

drop policy if exists "admin all songs" on songs;
drop policy if exists "admin_all_songs" on songs;
create policy "admin all songs" on songs for all using (auth.role() = 'authenticated');

drop policy if exists "admin all blocked" on blocked_dates;
drop policy if exists "admin_all_blocked" on blocked_dates;
create policy "admin all blocked" on blocked_dates for all using (auth.role() = 'authenticated');

drop policy if exists "admin read leads" on leads;
drop policy if exists "admin_read_leads" on leads;
create policy "admin read leads" on leads for select using (auth.role() = 'authenticated');

drop policy if exists "admin read simulations" on simulations;
drop policy if exists "admin_read_simulations" on simulations;
create policy "admin read simulations" on simulations for select using (auth.role() = 'authenticated');

drop policy if exists "admin read contracts" on contract_drafts;
drop policy if exists "admin_read_contracts" on contract_drafts;
create policy "admin read contracts" on contract_drafts for select using (auth.role() = 'authenticated');

drop policy if exists "admin update contracts" on contract_drafts;
drop policy if exists "admin_update_contracts" on contract_drafts;
create policy "admin update contracts" on contract_drafts for update using (auth.role() = 'authenticated');

-- ============================================================
-- 1 - SISTEMA DE BACKUP INTEGRAL (TABELAS EXTRAS)
-- ============================================================

create table if not exists maesttro_backup_history (
  id text primary key,
  type text not null,
  timestamp bigint not null,
  date_string text not null,
  data jsonb not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 2 - USUARIOS E SELECAO DE PERMISSOES
-- ============================================================

create table if not exists maesttro_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password text not null,
  permission text not null check (permission in ('Admin', 'Editor', 'Visualizador')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- 3 - CONTADOR E VISUALIZADOR DE ACESSOS (ANALYTICS)
-- ============================================================

create table if not exists maesttro_analytics (
  id text primary key default 'current_stats',
  visits int not null default 1426,
  simulations int not null default 91,
  whatsapp int not null default 3,
  contracts int not null default 4,
  contracts_started int not null default 1,
  videos int not null default 8,
  songs int not null default 34,
  avg_time text not null default '8m 50s',
  updated_at timestamptz not null default now()
);

-- ============================================================
-- SEED PARA USUARIOS E ANALYTICS
-- ============================================================

insert into maesttro_users (username, password, permission) values
  ('CEO', 'Cb@210691', 'Admin'),
  ('nilton', '123', 'Editor'),
  ('visitante', '123', 'Visualizador')
on conflict (username) do nothing;

insert into maesttro_analytics (id, visits, simulations, whatsapp, contracts, contracts_started, videos, songs, avg_time)
values ('current_stats', 1426, 91, 3, 4, 1, 8, 34, '8m 50s')
on conflict (id) do nothing;

-- ============================================================
-- SEGURANCA: ROW LEVEL SECURITY (RLS) PARA EXTRAS
-- ============================================================

alter table maesttro_backup_history enable row level security;
alter table maesttro_users enable row level security;
alter table maesttro_analytics enable row level security;

-- Backup Policies
drop policy if exists "public access to backups" on maesttro_backup_history;
create policy "public access to backups" on maesttro_backup_history for all using (true) with check (true);

-- User Policies
drop policy if exists "public select users for login" on maesttro_users;
create policy "public select users for login" on maesttro_users for select using (true);

drop policy if exists "authenticated all users" on maesttro_users;
create policy "authenticated all users" on maesttro_users for all using (auth.role() = 'authenticated');

-- Analytics Policies
drop policy if exists "public access to analytics" on maesttro_analytics;
create policy "public access to analytics" on maesttro_analytics for all using (true) with check (true);

