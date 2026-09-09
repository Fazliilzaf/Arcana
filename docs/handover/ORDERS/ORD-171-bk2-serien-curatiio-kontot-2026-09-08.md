# ORD-171 — BK2-serien (Curatiio-kontot), bokförs i Hair TP

Datum: 2026-09-08 · Bolag: **Hair TP Clinic gbg AB** · Annonskonto: 479410056348442 (Curatiio) · Ägar-GO: Fazli (2026-09-08, "allt drar på Hair TP Clinic")

## Bakgrund

Meta debiterar två annonskonton på Fazlis privata Amex-kort:

- `*K42` / `*L42` → Hair TP-kontot (1112651725849665) — hanterat i ORD-169 och ORD-170
- `*BK2` → Curatiio-kontot (479410056348442) — **inte genomgånget alls**

Ägarbeslutet är att allt bokförs i Hair TP Clinic gbg AB. Det stöds av kvittona: båda kontona har fakturamottagare med momsnummer **SE559034268801** = org.nr 559034-2688 = Hair TP Clinic. Vid omvänd skattskyldighet art. 196 är det den momsregistrerade mottagaren som redovisar. Inget flyttas mellan bolag.

BK2-serien har därmed samma status som allt annat: den ska vara rätt bokförd i Hair TP.

## Omfattning

Kortutdragen `tmp/platinum-61008.csv` (Amex 1008) och `tmp/sas-elite-86005.csv` (Amex 6005) innehåller **64 Meta-debiteringar** totalt. Av dessa är **27 i BK2-serien**.

En av dem — `6WWAYBVBK2` 2026-01-11, 7 500,00 — är redan bokförd som **A1995**. Återstår **26 att utreda**, summa **111 655,01 kr** netto.

**Hur många av de 26 som redan är bokförda är okänt.** Det är därför den här ordern börjar med avstämning, inte med bokföring.

### Amex 1008 (platinum-61008.csv) — 9 poster

| Datum      | Referens   | Belopp   |
| ---------- | ---------- | -------- |
| 2026-02-05 | ZX4B7D9BK2 | 1 381,83 |
| 2026-03-16 | CRS9KHVBK2 | 7 500,00 |
| 2026-03-25 | E5QUEJVBK2 | 4 240,42 |
| 2026-04-09 | KJRMZK5BK2 | 7 500,00 |
| 2026-05-14 | QGXP7RDBK2 | 4 629,39 |
| 2026-05-18 | H56KAQVBK2 | 1 951,68 |
| 2026-05-21 | 7MEYNQMBK2 | 2 110,29 |
| 2026-06-13 | 4CB8VSHBK2 | 1 984,19 |
| 2026-07-14 | G5LKWWMBK2 | 135,45   |

### Amex 6005 (sas-elite-86005.csv) — 17 poster

| Datum      | Referens   | Belopp   |
| ---------- | ---------- | -------- |
| 2026-01-20 | UU7YNC5BK2 | 1 391,73 |
| 2026-01-25 | Y3JA5D5BK2 | 5 057,06 |
| 2026-02-03 | QE7YYC9BK2 | 7 500,00 |
| 2026-02-16 | W3NYFGDBK2 | 7 500,00 |
| 2026-02-25 | KUFTXE9BK2 | 5 315,88 |
| 2026-04-24 | JT3DHMVBK2 | 7 500,00 |
| 2026-04-25 | W3EQZNRBK2 | 404,08   |
| 2026-05-09 | RHM9APVBK2 | 7 500,00 |
| 2026-05-16 | K5XLGPHBK2 | 2 505,26 |
| 2026-05-25 | G7D5GQHBK2 | 7 265,67 |
| 2026-05-31 | 9B2QWRMBK2 | 7 500,00 |
| 2026-06-07 | ZD8G6URBK2 | 7 500,00 |
| 2026-06-09 | JP87YSVBK2 | 2 381,95 |
| 2026-06-11 | UBZPNURBK2 | 2 377,41 |
| 2026-06-25 | JULV9WRBK2 | 7 246,94 |
| 2026-06-28 | B8QM9VMBK2 | 121,18   |
| 2026-07-25 | A98FJZRBK2 | 1 154,60 |

### Att klassificera separat

`2026-05-21 753ATQVAK2 1 103,91` (Amex 1008) slutar på `AK2`, inte `BK2` eller `K42`/`L42`. Serietillhörigheten är oklar. **Öppna kvittot och läs konto-id innan den hanteras** — gissa inte utifrån ändelsen.

## Steg 1 — avstämning (ingen bokföring)

För var och en av de 26, i denna ordning:

