# ORD-168 — Rättelseverifikat via Fortnox API

Datum: 2026-09-08 · Ägar-GO: Fazli (2026-09-08, "du får lösa det genom API:n")

## Problem

Arcana har bokfört Meta- och Google-annonser fel i stor skala. 67 verifikationer med mönstret `5900 D / 2645 D / 2614 K / 1930 K` plus 55 utan omvänd moms. Felen är systematiska:

1. **Fel kostnadskonto.** 5900 är ett gruppkonto — Fortnox märker det själv "Reklam och PR (gruppkonto)". Ska vara **5911 Facebookannonsering** enligt facit A268. Konto 5911 används inte en enda gång i behandlingshistoriken.
2. **Fel betalkonto.** Samtliga annonsköp är betalda med kort — Amex 6005/1008 (privata, Fazli) eller Mastercard 3888 (HB företagskort). Arcana krediterar 1930 på alla. Rätt är **2893** (privat utlägg) respektive **2412 HB Kort**.
3. **Betalningar bokförda som kostnader.** Googles gränsdebiteringar (5 000,00 kr) är betalningar, inte kostnader. Kostnaden är månadsfakturan.
4. **Dubbletter.** Samma kostnad bokförd 2–4 gånger.
5. **Saknade poster.** Betalda Meta-transaktioner som aldrig bokförts.

## Nuläge i koden

- `src/cfo/cfoFortnoxClient.js:332` — `createVoucher(payload)` → `POST /vouchers`. Finns.
- `src/cfo/cfoFortnoxVoucherSync.js` — enda anroparen. Bygger verifikat ur CFO-utläggsposter. **Kan inte rätta befintliga verifikationer.**
- Gates: `ARCANA_CFO_FORTNOX_VOUCHER_SYNC_ENABLED` + `voucher-sync-override.json`.
- Kommentar på rad 329–330 varnar för att OAuth-scope kan behöva `bookkeeping`. **Verifiera scope före skarp körning.**

## Uppdrag

Bygg en **rättelse-runner** som tar en spec och postar rättelseverifikat.

### Krav

1. **Input:** JSON-spec, en post per rättelse (format nedan). Ingen härledning i koden — specen är facit.
2. **dryRun först**, alltid. Skarp körning kräver samma dubbla gate som voucher-sync.
3. **Radordning: betalkontot ALLTID överst.** Gäller alla facit (A268, A1028, A26, A28). Ordningen är en del av kontraktet, inte kosmetik.
4. **Idempotens.** Description ska bära ursprungsverifikatets nummer, t.ex. `RÄTTELSE A331 · Meta ref VN57KU5L42`. Kör aldrig samma rättelse två gånger — kontrollera mot `listVouchers` före post.
5. **Underlag.** Rättelsen ska kunna referera Meta-kvittots transaktions-id och Faktura-nr i Description.
6. **Rapport ut:** per post — ursprungsvernr, nytt vernr, gammal kontering → ny kontering, debet/kredit-summa, status.
7. **Ingen makulering.** Runner rör inte dubbletter — de listas för manuellt beslut.

### Konteringsmallar

Annonsköp Meta, betalt med privat Amex:

```
2893  Skuld till närstående          K  netto
5911  Facebookannonsering            D  netto
2614  Utg. moms omvänd skattsk. 25 % K  0,25 × netto
2645  Ing. moms förvärv utland 25 %  D  0,25 × netto
```

Betalt med HB företagskort (Mastercard 3888): samma, men **2412 HB Kort** i stället för 2893.

## Batch 1 — Meta juli 2026, Hair TP (annonskonto 1112651725849665)

Ren omklassificering. Momsraderna 2645/2614 är redan rätt i A331/A332/A333/A334/A348/A350/A352 — därför flyttas bara kostnads- och betalkonto.

