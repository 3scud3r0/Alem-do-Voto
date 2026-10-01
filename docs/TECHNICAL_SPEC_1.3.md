# Especificação técnica — Além do Voto 1.3

## 1. Objetivo

Consolidar o frontend editorial, corrigir definitivamente a interação cartográfica em UFs pequenas e incorporar transparência legislativa, auditoria de gastos e pesquisa documental municipal à arquitetura de proveniência existente.

## 2. Arquivos de frontend

### `index.html`

Responsabilidade: shell mínimo da aplicação.

Requisitos:

- carregar `assets/styles.css`;
- carregar vetor cartográfico de contingência antes de `assets/app.js`;
- carregar dossiê demonstrativo do Raio-X;
- manter dialogs globais de busca e documentos;
- não embutir regras de negócio no HTML.

### `assets/styles.css`

Responsabilidade: design system e composição editorial.

Mudanças 1.3:

- home escura com grid técnico, aura cartográfica e tipografia editorial;
- páginas internas em papel quente, hairlines e contraste reduzido;
- componentes específicos para Congresso, proposições, votações, auditoria e diários;
- estados do mapa `hover`, `focus`, `selected` e camada eleitoral separados;
- seleção persistente em dourado;
- responsividade específica abaixo de 900 px e 560 px;
- hit areas do mapa nunca podem receber `pointer-events:none`.

### `assets/app.js`

Responsabilidade: router estático, renderização das páginas, mapa, hidratação de APIs e interações.

#### Contrato do mapa

Cada UF é renderizada como:

```html
<g class="state-node" data-state-node data-uf="RJ">
  <path class="uf-visual" ...></path>
  <path class="uf-hit" ...></path>
</g>
```

Após o SVG entrar no DOM, são adicionados:

- `state-anchor-hit`: círculo invisível no centro da bounding box;
- `uf-label`: rótulo da UF também clicável.

RJ, ES, DF, SE e AL recebem âncora ampliada.

Eventos são delegados no host, evitando listeners frágeis em cada path. `click`, `Enter` e `Space` chamam `selectState()`.

`selectState()`:

1. grava `selectedUF`;
2. grava `sessionStorage`;
3. executa `syncMapSelection()` em todos os mapas;
4. atualiza cartão territorial;
5. mantém camada eleitoral separada.

#### Fontes cartográficas

1. API de malhas do IBGE, quando disponível;
2. vetor local simplificado e embutido, derivado de malha brasileira, para contingência offline.

A malha é somente visual; análises espaciais de alta precisão devem usar o GeoJSON original preservado.

## 3. Conectores

### `connectors/camara.mjs`

Cobertura:

- deputados;
- perfil individual;
- despesas;
- eventos;
- órgãos;
- frentes;
- proposições;
- detalhes da proposição;
- tramitação;
- temas;
- autores;
- votações;
- votos individuais;
- orientações;
- partidos.

### `connectors/senado.mjs`

Cobertura planejada/normalizada para membros, matérias e votações nominais disponibilizadas pelos serviços oficiais.

### `connectors/querido-diario.mjs`

Busca por `territory_ids`, texto, excertos e período. A resposta é normalizada antes de entrar no frontend.

### Outros conectores

`datajud.mjs`, `ibge.mjs`, `pncp.mjs`, `siconfi.mjs`, `transparencia.mjs` permanecem desacoplados e alimentam o mesmo modelo de documentos/registros/observações.

## 4. Worker

### `worker/worker.mjs`

Rotas acrescentadas:

- `/api/congress/deputies`
- `/api/congress/deputies/:id`
- `/api/congress/deputies/:id/expenses`
- `/api/congress/votes`
- `/api/congress/votes/:id`
- `/api/congress/votes/:id/orientations`
- `/api/congress/votes/:id/individual`
- `/api/congress/propositions`
- `/api/congress/propositions/:id`
- `/api/congress/propositions/:id/events`
- `/api/congress/propositions/:id/themes`
- `/api/congress/propositions/:id/authors`
- `/api/senate/members`
- `/api/senate/members/:id/votes`
- `/api/gazettes`
- `/api/audit/camara/deputy/:id`

As rotas eleitorais e de dossiê Raio-X existentes permanecem.

## 5. Auditoria

### `xray/audit-rules.mjs`

Regras atuais:

- concentração top-3;
- duplicidade documental;
- outlier robusto por MAD.

Toda função retorna razão, evidência e limitações; não retorna rótulo jurídico.

## 6. Banco

### `003_legislative_audit_gazettes.sql`

Novas tabelas:

- `legislative_propositions`;
- `legislative_proposition_themes`;
- `legislative_events`;
- `vote_orientations`;
- `parliamentary_expenses`;
- `gazette_documents`;
- `gazette_excerpts`;
- `review_cases`;
- `review_events`.

Views:

- `parliamentary_vote_summary`;
- `vote_pair_similarity`.

A similaridade é factual e carrega o denominador de votações comparáveis; não representa afinidade ideológica nem recomendação política.

## 7. Proveniência

A cadeia canônica permanece:

`source_document → source_record → observation → derived signal`

Um sinal público deve carregar, direta ou indiretamente:

- URL oficial;
- identificador original;
- data/hora de captura;
- SHA-256;
- cópia preservada;
- regra e versão;
- inputs;
- limitações.

## 8. Testes

### `map-contract.test.mjs`

Exige:

- 27 UFs;
- paths de SP, RJ, DF e ES;
- camada `uf-hit`;
- RJ listado entre UFs com âncora ampliada;
- delegação de clique;
- suporte a teclado;
- estilo dourado de seleção;
- ausência de sobreposição visual bloqueando pointer events.

### `audit-rules.test.mjs`

Testa concentração, duplicidade, MAD e existência de explicação/evidência/limitação.

### Limitação de validação do ambiente

O Chromium disponível no ambiente de geração bloqueou acesso ao `localhost`/`file://` por política do container. Portanto a validação automatizada final foi feita por testes de contrato, sintaxe e unidade, não por um clique E2E em navegador headless. O pacote mantém redundância de interação justamente para reduzir a dependência da precisão do path visível.
