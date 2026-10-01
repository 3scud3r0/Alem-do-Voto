# Fontes e contratos de dados

| Fonte | Uso | Acesso no projeto |
|---|---|---|
| TSE | resultados 2026, candidaturas, bens, contas e histórico | Worker + arquivo R2 |
| IBGE | malhas, UFs, municípios e códigos territoriais | frontend + `connectors/ibge.mjs` |
| Câmara | deputados, proposições, votações, votos nominais e despesas | `connectors/camara.mjs` |
| Senado | senadores, matérias, votações e atividade legislativa | `connectors/senado.mjs` |
| PNCP | contratações, contratos e documentos | `connectors/pncp.mjs` |
| Siconfi | entes, DCA, RREO, RGF e dados fiscais | `connectors/siconfi.mjs` |
| Portal da Transparência | contratos, emendas, licitações e sanções | `connectors/transparencia.mjs` |
| DataJud/CNJ | metadados públicos processuais e movimentações | `connectors/datajud.mjs` |
| Querido Diário | diários oficiais municipais e excertos | `connectors/querido-diario.mjs` |
| Receita/CNPJ | cadastro e quadro societário | pipeline em lote a implementar |

## URLs técnicas principais

- TSE resultados: `https://resultados.tse.jus.br`
- TSE candidaturas/contas: `https://divulgacandcontas.tse.jus.br/`
- IBGE malhas v4: `https://servicodados.ibge.gov.br/api/v4/malhas`
- Câmara v2: `https://dadosabertos.camara.leg.br/api/v2`
- Senado: `https://legis.senado.leg.br/dadosabertos`
- PNCP consulta: `https://pncp.gov.br/api/consulta`
- Siconfi: `https://apidatalake.tesouro.gov.br/ords/siconfi/tt`
- Portal da Transparência: `https://api.portaldatransparencia.gov.br/api-de-dados`
- DataJud: `https://api-publica.datajud.cnj.jus.br/`
- Querido Diário: `https://api.queridodiario.ok.org.br/`

## Política de ingestão

1. Arquivo/resposta original é preservado primeiro.
2. SHA-256 é calculado sobre os bytes recebidos.
3. Registros são extraídos com identificadores de origem.
4. Valores normalizados viram `observations`.
5. Regras derivadas referenciam explicitamente as observações usadas.
6. Um sinal sem proveniência completa não é publicado.

Use API para consultas incrementais e baixa latência. Para bases volumosas com download oficial em lote, ingira o arquivo completo e registre seu hash em vez de paginar milhões de registros por API.