```json
[
  {
    "origin": "A331",
    "date": "2026-07-10",
    "metaRef": "VN57KU5L42",
    "description": "RÄTTELSE A331 · Meta ref VN57KU5L42 · Amex 1008",
    "rows": [
      { "Account": 2893, "Credit": 7096.0 },
      { "Account": 1930, "Debit": 7096.0 },
      { "Account": 5911, "Debit": 7096.0 },
      { "Account": 5900, "Credit": 7096.0 }
    ]
  },
  {
    "origin": "A332",
    "date": "2026-07-07",
    "metaRef": "XYTK3TDL42",
    "description": "RÄTTELSE A332 · Meta ref XYTK3TDL42 · Amex 1008",
    "rows": [
      { "Account": 2893, "Credit": 7096.0 },
      { "Account": 1930, "Debit": 7096.0 },
      { "Account": 5911, "Debit": 7096.0 },
      { "Account": 5900, "Credit": 7096.0 }
    ]
  },
  {
    "origin": "A333",
    "date": "2026-07-01",
    "metaRef": "9MH3MSVK42",
    "fortnoxInvoice": "FBADS-066-106218592",
    "description": "RÄTTELSE A333 · Meta ref 9MH3MSVK42 · Amex 1008",
    "rows": [
      { "Account": 2893, "Credit": 7096.0 },
      { "Account": 1930, "Debit": 7096.0 },
      { "Account": 5911, "Debit": 7096.0 },
      { "Account": 5900, "Credit": 7096.0 }
    ]
  },
  {
    "origin": "A334",
    "date": "2026-07-03",
    "metaRef": "BQREPSMK42",
    "description": "RÄTTELSE A334 · Meta ref BQREPSMK42 · Amex 1008",
    "rows": [
      { "Account": 2893, "Credit": 7096.0 },
      { "Account": 1930, "Debit": 7096.0 },
      { "Account": 5911, "Debit": 7096.0 },
      { "Account": 5900, "Credit": 7096.0 }
    ]
  },
  {
    "origin": "A348",
    "date": "2026-07-14",
    "metaRef": "YA64TTDL42",
    "description": "RÄTTELSE A348 · Meta ref YA64TTDL42 · Mastercard 3888 (HB-kort)",
    "rows": [
      { "Account": 2412, "Credit": 7474.82 },
      { "Account": 1930, "Debit": 7474.82 },
      { "Account": 5911, "Debit": 7474.82 },
      { "Account": 5900, "Credit": 7474.82 }
    ]
  },
  {
    "origin": "A350",
    "date": "2026-07-15",
    "metaRef": "ZLTFXTRK42",
    "description": "RÄTTELSE A350 · Meta ref ZLTFXTRK42 · Amex 1008",
    "rows": [
      { "Account": 2893, "Credit": 1285.83 },
      { "Account": 1930, "Debit": 1285.83 },
      { "Account": 5911, "Debit": 1285.83 },
      { "Account": 5900, "Credit": 1285.83 }
    ]
  },
  {
    "origin": "A352",
    "date": "2026-07-16",
    "metaRef": "S3TH9VML42",
    "description": "RÄTTELSE A352 · Meta ref S3TH9VML42 · Amex 6005",
    "rows": [
      { "Account": 2893, "Credit": 5322.0 },
      { "Account": 1930, "Debit": 5322.0 },
      { "Account": 5911, "Debit": 5322.0 },
      { "Account": 5900, "Credit": 5322.0 }
    ]
  }
]
```

### Batch 1b — saknad moms (1 st)

A2226 är bokförd som ren svensk kostnad utan omvänd skattskyldighet.

```json
{
  "origin": "A2226",
  "date": "2026-07-25",
  "metaRef": "K3NQYUDL42",
  "description": "RÄTTELSE A2226 · Meta ref K3NQYUDL42 · Amex 6005 · lägger till omvänd moms",
  "rows": [
    { "Account": 2893, "Credit": 6710.02 },
    { "Account": 1930, "Debit": 6710.02 },
    { "Account": 5911, "Debit": 6710.02 },
    { "Account": 5900, "Credit": 6710.02 },
    { "Account": 2614, "Credit": 1677.51 },
    { "Account": 2645, "Debit": 1677.51 }
  ]
}
```

### Batch 1c — betald men aldrig bokförd (1 st)

Nytt verifikat, ingen rättelse.

```json
{ "origin": null, "date": "2026-07-19", "metaRef": "QTRMKV5L42",
  "description": "Meta annonser · ref QTRMKV5L42 · Amex 6005",
  "rows": [
    { "Account": 2893, "Credit": 7096.00 },
    { "Account": 5911, "Debit":  7096.00 },
    { "Account": 2614, "Credit": 1774.00 },
    { "Account": 2645, "Debit":  1774.00 }
  ] }
}
```

## Rör INTE i denna order

| Vernr                           | Varför                                                                                                    |
| ------------------------------- | --------------------------------------------------------------------------------------------------------- |
| A347, A349, A351                | Dubbletter. Den rätta motparten är fastställd (A348, A350, A352). Fazli makulerar manuellt.               |
| A335, A336, A345, A346          | Saknar betald Meta-transaktion. Ingen verifierad motpart → kan inte klassas som dubblett. Egen utredning. |
| A1649, A1657, A1676–A1679 m.fl. | Google-gränsdebiteringar bokförda som kostnad. Egen order.                                                |

## Acceptanskriterier

1. dryRun visar alla nio posterna i batch 1 med korrekt radordning, betalkonto överst.
2. Debet = kredit i varje post.
3. Skarp körning skapar nio verifikat, alla med `RÄTTELSE <vernr>` eller Meta-ref i Description.
4. Andra körningen av samma spec skapar **noll** nya verifikat.
5. Rapport visar gammal → ny kontering per post.

## Underlag

- `~/Downloads/kvitton-2026/` och `~/Downloads/` — Meta-kvitton juli 2026, filnamn `ÅÅÅÅ-MM-DDTHH-MM Transaktion #<id>-<id>.pdf`
- Meta Business → Fakturering → Betalningsaktivitet, annonskonto 1112651725849665
- Facit: A268 (Meta), A1028 (HB-kort), A26 (utlägg), A28 (Amex-inlösen)
