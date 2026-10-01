-- Além do Voto 1.3 — Congresso + auditoria de gastos + diários oficiais
-- Inspiração funcional: transparência legislativa, revisão de despesas e pesquisa documental.
-- A implementação usa fontes primárias e mantém a proveniência do núcleo 1.2.

create table if not exists public.legislative_propositions (
  id uuid primary key default gen_random_uuid(),
  source_id text not null references public.sources(id),
  external_id text not null,
  chamber text not null,
  kind text,
  number text,
  year integer,
  title text,
  summary text,
  status text,
  regime text,
  appreciation text,
  presented_at timestamptz,
  last_event_at timestamptz,
  source_url text,
  source_document_id uuid references public.source_documents(id),
  metadata jsonb not null default '{}'::jsonb,
  unique(source_id,external_id)
);
create index if not exists legislative_propositions_year_idx on public.legislative_propositions(year,chamber,kind);

create table if not exists public.legislative_proposition_themes (
  proposition_id uuid not null references public.legislative_propositions(id) on delete cascade,
  theme_code text not null,
  theme_name text not null,
  source_document_id uuid references public.source_documents(id),
  primary key(proposition_id,theme_code)
);

create table if not exists public.legislative_events (
  id uuid primary key default gen_random_uuid(),
  proposition_id uuid not null references public.legislative_propositions(id) on delete cascade,
  external_event_id text,
  occurred_at timestamptz,
  organ text,
  event_type text,
  status text,
  description text,
  source_url text,
  source_document_id uuid references public.source_documents(id),
  metadata jsonb not null default '{}'::jsonb
);
create index if not exists legislative_events_prop_time_idx on public.legislative_events(proposition_id,occurred_at desc);

create table if not exists public.vote_orientations (
  legislative_vote_id uuid not null references public.legislative_votes(id) on delete cascade,
  caucus_type text not null,
  caucus_code text not null,
  orientation text not null,
  source_document_id uuid references public.source_documents(id),
  primary key(legislative_vote_id,caucus_type,caucus_code)
);

create table if not exists public.parliamentary_expenses (
  id uuid primary key default gen_random_uuid(),
  source_id text not null references public.sources(id),
  person_id uuid references public.people(id),
  external_id text not null,
  chamber text not null,
  expense_date date,
  year integer,
  month integer,
  expense_type text,
  supplier_name text,
  supplier_tax_id text,
  document_number text,
  document_type text,
  gross_amount numeric,
  net_amount numeric,
  document_url text,
  source_document_id uuid references public.source_documents(id),
  raw jsonb not null default '{}'::jsonb,
  unique(source_id,external_id)
);
create index if not exists parliamentary_expenses_person_time_idx on public.parliamentary_expenses(person_id,expense_date desc);
create index if not exists parliamentary_expenses_supplier_idx on public.parliamentary_expenses(supplier_tax_id,expense_date desc);

create table if not exists public.gazette_documents (
  id uuid primary key default gen_random_uuid(),
  source_id text not null default 'querido-diario' references public.sources(id),
  territory_id uuid references public.territories(id),
  external_id text not null,
  published_at date,
  edition text,
  is_extra_edition boolean,
  source_url text,
  text_url text,
  source_document_id uuid references public.source_documents(id),
  metadata jsonb not null default '{}'::jsonb,
  unique(source_id,external_id)
);
create index if not exists gazette_documents_territory_time_idx on public.gazette_documents(territory_id,published_at desc);

create table if not exists public.gazette_excerpts (
  id uuid primary key default gen_random_uuid(),
  gazette_document_id uuid not null references public.gazette_documents(id) on delete cascade,
  query_text text,
  excerpt text not null,
  excerpt_index integer,
  locator jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.review_cases (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid references public.xray_signals(id) on delete set null,
  subject_type text not null,
  subject_id uuid,
  state text not null default 'unreviewed' check(state in ('unreviewed','reviewing','context_found','needs_more_evidence','closed')),
  reviewer_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.review_events (
  id uuid primary key default gen_random_uuid(),
  review_case_id uuid not null references public.review_cases(id) on delete cascade,
  event_type text not null,
  note text,
  created_at timestamptz not null default now()
);

-- Resumo factual de presença e votos. Não contém nota de mérito.
create or replace view public.parliamentary_vote_summary with (security_invoker=true) as
select
  lv.person_id,
  count(*) as recorded_votes,
  count(*) filter (where upper(lv.vote) in ('SIM','NAO','NÃO')) as comparable_yes_no,
  count(*) filter (where upper(lv.vote) in ('AUSENTE','OBSTRUCAO','OBSTRUÇÃO')) as absence_or_obstruction,
  count(*) filter (where upper(lv.vote) in ('ABSTENCAO','ABSTENÇÃO')) as abstentions,
  min(v.held_at) as first_vote_at,
  max(v.held_at) as last_vote_at
from public.legislator_votes lv
join public.legislative_votes v on v.id=lv.legislative_vote_id
group by lv.person_id;

-- Coincidência de voto entre pares, sempre acompanhada do denominador.
create or replace view public.vote_pair_similarity with (security_invoker=true) as
select
  a.person_id as person_a,
  b.person_id as person_b,
  count(*) filter (where upper(a.vote) in ('SIM','NAO','NÃO') and upper(b.vote) in ('SIM','NAO','NÃO')) as comparable_votes,
  count(*) filter (where upper(a.vote)=upper(b.vote) and upper(a.vote) in ('SIM','NAO','NÃO')) as same_votes,
  case when count(*) filter (where upper(a.vote) in ('SIM','NAO','NÃO') and upper(b.vote) in ('SIM','NAO','NÃO'))=0 then null
       else count(*) filter (where upper(a.vote)=upper(b.vote) and upper(a.vote) in ('SIM','NAO','NÃO'))::numeric /
            count(*) filter (where upper(a.vote) in ('SIM','NAO','NÃO') and upper(b.vote) in ('SIM','NAO','NÃO')) end as similarity
from public.legislator_votes a
join public.legislator_votes b on b.legislative_vote_id=a.legislative_vote_id and b.person_id>a.person_id
group by a.person_id,b.person_id;

insert into public.sources(id,name,authority,base_url,data_kind,refresh_cadence,documentation_url) values
('querido-diario','Querido Diário','Open Knowledge Brasil','https://api.queridodiario.ok.org.br','municipal_documents','continuous','https://docs.queridodiario.ok.org.br/pt-br/latest/utilizando/api-publica.html'),
('datajud','DataJud','Conselho Nacional de Justiça','https://api-publica.datajud.cnj.jus.br','judiciary','varies','https://www.cnj.jus.br/sistemas/datajud/api-publica/'),
('receita','Dados Abertos CNPJ','Receita Federal','https://arquivos.receitafederal.gov.br/dados/cnpj/dados_abertos_cnpj/','companies','monthly','https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/dados-abertos/cadastros')
on conflict(id) do update set name=excluded.name,base_url=excluded.base_url,documentation_url=excluded.documentation_url;

do $$
declare t text;
begin
  foreach t in array array['legislative_propositions','legislative_proposition_themes','legislative_events','vote_orientations','parliamentary_expenses','gazette_documents','gazette_excerpts','review_cases','review_events'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke insert, update, delete on table public.%I from anon, authenticated',t);
    execute format('grant select on table public.%I to anon, authenticated',t);
    execute format('drop policy if exists public_read on public.%I',t);
    execute format('create policy public_read on public.%I for select to anon, authenticated using (true)',t);
  end loop;
end $$;

grant select on public.parliamentary_vote_summary to anon,authenticated;
grant select on public.vote_pair_similarity to anon,authenticated;
