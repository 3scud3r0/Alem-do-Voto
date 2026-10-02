# Além do Voto — 1.3 Integrated Civic Intelligence

Versão que integra três pilares funcionais ao núcleo eleitoral e documental do projeto:

1. **transparência legislativa** — perfis, proposições, tramitação, votações nominais, orientações, presença, afinidade factual e gastos;
2. **auditoria de gastos** — regras reproduzíveis que sinalizam padrões para revisão humana e explicam exatamente por que cada registro foi sinalizado;
3. **documentos municipais** — pesquisa em diários oficiais por palavra-chave, município e período, preservando excertos e referências ao documento.

O princípio central continua sendo: **nenhum número órfão**.

## Testar a interface

Abra `index.html` diretamente no navegador para consultar a estrutura editorial. Com `node serve.mjs`, Congresso, proposições, votações, perfis, despesas, auditoria e diários consultam fontes reais pelo backend. Se uma fonte falhar, a interface exibe indisponibilidade em vez de substituir a resposta por números sintéticos.

Para testar com o servidor local:

```bash
node serve.mjs
```

Depois abra `http://127.0.0.1:8787`.

## Teste do mapa

O mapa possui quatro superfícies independentes de interação por UF:

- geometria visível;
- `uf-hit` com traço transparente expandido;
- âncora circular invisível no centro geométrico, ampliada para RJ/ES/DF/SE/AL;
- rótulo da UF.

Ao clicar em **SP** ou **RJ**, a seleção é armazenada em `sessionStorage`, sincronizada entre todos os mapas e o estado selecionado recebe preenchimento dourado via `.state-node.selected .uf-visual`.

## Módulos da interface

- `#/eleicoes` — apuração e mapa oficial quando o TSE publicar snapshots;
- `#/congresso` — visão integrada do Legislativo;
- `#/politicos` — perfil parlamentar oficial e agregações de despesas com níveis L1/L2;
- `#/proposicoes` — proposições e tramitação;
- `#/votacoes` — votações nominais e votos individuais;
- `#/comparar` — comparação factual com denominadores explícitos;
- `#/auditoria` — fila de padrões para revisão humana;
- `#/municipios` — contexto municipal integrado;
- `#/diarios` — busca em diários oficiais;
- `#/raio-x` — dossiê documental com cálculo → observação → registro → documento → fonte;
- `#/dados` — arquitetura de proveniência e conectores;
- `#/replay` — arquivo temporal da apuração.

## Backend preparado

O Worker expõe rotas para TSE, Câmara, Senado e Querido Diário, além do motor de auditoria. Conectores adicionais estão preparados para DataJud, IBGE, PNCP, Siconfi e Portal da Transparência.

### Dados reais na interface

- `#/congresso` consulta o panorama agregado da Câmara;
- `#/proposicoes` consulta proposições do ano corrente;
- `#/votacoes` consulta os registros mais recentes de votação;
- `#/politicos` carrega identidade oficial e despesas CEAP de um parlamentar;
- `#/auditoria` executa regras reproduzíveis sobre essas despesas;
- `#/municipios` resolve qualquer código municipal válido pela API de Localidades do IBGE;
- `#/diarios` pesquisa documentos no Querido Diário.

Nenhum conjunto sintético é carregado pela interface pública. Os arquivos em `demo/` são fixtures exclusivas da suíte de proveniência e nunca são usados como fallback. O Raio-X público executa triagem sobre despesas oficiais, mas bloqueia o estado documental de publicação enquanto o arquivo SHA-256 de produção não estiver configurado. O replay eleitoral permanece vazio até que exista um snapshot oficial preservado no banco.

## Banco

Aplicar as migrações nesta ordem:

1. `supabase/migrations/001_core.sql`
2. `supabase/migrations/002_xray_provenance.sql`
3. `supabase/migrations/003_legislative_audit_gazettes.sql`

Nenhum projeto Supabase está conectado nesta sessão, portanto as migrações estão prontas, mas não foram aplicadas em produção.

## Testes

```bash
npm test
npm run check
```

A suíte cobre:

- fórmulas do Raio-X;
- integridade do dossiê demonstrativo e hashes;
- contrato do mapa, incluindo especificamente SP e RJ;
- regras de auditoria de despesas.

## Documentação

- `docs/TECHNICAL_SPEC_1.3.md` — especificação técnica da versão;
- `docs/INTEGRATED_FEATURES.md` — funcionalidades absorvidas dos três eixos de referência;
- `docs/XRAY.md` — contrato documental do Raio-X;
- `docs/ARCHITECTURE.md` — arquitetura geral;
- `docs/DATA_SOURCES.md` — catálogo de fontes;
- `docs/LANDSCAPE.md` — panorama de projetos adjacentes.

## Importante

Dados demonstrativos são sintéticos e nunca devem ser interpretados como afirmações sobre uma pessoa real. O Raio-X não produz nota moral, acusação, diagnóstico de ilegalidade, ranking político ou recomendação eleitoral.
