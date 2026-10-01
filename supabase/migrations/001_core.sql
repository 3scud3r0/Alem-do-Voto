-- Além do Voto — núcleo temporal e de proveniência
-- PostgreSQL / Supabase
-- Objetivo: separar fatos normalizados de documentos-fonte e manter cada relação no tempo.

create extension if not exists pgcrypto;

create table if not exists public.sources (
  id text primary key,
  name text not null,
  authority text,
  base_url text not null,
  data_kind text not null,
  refresh_cadence text,
  documentation_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.source_documents (
  id uuid primary key default gen_random_uuid(),
  source_id text not null references public.sources(id),
  source_url text not null,
  source_identifier text,
  source_generated_at timestamptz,
  captured_at timestamptz not null default now(),
  sha256 text not null,
  object_key text,
  media_type text not null default 'application/json',
  metadata jsonb not null default '{}'::jsonb,
  unique (source_id, sha256)
);

create table if not exists public.territories (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('country','region','state','federal_district','municipality','district','electoral_zone')),
  name text not null,
  uf text,
  ibge_code text,
  tse_code text,
  parent_id uuid references public.territories(id),
  valid_from date,
  valid_to date,
  metadata jsonb not null default '{}'::jsonb
);
create unique index if not exists territories_ibge_code_uq on public.territories(ibge_code) where ibge_code is not null;
create index if not exists territories_parent_idx on public.territories(parent_id);
create index if not exists territories_tse_code_idx on public.territories(tse_code);

create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  canonical_name text not null,
  birth_date date,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.person_identifiers (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people(id) on delete cascade,
  source_id text not null references public.sources(id),
  identifier_type text not null,
  identifier_value text not null,
  valid_from date,
  valid_to date,
  confidence_basis text,
  source_document_id uuid references public.source_documents(id),
  unique(source_id, identifier_type, identifier_value)
);
create index if not exists person_identifiers_person_idx on public.person_identifiers(person_id);

create table if not exists public.elections (
  id uuid primary key default gen_random_uuid(),
  source_id text not null default 'tse' references public.sources(id),
  election_code text not null,
  pleito_code text,
  election_date date not null,
  round smallint not null check (round in (1,2)),
  scope text not null,
  status text not null default 'scheduled',
  metadata jsonb not null default '{}'::jsonb,
  unique(source_id, election_code)
);

create table if not exists public.election_snapshots (
  id uuid primary key default gen_random_uuid(),
  source_id text not null references public.sources(id),
  election_code text not null,
  office_code text not null,
  mode text not null check (mode in ('official','simulator')),
  scope_code text not null,
  captured_at timestamptz not null,
  source_generated_at text,
  source_idg text,
  processed_percent numeric(7,4),
  sections_total bigint,
  sections_processed bigint,
  raw_object_key text,
  visual_object_key text,
  snapshot_sha256 text not null unique,
  normalized jsonb not null,
  state_archive_index jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists election_snapshots_latest_idx on public.election_snapshots(source_id,election_code,scope_code,captured_at desc);
create index if not exists election_snapshots_idg_idx on public.election_snapshots(source_idg) where source_idg is not null;

create table if not exists public.mandates (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people(id),
  territory_id uuid references public.territories(id),
  office text not null,
  chamber text,
  party text,
  start_date date,
  end_date date,
  source_document_id uuid references public.source_documents(id),
  metadata jsonb not null default '{}'::jsonb
);
create index if not exists mandates_person_time_idx on public.mandates(person_id,start_date,end_date);

create table if not exists public.legislative_votes (
  id uuid primary key default gen_random_uuid(),
  source_id text not null references public.sources(id),
  external_vote_id text not null,
  chamber text not null,
  held_at timestamptz,
  title text,
  description text,
  result text,
  nominal boolean,
  secret boolean,
  source_url text,
  source_document_id uuid references public.source_documents(id),
  metadata jsonb not null default '{}'::jsonb,
  unique(source_id, external_vote_id)
);

create table if not exists public.legislator_votes (
  legislative_vote_id uuid not null references public.legislative_votes(id) on delete cascade,
  person_id uuid not null references public.people(id),
  vote text not null,
  party_at_vote text,
  source_document_id uuid references public.source_documents(id),
  primary key(legislative_vote_id, person_id)
);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  canonical_name text not null,
  cnpj text,
  organization_type text,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);
