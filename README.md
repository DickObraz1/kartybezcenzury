# kartybezcenzury.cz

Hlavní stránka pro Karty bez cenzury. Stejný vzhled jako Black Friday stránka DickObrazu.

## Kde co změnit (bez programování)

Všechno je v jednom souboru: `src/content/texty.ts`

- **Texty, ceny, karty v mini hře, recenze, otázky a odpovědi:** přepiš, co je mezi uvozovkami.
- **Black Friday:** nahoře v části `AKCE`. Stránka ukazuje slevu a kód jen mezi daty `start` a `konec`.
  Po datu `konec` se sama vrátí do běžné podoby (běžné ceny, žádný kód, zpátky balíček KOMPLET).
  Vypnout dřív: přepiš `zapnuto: true` na `zapnuto: false`.
- **Balíček KOMPLET** se během Black Friday neukazuje, protože se na něj sleva nevztahuje.

Po změně stačí změnu uložit do GitHubu (větev `main`), Vercel stránku nasadí sám.

## Vyzkoušení

- `?cas=2026-12-05T10:00` na konci adresy ukáže stránku tak, jak bude vypadat v jiný den (třeba po akci).
- `?debug=1` vypisuje do konzole prohlížeče, co se posílá do měření.
- `?3d=0` vypne 3D krabičky nahoře.

## Co se měří (Google Analytics)

`view_item`, `select_item`, `kbc_cta_click` (klik na Koupit), `kbc_code_copy`, `kbc_kolo` (odehrané kolo mini hry),
`kbc_odcenzurovano`, `kbc_hraci`, `kbc_video`, `newsletter_signup`, `kbc_scroll`.
Nákup a přidání do košíku měří e-shop.

---

## Původní technické poznámky


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
