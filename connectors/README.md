# Conectores

Cada conector é uma camada fina sobre uma fonte oficial ou cívica documentada. O pipeline de ingestão deve preservar a resposta **antes** de normalizá-la.

- `ibge.mjs` — localidades e malhas territoriais do IBGE.
- `camara.mjs` — API Dados Abertos da Câmara.
- `senado.mjs` — Dados Abertos do Senado.
- `pncp.mjs` — Portal Nacional de Contratações Públicas.
- `siconfi.mjs` — Tesouro/Siconfi.
- `transparencia.mjs` — Portal da Transparência (chave obrigatória).
- `datajud.mjs` — API Pública DataJud/CNJ; a chave pública vigente deve permanecer configurável.
- `querido-diario.mjs` — API pública do Querido Diário para diários oficiais municipais.

Receita/CNPJ é tratada como pipeline de arquivos em lote, não como uma API simples; por isso o conector será um importador próprio quando a etapa de ingestão empresarial for ativada.