1. **Hämta kvittot.** Sök `kvitto@hairtpclinic.com` på avsändare `noreply@business-updates.facebook.com` runt debiteringsdatumet. Alternativt `~/Downloads/meta_all_transactions/curatiio/` (jan–jun; juli och augusti är **inte** nedladdade och måste hämtas från Meta).
2. **Läs ur kvittot:** Referensnummer, Faktura-nr, betalningsmetod, belopp, och att det står **Betald**.
3. **Sök beloppet i Fortnox** ("Sök belopp", hela räkenskapsåret).
4. **Träff → fastställ träffens transaktionsnyckel.** Samma referens = redan bokförd. Annan referens = posten saknas.
5. **Ingen träff** → posten saknas.
6. **Nyckeln går inte att fastställa** → bokför inte, lämna till Fazli.

Leverera en avstämningstabell innan något bokförs:

| Datum | Referens | Belopp | Kvitto hittat | Fortnox-träff | Nyckel på träffen | Slutsats |
| ----- | -------- | ------ | ------------- | ------------- | ----------------- | -------- |

Slutsats ska vara ett av: `redan bokförd` · `saknas – ska bokföras` · `till Fazli`.

**Stanna här och invänta granskning.** Ingen bokföring i steg 1.

## Steg 2 — bokföring (efter godkänd avstämning)

Fyra rader, betalkontot överst:

```
2893   KREDIT  <netto>    Skulder till närstående personer, kortfristig del
5911   DEBET   <netto>    Facebookannonsering
2614   KREDIT  <moms>     Utgående moms omvänd skattskyldighet, 25 %
2645   DEBET   <moms>     Beräknad ingående moms på förvärv från utlandet
```

Samtliga BK2-poster är betalda med Amex 1008 eller 6005. Båda korten står privat på Fazli, alltså **2893**. Dyker Mastercard 3888 upp på något kvitto gäller **2412** — men det ska läsas ur kvittot, inte antas.

Moms = 25 % av netto, avrundat till närmaste öre, halvt öre uppåt. 2614 och 2645 ska bära identiskt belopp.

Datum = debiteringsdatumet i tabellen. Beskrivning: `Meta ref <REFERENS> - <kort>`.

Batchar om tio. Stanna, rapportera, invänta granskning.

## Hårda regler

1. Betalkontot alltid överst.
2. Konto 5900 får aldrig användas.
3. Ett kvitto utan `Faktura-nr` är ett misslyckat betalningsförsök och bokförs aldrig.
4. **Cm-lagrets datum är periodstart, inte debiteringsdatum** — får aldrig ligga till grund för ett dubblettbeslut. Detsamma gäller `Datumintervall` i kvittomailet. Det som binder periodstart till debiteringsdatum är **kampanjperioden i kvitto-PDF:en** (`Från … till …`).
5. Betalkortet läses ur kvittots fält `Betalningsmetod`, aldrig ur ett kortutdrag.
6. En dubblett fastställs på transaktionsnyckel, aldrig på belopp + datum.
7. Beskrivningen på en befintlig verifikation skrivs inte över — nyckeln kan sitta där.
8. Vid minsta tvekan: avbryt utan att spara och rapportera.

## Tillägg efter granskad avstämning (2026-09-09)

Steg 1 är godkänt. Summan 111 468,87 kr stämmer mot en oberoende uträkning ur kortutdragen. Två poster utgår ur bokföringen eftersom de redan finns:

- **G5LKWWMBK2** (135,45) — ligger som A1210. Se nedan.
- **A98FJZRBK2** (1 154,60) — låg som A962 i fel form. **Formrättningen är gjord** och verifierad: 2893 K 1 154,60 · 5911 D 1 154,60 · 2614 K 288,65 · 2645 D 288,65.

### Extra uppgift: A1210 behöver formrättning

A1210 är den verifikation som får bära 135,45-debiteringen G5LKWWMBK2 — den enda av fyra med fastställd nyckel. Den ligger i gammal form och ska rättas med strykmetoden:

```
2893   KREDIT   135,45
5911   DEBET    135,45
2614   KREDIT    33,86
2645   DEBET     33,86
```

Summa 169,31 / 169,31. Beskrivning och datum rörs inte. Kör den i samma omgång som första batchen.

## Rör inte

- Allt som hör till ORD-169 och ORD-170.
- **A335 och A336** — nollade och verifierade 2026-09-09. Klara.
- **A345, A346 och A1209** — dubbletter av G5LKWWMBK2, nollas av Claude. Rör dem inte.

## Rapport

`docs/handover/ORDERS/facit/ord-171-steg1.md` för avstämningen, därefter `ord-171-batch-<nr>.md` per bokföringsbatch.

## Acceptanskriterier

1. Alla 26 poster avstämda med kvitto och Fortnox-sökning dokumenterad — inte påstådd.
2. `753ATQVAK2` klassificerad utifrån konto-id i kvittot.
3. Varje bokförd post har referensnummer läst ur kvitto eller mail.
4. Debet = kredit, differens 0,00, betalkontot på rad 1, inget konto 5900.
5. Summan av det som bokförs stämmer mot avstämningstabellen.
