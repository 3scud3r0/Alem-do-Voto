# Deploy

## Supabase

1. Crie o projeto.
2. Execute `supabase/migrations/001_core.sql`.
3. Crie/obtenha uma **secret key** em Settings → API Keys.
4. Guarde `SUPABASE_URL` e `SUPABASE_SECRET_KEY` como segredo do Worker.

## Cloudflare R2

Crie dois buckets privados:

- `alem-do-voto-raw`
- `alem-do-voto-visuals`

O primeiro é a evidência bruta; o segundo contém SVG/PNG derivados.

## Worker

Copie `worker/wrangler.toml.example` para `worker/wrangler.toml`, ajuste os nomes dos buckets e então configure segredos:

```bash
wrangler secret put SUPABASE_SECRET_KEY
wrangler secret put COLLECTOR_TOKEN
```

Adicione `SUPABASE_URL` às vars do Worker. Publique em `api.alemdovoto.com.br`.

## Frontend

Publique `index.html` no Pages como primeira versão. Em produção, o frontend detecta `alemdovoto.com.br` e consulta `https://api.alemdovoto.com.br`.

## Portal da Transparência

O conector só deve ser ativado depois de obter o token oficial. Guarde-o como segredo `TRANSPARENCIA_API_KEY`; nunca no frontend.
