-- ============================================================
-- MAESTTRO - SCRIPT SQL COMPLETO E 100% IDEMPOTENTE PARA SUPABASE
-- ============================================================
-- Instruções:
-- 1. Acesse o Supabase Dashboard -> SQL Editor
-- 2. Clique em '+ New query', cole este script completo e clique em 'Run'.
-- ============================================================

-- Habilita extensão para geração de UUIDs e criptografia
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- 1. TABELAS DE CONTEÚDO E VITRINE DO SITE
-- ------------------------------------------------------------

create table if not exists home_content (
  id text primary key default 'default',
  hero_image text not null default './assets/capa-quartetto-serenatta.jpeg',
  preview_background text not null default './assets/celebration-light.png',
  category_images jsonb not null default '{"casamento":"./assets/ceremony-garden.png","debutante":"./assets/celebration-light.png","bodas":"./assets/music-details.png"}',
  updated_at timestamptz not null default now()
);

create table if not exists service_cards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  tag text not null default 'Inspiração',
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

-- ------------------------------------------------------------
-- 2. TABELAS DE CATÁLOGO E MÚSICAS
-- ------------------------------------------------------------

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
  moment text not null default 'Pré-cerimônia',
  copy text,
  image_url text default './assets/music-details.png',
  audio_url text,
  midi_url text,
  tags text[] default '{Catálogo}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Garante colunas adicionais caso existam tabelas legadas
alter table songs add column if not exists audio_url text;
alter table songs add column if not exists midi_url text;
alter table songs add column if not exists tags text[] default '{Catálogo}';

-- ------------------------------------------------------------
-- 3. AGENDA E BLOQUEIOS DE DATA
-- ------------------------------------------------------------

create table if not exists blocked_dates (
  id uuid primary key default gen_random_uuid(),
  event_date date not null unique,
  reason text not null default 'Evento já contratado',
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 4. LEADS, SIMULAÇÕES E CONTRATOS
-- ------------------------------------------------------------

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

-- ------------------------------------------------------------
-- 5. USUÁRIOS, BACKUPS E ANALYTICS DO PAINEL ADMIN
-- ------------------------------------------------------------

create table if not exists maesttro_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password text not null,
  permission text not null check (permission in ('Admin', 'Editor', 'Visualizador')),
  created_at timestamptz not null default now()
);

create table if not exists maesttro_backup_history (
  id text primary key,
  type text not null,
  timestamp bigint not null,
  date_string text not null,
  data jsonb not null,
  created_at timestamptz not null default now()
);

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

-- ------------------------------------------------------------
-- 6. ÍNDICES DE DESEMPENHO
-- ------------------------------------------------------------

create index if not exists idx_leads_email on leads(email);
create index if not exists idx_leads_created on leads(created_at desc);
create index if not exists idx_blocked_dates_date on blocked_dates(event_date);
create index if not exists idx_contract_drafts_status on contract_drafts(status);
create index if not exists idx_songs_title on songs(title);

-- ------------------------------------------------------------
-- 7. DADOS INICIAIS DE EXEMPLO (SEED - IDEMPOTENTE)
-- ------------------------------------------------------------

insert into instrument_categories (name, sort_order) values
  ('Cordas', 1),
  ('Sopros', 2),
  ('Vozes', 3),
  ('Teclas', 4),
  ('Estrutura', 5),
  ('Recepcao', 6)
on conflict (name) do nothing;

insert into instruments (id, name, category, price, heavy) values
  ('violino-1', 'Violino I', 'Cordas', 800, false),
  ('violino-2', 'Violino II', 'Cordas', 800, false),
  ('violoncelo', 'Violoncelo', 'Cordas', 900, true),
  ('piano', 'Piano/Teclado', 'Teclas', 1000, false),
  ('sax', 'Saxofone', 'Sopros', 900, false),
  ('contrabaixo', 'Contrabaixo acústico', 'Cordas', 900, true),
  ('voz', 'Voz solista', 'Vozes', 850, false)
on conflict (id) do nothing;

