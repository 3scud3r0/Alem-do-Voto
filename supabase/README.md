# Supabase

1. Crie o projeto Supabase na região de São Paulo (`sa-east-1`) se disponível para sua conta.
2. Aplique `migrations/001_core.sql` pelo SQL Editor ou via CLI.
3. Em **Settings → API Keys**, use uma **secret key** (`sb_secret_...`) somente no Worker/servidor.
4. Nunca coloque a secret key no `index.html`, GitHub público ou JavaScript do navegador.
5. O frontend futuro deve usar apenas uma **publishable key** (`sb_publishable_...`) e RLS.

Nesta conversa, nenhuma instância Supabase estava conectada, então a migração foi preparada, mas não executada em produção.
