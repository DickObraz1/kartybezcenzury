# kartybezcenzury.cz — Landing page

Konverzní landing page pro karetní hru Karty bez cenzury (DickObraz).
Stack: Astro + Tailwind CSS v4, nasazení na Vercel.

## Spuštění lokálně

```sh
npm install
npm run dev
```

Stránka poběží na http://localhost:4321

## Build

```sh
npm run build
```

Výstup je ve složce `dist/`.

## Nasazení na Vercel

1. Založ účet na [vercel.com](https://vercel.com) (zdarma).
2. Nainstaluj Vercel CLI: `npm i -g vercel`
3. V složce projektu spusť: `vercel`
4. Nebo propoj GitHub repo přes Vercel dashboard — každý push = automatický deploy.
5. V Vercel nastav doménu `kartybezcenzury.cz` přes Settings → Domains.

## Proměnné prostředí

Pro Fázi 5 (Ecomail) přidej do Vercel dashboardu:
- `ECOMAIL_API_KEY` — API klíč z Ecomailu
- `ECOMAIL_LIST_ID` — ID seznamu odběratelů

Lokálně: zkopíruj `.env.example` jako `.env` a doplň hodnoty.

## Fáze projektu

- ✅ Fáze 0 — Setup (Astro + Tailwind + Git)
- ✅ Fáze 1 — Statická kostra + design systém
- ⬜ Fáze 2 — Reálná produktová data (products.json)
- ⬜ Fáze 3 — Funkční add-to-cart tlačítka
- ⬜ Fáze 4 — Interaktivní karetní galerie (Embla)
- ⬜ Fáze 5 — Email signup (Ecomail serverless)
- ⬜ Fáze 6 — Polish, SEO, analytika, QA
