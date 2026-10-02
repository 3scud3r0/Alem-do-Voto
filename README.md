# Além do Voto — Arquitetura de Inteligência Cívica (Demo)

O **Além do Voto** é um motor de interface e rastreabilidade de dados públicos desenvolvido para integrar dados eleitorais, legislativos, de contratos e diários oficiais municipais em uma única experiência temporal.

⚠️ **AVISO LEGAL E EDITORIAL IMPORTANTE** ⚠️

> **Esta instância pública no GitHub Pages é um ambiente puramente demonstrativo e metodológico.**
>
> Todos os dados visíveis na interface hospedada aqui (incluindo perfis, nomes de empresas, valores de contratos, despesas e variações patrimoniais) são **100% SINTÉTICOS E FICTÍCIOS**. Eles foram gerados exclusivamente para demonstrar a capacidade da arquitetura e o funcionamento do motor de auditoria.
>
> **Nenhum dado exibido aqui deve ser interpretado como uma afirmação sobre pessoas reais, políticos reais ou empresas reais. Esta ferramenta não produz notas morais, diagnósticos de ilegalidade ou acusações.**

🌐 **[Acessar a Demonstração (GitHub Pages) com Dados Sintéticos](3scud3r0.github.io/Alem-do-Voto/)**

---

## 🎯 O Princípio: Nenhum número órfão

A maior falha das plataformas de tecnologia cívica é pedir que o usuário confie cegamente num "ranking" ou numa "nota". O **Além do Voto** foi desenhado com base na **Cadeia de Custódia Documental**.

Nesta arquitetura, todo número derivado deve descer até o registro primário que o produziu:

`Cálculo Matemático → Observação → Registro Bruto → Documento Fonte Oficial → Hash SHA-256 da Coleta`

O motor de "Raio-X" bloqueia a publicação de qualquer sinal se a proveniência do documento original não puder ser criptograficamente comprovada.

---

## 🧩 Eixos Funcionais da Arquitetura

1. **Transparência Legislativa:** Agregação de perfis, proposições, tramitação, votações nominais, presença e gastos (CEAP).
2. **Auditoria Baseada em Regras:** Motor que avalia despesas usando métodos robustos (ex: Desvio Absoluto Mediano - MAD, sobreposição temporal de quadros societários) para gerar filas de revisão humana, explicando exatamente a fórmula matemática utilizada.
3. **Documentos Municipais:** Busca textual integrada (via API do Querido Diário) para cruzar atos oficiais municipais com entidades territoriais do IBGE.
4. **Memória Eleitoral:** Replay temporal de apurações e snapshots preservados.

---

## 🛠 Pirâmide de Confiança

Para garantir neutralidade, o código classifica a exibição de dados em três níveis (visíveis na interface):

* **L1 (Original):** O registro oficial bruto, sem edição (Ex: "Votou SIM").
* **L2 (Agregação):** Agregação determinística de dados L1 (Ex: Soma total de despesas).
* **L3 (Cálculo Derivado):** Modelos estatísticos e cálculos matemáticos com denominadores explícitos (Ex: Variação patrimonial nominal, similaridade factual em votações).

---

## 💻 Como usar este repositório (Para Jornalistas e ONGs)

Este repositório foi aberto para que iniciativas de jornalismo de dados, cientistas de dados e organizações não-governamentais (ONGs) possam fazer um *fork* da arquitetura e conectá-la a bancos de dados reais.

### Executando Localmente

Se você quiser rodar a interface com o servidor local simulado (que contém os arquivos sintéticos da pasta `demo/`):

1. Clone o repositório:

   ```bash
   git clone https://github.com/seu-usuario/alem-do-voto.git
   cd alem-do-voto
   ```

2. Inicie o servidor local:

   ```bash
   npm start
   # ou
   node serve.mjs
   ```

3. Abra [http://127.0.0.1:8787](http://127.0.0.1:8787) no seu navegador.

### Conectando a Dados Reais

Para implementar esta arquitetura em produção com dados reais do governo brasileiro, os conectores e o pipeline estão desenhados para funcionar com **Cloudflare Workers** e bancos PostgreSQL (como **Supabase**), usando buckets de objetos (R2/S3) para armazenar os arquivos .json ou .csv originais do Governo para cálculo de hash.

- Consulte a pasta `docs/` para especificações técnicas, rotas de API, conectores preparados (Câmara, TSE, Senado, PNCP) e esquema de banco de dados (`supabase/migrations/`).

---

## 🧪 Testes

O projeto contém testes rigorosos garantindo o contrato da interface (incluindo o mapa interativo em SVG fallback), fórmulas matemáticas do Raio-X e integridade dos hashes criptográficos do dossiê:

```bash
npm run check
npm test
```

---

## ⚖️ Licença e Uso Responsável

Distribuído sob a licença **MIT**. Você é livre para usar, modificar e distribuir este código.

Ao conectar este código a APIs governamentais reais, **a responsabilidade editorial, jurídica e de conformidade com a LGPD recai inteiramente sobre o implementador**. É altamente recomendável estar amparado por uma instituição de imprensa ou ONG com suporte jurídico adequado ao lidar com os dados do cenário político brasileiro.

### O que essa abordagem faz por você:

1. **Blindagem Absoluta:** Ao afirmar logo de cara que o ambiente no ar é sintético e metodológico, se algum político chegar lá, ele não encontrará o nome dele, apenas "Fulano Demonstrativo LTDA".
2. **Posicionamento de Arquiteto:** Você mostra o código sofisticado que escreveu (o que é ótimo para currículo, portfólio e para arrumar emprego/freela em tecnologia cívica e grandes jornais), sem carregar o peso de ser o "publisher" (editor).
3. **Fica pronto para adoção:** Se a Transparência Brasil, o projeto Serenata de Amor ou a Open Knowledge Brasil virem isso, eles podem clonar, colocar o CNPJ deles na reta, injetar os dados reais via Cloudflare Workers e colocar no ar dando os devidos créditos a você pelo código.
