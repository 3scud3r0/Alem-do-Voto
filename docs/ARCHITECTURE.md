# Arquitetura 1.2

## 1. Raw primeiro

Cada coletor segue a ordem:
1. buscar o documento na fonte;
2. preservar os bytes no R2;
3. calcular SHA-256;
4. registrar URL, captura e identificador;
5. extrair registros identificáveis;
6. criar observações normalizadas;
7. executar regras do Raio-X;
8. publicar somente sinais com proveniência completa.

## 2. Quatro níveis de evidência

### `source_documents`
Arquivo ou resposta exatamente recebida da fonte.

### `source_records`
Registro identificável dentro do documento: linha de CSV, item JSON, contrato, voto, despesa ou declaração.

### `observations`
Valor que a aplicação usa: R$ 410.000, data 18/04/2026, voto “Sim”, vínculo ativo etc.

### `xray_signals`
Resultado derivado por regra explícita. O sinal não substitui as observações nem os documentos.

## 3. Temporalidade

Partido, mandato, sociedade, contrato e vínculo são intervalos. Toda relação relevante mantém datas de validade.

## 4. Resolução de entidades

Nunca associe pessoas apenas por nome. IDs TSE/Câmara/Senado, datas e outros atributos compõem a evidência de correspondência. Relações inferidas registram método e evidência.

## 5. Cartografia

A interface carrega a malha de UFs da API de Malhas do IBGE; há contingência vetorial baseada no mesmo referencial. Seleção territorial é uma camada diferente da camada eleitoral: amarelo significa **seleção**, cores eleitorais só aparecem com snapshot do TSE.

## 6. Segurança

- R2 raw privado;
- secret key Supabase apenas no backend;
- RLS em schemas expostos;
- endpoint administrativo protegido;
- documentos com restrição legal não devem ser redistribuídos automaticamente só porque foram indexados.
