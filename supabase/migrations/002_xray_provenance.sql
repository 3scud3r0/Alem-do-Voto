-- Além do Voto 1.2 — proveniência de cada número do Raio-X
-- Regra: todo valor publicado deve terminar em source_record -> source_document -> URL + SHA-256.

create table if not exists public.source_records (
  id uuid primary key default gen_random_uuid(),
  source_document_id uuid not null references public.source_documents(id) on delete cascade,
  source_id text not null references public.sources(id),
  record_type text not null,
  external_record_id text not null,
  canonical_url text,
  source_observed_at timestamptz,
  locator jsonb not null default '{}'::jsonb,
  raw_record jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(source_document_id, record_type, external_record_id)
);
create index if not exists source_records_external_idx on public.source_records(source_id,record_type,external_record_id);

create table if not exists public.observations (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null,
  subject_id uuid not null,
  metric_code text not null,
  value_numeric numeric,
  value_text text,
  value_json jsonb,
  unit text,
  period_start date,
  period_end date,
  source_record_id uuid not null references public.source_records(id) on delete restrict,
  transform_code text not null default 'identity',
  transform_version text not null default '1',
  derivation jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (num_nonnulls(value_numeric,value_text,value_json) >= 1)
);
create index if not exists observations_subject_metric_idx on public.observations(subject_type,subject_id,metric_code,period_start,period_end);
create index if not exists observations_source_record_idx on public.observations(source_record_id);

alter table public.xray_signals add column if not exists rule_version text not null default '1.0.0';
alter table public.xray_signals add column if not exists publication_status text not null default 'draft' check (publication_status in ('draft','publishable','published','withdrawn'));
alter table public.xray_signals add column if not exists engine_version text;
alter table public.xray_signals add column if not exists audit jsonb not null default '{}'::jsonb;

create table if not exists public.xray_signal_observations (
  signal_id uuid not null references public.xray_signals(id) on delete cascade,
  observation_id uuid not null references public.observations(id) on delete restrict,
  evidence_role text not null check (evidence_role in ('input','peer','context','corroboration')),
  ordinal integer not null default 0,
  note text,
  primary key(signal_id,observation_id,evidence_role)
);
create index if not exists xray_signal_observations_signal_idx on public.xray_signal_observations(signal_id,ordinal);

create or replace view public.xray_signal_evidence with (security_invoker=true) as
select
  xs.id as signal_id,
  xs.rule_id,
  xs.rule_version,
  xs.subject_type,
  xs.subject_id,
  xs.observed_at,
  xs.explanation,
  xs.limitations,
  xs.reproducibility,
  xso.evidence_role,
  xso.ordinal,
  o.id as observation_id,
  o.metric_code,
  o.value_numeric,
  o.value_text,
  o.value_json,
  o.unit,
  o.period_start,
  o.period_end,
  sr.id as source_record_id,
  sr.record_type,
  sr.external_record_id,
  sr.canonical_url as record_url,
  sr.locator,
  sd.id as source_document_id,
  sd.source_id,
  sd.source_url as document_url,
  sd.source_identifier,
  sd.captured_at,
  sd.sha256,
  sd.object_key,
  sd.media_type
from public.xray_signals xs
join public.xray_signal_observations xso on xso.signal_id=xs.id
join public.observations o on o.id=xso.observation_id
join public.source_records sr on sr.id=o.source_record_id
join public.source_documents sd on sd.id=sr.source_document_id;

-- Não existe "número órfão": a aplicação só publica um sinal se esta função não encontrar falhas.
create or replace function public.xray_provenance_check(p_signal_id uuid)
returns table(ok boolean, evidence_count bigint, document_count bigint, missing_sha bigint, missing_url bigint)
language sql
security invoker
set search_path=public
as $$
  select
    count(*) > 0 and count(*) filter (where sd.sha256 is null or sd.sha256='') = 0 and count(*) filter (where sd.source_url is null or sd.source_url='') = 0 as ok,
    count(*) as evidence_count,
    count(distinct sd.id) as document_count,
    count(*) filter (where sd.sha256 is null or sd.sha256='') as missing_sha,
    count(*) filter (where sd.source_url is null or sd.source_url='') as missing_url
  from public.xray_signal_observations xso
  join public.observations o on o.id=xso.observation_id
  join public.source_records sr on sr.id=o.source_record_id
  join public.source_documents sd on sd.id=sr.source_document_id
  where xso.signal_id=p_signal_id;
$$;

do $$
declare t text;
begin
  foreach t in array array['source_records','observations','xray_signal_observations'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke insert, update, delete on table public.%I from anon, authenticated',t);
    execute format('grant select on table public.%I to anon, authenticated',t);
    execute format('drop policy if exists public_read on public.%I',t);
    execute format('create policy public_read on public.%I for select to anon, authenticated using (true)',t);
  end loop;
end $$;

grant select on public.xray_signal_evidence to anon, authenticated;
grant execute on function public.xray_provenance_check(uuid) to anon, authenticated;
