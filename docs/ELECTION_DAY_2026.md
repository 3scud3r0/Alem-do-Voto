# Runbook — 4 de outubro de 2026

## Antes das 16h30 BRT

- confirmar `/api/health`;
- confirmar escrita nos dois buckets R2;
- confirmar inserção de snapshot no Supabase usando o **simulador**, nunca o ambiente oficial;
- trocar `TSE_MODE=official`, `TSE_ENV=oficial`, `TSE_ELECTION_CODE=6257`;
- invalidar qualquer cache da API de resultado;
- verificar relógio UTC/Brasília;
- manter uma cópia local do último deploy conhecido como estável.

## Durante a apuração

- coletar no máximo uma vez por minuto por arquivo nesta versão;
- preservar o raw antes de normalizar;
- não descartar snapshot só porque o percentual não mudou: o `idg`/hash decide a deduplicação;
- nunca substituir um arquivo arquivado;
- se normalização falhar, manter o raw e registrar erro — não inventar campos.

## Depois

- congelar manifesto de hashes da noite;
- exportar replay e cards a partir dos snapshots;
- comparar último snapshot com resultado final oficial;
- manter o modo replay como histórico, sem chamadas ao endpoint ao vivo.