insert into home_content (id, hero_image, preview_background, category_images) values (
  'default',
  './assets/capa-quartetto-serenatta.jpeg',
  './assets/celebration-light.png',
  '{"casamento":"./assets/ceremony-garden.png","debutante":"./assets/celebration-light.png","bodas":"./assets/music-details.png"}'
)
on conflict (id) do nothing;

insert into maesttro_users (username, password, permission) values
  ('CEO', 'Cb@210691', 'Admin'),
  ('nilton', '123', 'Editor'),
  ('visitante', '123', 'Visualizador')
on conflict (username) do nothing;

insert into maesttro_analytics (id, visits, simulations, whatsapp, contracts, contracts_started, videos, songs, avg_time)
values ('current_stats', 1426, 91, 3, 4, 1, 8, 34, '8m 50s')
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- 8. PERMISSÕES DE SCHEMAS E TABELAS
-- ------------------------------------------------------------

grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all functions in schema public to anon, authenticated, service_role;

-- ------------------------------------------------------------
-- 9. CONFIGURAÇÃO DE ROW LEVEL SECURITY (RLS) NAS TABELAS
-- ------------------------------------------------------------

alter table home_content enable row level security;
alter table service_cards enable row level security;
alter table preview_videos enable row level security;
alter table instrument_categories enable row level security;
alter table instruments enable row level security;
alter table songs enable row level security;
alter table blocked_dates enable row level security;
alter table leads enable row level security;
alter table simulations enable row level security;
alter table contract_drafts enable row level security;
alter table maesttro_users enable row level security;
alter table maesttro_backup_history enable row level security;
alter table maesttro_analytics enable row level security;

-- Remoção e criação segura de políticas RLS para tabelas públicas
DO $$
BEGIN
  -- home_content
  EXECUTE 'DROP POLICY IF EXISTS "public_home_content_policy" ON home_content';
  EXECUTE 'CREATE POLICY "public_home_content_policy" ON home_content FOR ALL USING (true) WITH CHECK (true)';

  -- service_cards
  EXECUTE 'DROP POLICY IF EXISTS "public_service_cards_policy" ON service_cards';
  EXECUTE 'CREATE POLICY "public_service_cards_policy" ON service_cards FOR ALL USING (true) WITH CHECK (true)';

  -- preview_videos
  EXECUTE 'DROP POLICY IF EXISTS "public_preview_videos_policy" ON preview_videos';
  EXECUTE 'CREATE POLICY "public_preview_videos_policy" ON preview_videos FOR ALL USING (true) WITH CHECK (true)';

  -- instrument_categories
  EXECUTE 'DROP POLICY IF EXISTS "public_instrument_categories_policy" ON instrument_categories';
  EXECUTE 'CREATE POLICY "public_instrument_categories_policy" ON instrument_categories FOR ALL USING (true) WITH CHECK (true)';

  -- instruments
  EXECUTE 'DROP POLICY IF EXISTS "public_instruments_policy" ON instruments';
  EXECUTE 'CREATE POLICY "public_instruments_policy" ON instruments FOR ALL USING (true) WITH CHECK (true)';

  -- songs
  EXECUTE 'DROP POLICY IF EXISTS "public_songs_policy" ON songs';
  EXECUTE 'CREATE POLICY "public_songs_policy" ON songs FOR ALL USING (true) WITH CHECK (true)';

  -- blocked_dates
  EXECUTE 'DROP POLICY IF EXISTS "public_blocked_dates_policy" ON blocked_dates';
  EXECUTE 'CREATE POLICY "public_blocked_dates_policy" ON blocked_dates FOR ALL USING (true) WITH CHECK (true)';

  -- leads
  EXECUTE 'DROP POLICY IF EXISTS "public_leads_policy" ON leads';
  EXECUTE 'CREATE POLICY "public_leads_policy" ON leads FOR ALL USING (true) WITH CHECK (true)';

  -- simulations
  EXECUTE 'DROP POLICY IF EXISTS "public_simulations_policy" ON simulations';
  EXECUTE 'CREATE POLICY "public_simulations_policy" ON simulations FOR ALL USING (true) WITH CHECK (true)';

  -- contract_drafts
  EXECUTE 'DROP POLICY IF EXISTS "public_contract_drafts_policy" ON contract_drafts';
  EXECUTE 'CREATE POLICY "public_contract_drafts_policy" ON contract_drafts FOR ALL USING (true) WITH CHECK (true)';

  -- maesttro_users
  EXECUTE 'DROP POLICY IF EXISTS "public_maesttro_users_policy" ON maesttro_users';
  EXECUTE 'CREATE POLICY "public_maesttro_users_policy" ON maesttro_users FOR ALL USING (true) WITH CHECK (true)';

  -- maesttro_backup_history
  EXECUTE 'DROP POLICY IF EXISTS "public_maesttro_backup_policy" ON maesttro_backup_history';
  EXECUTE 'CREATE POLICY "public_maesttro_backup_policy" ON maesttro_backup_history FOR ALL USING (true) WITH CHECK (true)';

  -- maesttro_analytics
  EXECUTE 'DROP POLICY IF EXISTS "public_maesttro_analytics_policy" ON maesttro_analytics';
  EXECUTE 'CREATE POLICY "public_maesttro_analytics_policy" ON maesttro_analytics FOR ALL USING (true) WITH CHECK (true)';
