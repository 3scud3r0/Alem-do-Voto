# Funcionalidades integradas — versão 1.3

A versão 1.3 absorve três padrões de produto que já provaram utilidade em civic tech, sem copiar identidade visual ou transformar metodologia externa em regra nossa.

## 1. Eixo Legislativo

Inspirado pela necessidade de reunir o que hoje costuma estar espalhado entre Câmara e Senado.

### Perfis 360

Cada parlamentar pode reunir:

- identidade oficial e mandato;
- casa, UF e partido ao longo do tempo;
- presença em votações nominais;
- votos individuais;
- orientações partidárias/blocos quando publicadas;
- afinidade factual de voto com denominador explícito;
- proposições autoradas/coautoradas;
- temas oficiais associados às proposições;
- relatorias, órgãos e eventos de tramitação;
- gastos parlamentares disponíveis na fonte;
- histórico temporal.

### Pirâmide de confiança

- **L1:** registro oficial bruto;
- **L2:** agregação determinística sobre L1;
- **L3:** cálculo com parâmetros declarados.

A interface deve mostrar o nível ao lado da métrica e nunca esconder o denominador de uma porcentagem derivada.

### Proposições

A página de uma proposição deve permitir reconstruir:

`apresentação → comissões → relatoria → plenário → casa revisora → sanção/veto`

Cada evento deve conservar fonte, data, órgão, descrição e identificador original.

### Votações

Para votações nominais:

- resultado da votação;
- voto individual quando publicado;
- orientação formal quando publicada;
- proposição vinculada;
- data, casa e órgão;
- universo comparável usado nos cálculos.

Votações simbólicas ou sem registro individual não podem ser convertidas em voto individual inferido.

## 2. Eixo Auditoria de gastos

O objetivo não é declarar fraude. O objetivo é encontrar registros que merecem leitura humana e explicar a regra que os colocou na fila.

### Regras iniciais

- concentração de fornecedores;
- valores extremos por MAD/estatística robusta;
- duplicidade de campos relevantes;
- frequência atípica no mesmo período;
- sobreposição temporal entre vínculos documentados;
- fornecedores recorrentes fora do padrão do grupo comparável.

### Saída obrigatória de uma regra

Cada sinal deve conter:

- `rule_id` e `rule_version`;
- motivo textual;
- fórmula;
- inputs;
- universo comparável;
- IDs dos registros envolvidos;
- IDs dos documentos-fonte;
- limitações interpretativas;
- status de revisão humana.

### Fluxo de revisão

`detecção → fila → leitura de evidências → revisão humana → anotação → publicação/arquivamento`

O status deve distinguir pelo menos:

- novo;
- em revisão;
- explicado/contextualizado;
- permanece relevante para verificação;
- descartado pela revisão.

Nenhum desses estados equivale a decisão judicial ou administrativa.

## 3. Eixo Documentos municipais

O produto integra pesquisa em diários oficiais como porta de entrada documental para municípios.

### Busca

Filtros:

- palavra ou expressão;
- código IBGE/território;
- data inicial/final;
- ordenação;
- número de excertos;
- edição quando disponível.

### Resultado

Cada resultado deve mostrar:

- município;
- data;
- edição;
- excerto;
- termos destacados;
- documento original;
- versão aberta/textual quando disponível;
- identificador e URL da fonte;
- data da captura local.

### Cruzamentos futuros

`diário oficial ↔ contrato ↔ PNCP ↔ CNPJ ↔ pagamento ↔ emenda ↔ agente público`

Uma conexão documental é apresentada como conexão, não como conclusão sobre intenção ou legalidade.

## 4. O que é próprio do Além do Voto

A integração acima recebe quatro camadas adicionais próprias do produto:

1. **eleição temporal:** snapshots do TSE preservados durante a apuração;
2. **cartografia única:** a mesma entidade territorial conecta eleição, orçamento, contratos e documentos;
3. **Raio-X de proveniência forte:** todo número derivado desce até registro e documento;
4. **arquivo visual:** cada snapshot pode gerar uma peça SVG/PNG reproduzível para memória e publicação editorial.
