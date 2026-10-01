# Raio-X — contrato documental 1.3

O Raio-X é um mecanismo de triagem documental. Ele não produz nota de político, ranking, diagnóstico de ilegalidade ou juízo de intenção.

## Princípio central

**Nenhum número órfão.** Todo valor exibido deve ser rastreável por esta cadeia:

`signal -> observation -> source_record -> source_document -> source_url + SHA-256`

Na interface, isso significa que cada percentual, valor monetário, contagem ou relação possui um caminho clicável até os documentos que o originaram.

## Estrutura mínima de um sinal

- regra e versão;
- período;
- universo comparável;
- fórmula;
- valores de entrada;
- IDs dos registros;
- documentos-fonte;
- URL oficial;
- data/hora de captura;
- hash SHA-256 da cópia preservada;
- limitações interpretativas.

## Regras iniciais

### Concentração de fornecedores
`C₃ = (gasto_1 + gasto_2 + gasto_3) / gasto_total`

### Variação patrimonial declarada
`V = (patrimônio_atual - patrimônio_anterior) / patrimônio_anterior`

### Outlier robusto
`zᵣ = 0,6745 × (x - mediana) / MAD`

### Sobreposição temporal
`max(inícios) <= min(fins)`

A sobreposição de uma relação societária com um contrato, por exemplo, é somente uma relação temporal documentada. Não demonstra conflito de interesses sem análise jurídica e factual adicional.

## Bloqueio de publicação

A aplicação deve impedir publicação pública se `xray_provenance_check()` indicar ausência de evidência, URL ou SHA-256.


## Fila de revisão 1.3

Além da proveniência, sinais automatizados devem possuir estado de revisão humana. O sistema não deve promover automaticamente um sinal estatístico a conclusão factual sobre irregularidade.

Estados recomendados: `new`, `in_review`, `contextualized`, `kept_for_review`, `dismissed`.

O histórico de revisão é armazenado separadamente do documento-fonte para que uma interpretação editorial jamais altere o registro original.