END $$;

-- ------------------------------------------------------------
-- 10. BUCKET DE MÍDIAS/STORAGE (MAESTTRO-MEDIA) E RLS DE STORAGE
-- ------------------------------------------------------------

-- Garante que o bucket 'maesttro-media' exista e seja PÚBLICO
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('maesttro-media', 'maesttro-media', true, 52428800, null)
on conflict (id) do update set public = true;

-- Criação com fallback seguro para Políticas no Storage (evita erro 42710)
DO $$
BEGIN
  -- Tenta remover se existirem
  BEGIN
    DROP POLICY IF EXISTS "Permitir Leitura Publica Maesttro Media" ON storage.objects;
    DROP POLICY IF EXISTS "Permitir Upload Publico Maesttro Media" ON storage.objects;
    DROP POLICY IF EXISTS "Permitir Atualizacao Publica Maesttro Media" ON storage.objects;
    DROP POLICY IF EXISTS "Permitir Delecao Publica Maesttro Media" ON storage.objects;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  -- Cria apenas se não existirem
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Permitir Leitura Publica Maesttro Media') THEN
    CREATE POLICY "Permitir Leitura Publica Maesttro Media" ON storage.objects FOR SELECT USING (bucket_id = 'maesttro-media');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Permitir Upload Publico Maesttro Media') THEN
    CREATE POLICY "Permitir Upload Publico Maesttro Media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'maesttro-media');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Permitir Atualizacao Publica Maesttro Media') THEN
    CREATE POLICY "Permitir Atualizacao Publica Maesttro Media" ON storage.objects FOR UPDATE USING (bucket_id = 'maesttro-media') WITH CHECK (bucket_id = 'maesttro-media');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Permitir Delecao Publica Maesttro Media') THEN
    CREATE POLICY "Permitir Delecao Publica Maesttro Media" ON storage.objects FOR DELETE USING (bucket_id = 'maesttro-media');
  END IF;
END $$;

-- ------------------------------------------------------------
-- 11. REPLICA IDENTITY & REALTIME PARA ATUALIZAÇÕES EM TEMPO REAL
-- ------------------------------------------------------------

alter table songs replica identity full;
alter table service_cards replica identity full;
alter table preview_videos replica identity full;
alter table instruments replica identity full;
alter table instrument_categories replica identity full;
alter table blocked_dates replica identity full;
alter table home_content replica identity full;
alter table leads replica identity full;
alter table contract_drafts replica identity full;

-- Garante que a publicação existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Adiciona tabelas à publicação de forma segura individualmente
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE songs; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE service_cards; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE preview_videos; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE instruments; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE instrument_categories; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE blocked_dates; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE home_content; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE leads; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE simulations; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE contract_drafts; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE maesttro_analytics; EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;