create unique index if not exists organizations_cnpj_uq on public.organizations(cnpj) where cnpj is not null;

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  source_id text not null references public.sources(id),
  external_id text not null,
  buyer_organization_id uuid references public.organizations(id),
  supplier_organization_id uuid references public.organizations(id),
  territory_id uuid references public.territories(id),
  signed_at date,
  starts_at date,
  ends_at date,
  amount numeric,
  currency text default 'BRL',
  object text,
  source_url text,
  source_document_id uuid references public.source_documents(id),
  metadata jsonb not null default '{}'::jsonb,
  unique(source_id, external_id)
);
create index if not exists contracts_supplier_idx on public.contracts(supplier_organization_id,signed_at);
create index if not exists contracts_territory_idx on public.contracts(territory_id,signed_at);

create table if not exists public.entity_links (
  id uuid primary key default gen_random_uuid(),
  left_type text not null,
  left_id uuid not null,
  relation_type text not null,
  right_type text not null,
  right_id uuid not null,
  valid_from date,
  valid_to date,
  match_method text not null,
  match_evidence jsonb not null default '{}'::jsonb,
  source_document_id uuid references public.source_documents(id),
  created_at timestamptz not null default now()
);
create index if not exists entity_links_left_idx on public.entity_links(left_type,left_id);
create index if not exists entity_links_right_idx on public.entity_links(right_type,right_id);

-- Um sinal é uma observação reproduzível. Não há nota geral, ranking, nem conclusão sobre pessoa.
create table if not exists public.xray_signals (
  id uuid primary key default gen_random_uuid(),
  rule_id text not null,
  subject_type text not null,
  subject_id uuid not null,
  observed_at timestamptz not null default now(),
  period_start date,
  period_end date,
  observed_value jsonb not null,
  comparison_context jsonb not null default '{}'::jsonb,
  evidence jsonb not null,
  explanation text not null,
  limitations text,
  reproducibility jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists xray_signals_subject_idx on public.xray_signals(subject_type,subject_id,observed_at desc);

insert into public.sources(id,name,authority,base_url,data_kind,refresh_cadence,documentation_url) values
('tse','Tribunal Superior Eleitoral','TSE','https://resultados.tse.jus.br','elections','during counting / published datasets','https://www.tse.jus.br/eleicoes/informacoes-tecnicas-sobre-a-divulgacao-de-resultados'),
('ibge','Instituto Brasileiro de Geografia e Estatística','IBGE','https://servicodados.ibge.gov.br','territory','varies','https://servicodados.ibge.gov.br/api/docs/malhas'),
('camara','Câmara dos Deputados','Câmara dos Deputados','https://dadosabertos.camara.leg.br/api/v2','legislative','daily','https://dadosabertos.camara.leg.br/swagger/api.html'),
('senado','Senado Federal','Senado Federal','https://legis.senado.leg.br/dadosabertos','legislative','varies','https://www12.senado.leg.br/dados-abertos'),
('pncp','Portal Nacional de Contratações Públicas','PNCP','https://pncp.gov.br/api/consulta','procurement','continuous','https://pncp.gov.br/manual/pt-br/latest/'),
('siconfi','Siconfi / Tesouro Nacional','Tesouro Nacional','https://apidatalake.tesouro.gov.br','fiscal','varies','https://apidatalake.tesouro.gov.br/docs/siconfi/'),
('transparencia','Portal da Transparência','CGU','https://api.portaldatransparencia.gov.br','transparency','varies','https://api.portaldatransparencia.gov.br/swagger-ui/index.html')
on conflict (id) do update set name=excluded.name, base_url=excluded.base_url, documentation_url=excluded.documentation_url;

-- Row Level Security: leitura pública, escrita somente pelo backend com secret key.
do $$
declare t text;
begin
  foreach t in array array['sources','source_documents','territories','people','person_identifiers','elections','election_snapshots','mandates','legislative_votes','legislator_votes','organizations','contracts','entity_links','xray_signals']
  loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke insert, update, delete on table public.%I from anon, authenticated',t);
    execute format('grant select on table public.%I to anon, authenticated',t);
    execute format('drop policy if exists public_read on public.%I',t);
    execute format('create policy public_read on public.%I for select to anon, authenticated using (true)',t);
  end loop;
end $$;
