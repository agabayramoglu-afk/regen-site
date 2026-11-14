# Regen

Regen takipçileri için taktik ve psikoloji topluluk sitesi: üyelik, onaylı yazılar, yorum ve beğeni, diziliş kurucu, taktik tahta, yönetim paneli.

## Yapı

- TanStack Start (React 19, sunucuda çizim), Cloudflare Workers üzerinde çalışır.
- Veritabanı: Cloudflare D1 (`DB`). Tablolar ilk istekte kendiliğinden kurulur (`src/lib/regen/sema.server.ts`).
- İlk açılan hesap yönetici olur.

## Cloudflare'e yayın

Cloudflare panelinde **Workers & Pages → Create → Import a repository** ile bu depoyu bağlayın:

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`

`wrangler.jsonc` içindeki `database_id` değerine `regen-db` D1 veritabanının kimliği yazılmalıdır.

## Yerelde çalıştırma

```bash
npm install
npm run build
npx wrangler dev
```
