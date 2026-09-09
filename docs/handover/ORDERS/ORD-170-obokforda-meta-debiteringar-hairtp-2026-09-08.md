# ORD-170 — 20 obokförda Meta-debiteringar, Hair TP

Datum: 2026-09-08 · Bolag: **Hair TP Clinic gbg AB** · Annonskonto: 1112651725849665 · Ägar-GO: Fazli (2026-09-08)

## Vad det handlar om

Tjugo betalda Meta-debiteringar saknar verifikation i Fortnox. De hittades vid matchningen av kortutdragen mot verifikationslistan i ORD-169 och bokfördes medvetet **inte** då — risken för dubbletter var för hög innan transaktionsnyckeln var etablerad.

Nu är den etablerad. Den här ordern bokför dem.

**Netto 131 979,34 kr · moms 32 994,84 kr · totalt 164 974,18 kr.**

Det är större än allt som rättats i ORD-169 tillsammans. Kostnaderna är verkliga, betalda och saknas helt i böckerna.

## Avgränsning — läs detta först

Ägarbeslut 2026-09-08: **allt drar på Hair TP Clinic.** Båda annonskontonas kostnader bokförs i Hair TP Clinic gbg AB. Det bekräftas av kvittona — båda kontona har momsnummer SE559034268801, alltså org.nr 559034-2688. Inget flyttas mellan bolag.

**Den här ordern omfattar ändå bara `*K42`/`*L42`-serien**, alltså Hair TP:s eget annonskonto. `*BK2`-serien (Curatiio-kontot) är inte genomgången och ingår inte här.

I de delar av kortutdragen som lästs finns minst ~25 `*BK2`-debiteringar. Hur många av dem som redan är bokförda är inte utrett. Eftersom de enligt ägarbeslutet också hör hemma i Hair TP behöver de en egen avstämning — men **inte i den här ordern**. Blanda inte in dem.

## Posterna

Samtliga referenser nedan är i serien `*K42` / `*L42`.

| #   | Datum      | Referens   | Netto     | Moms 25 % | Kort                | Betalkonto |
| --- | ---------- | ---------- | --------- | --------- | ------------------- | ---------- |
| 1   | 2026-01-25 | NURP7B5L42 | 3 504,89  | 876,22    | Amex 6005           | 2893       |
| 2   | 2026-02-05 | GEG53BDL42 | 7 096,00  | 1 774,00  | Amex 1008           | 2893       |
| 3   | 2026-02-19 | TK97ECRK42 | 7 096,00  | 1 774,00  | Amex 6005           | 2893       |
| 4   | 2026-03-16 | ED8BJEMK42 | 7 096,00  | 1 774,00  | Amex 6005           | 2893       |
| 5   | 2026-04-08 | XQMJUGDL42 | 7 096,00  | 1 774,00  | Amex 6005           | 2893       |
| 6   | 2026-04-23 | K2PGWJHL42 | 7 096,00  | 1 774,00  | Amex 6005           | 2893       |
| 7   | 2026-04-25 | 85YGNJRK42 | 1 549,18  | 387,30    | Amex 6005           | 2893       |
| 8   | 2026-05-02 | BKUC8KZK42 | 7 096,00  | 1 774,00  | Amex 6005           | 2893       |
| 9   | 2026-05-09 | RBTTFMML42 | 7 096,00  | 1 774,00  | Amex 6005           | 2893       |
| 10  | 2026-05-14 | JE5EYMML42 | 7 096,00  | 1 774,00  | Amex 1008           | 2893       |
| 11  | 2026-05-18 | QJ3UUMHL42 | 11 862,19 | 2 965,55  | **Mastercard 3888** | **2412**   |
| 12  | 2026-05-22 | ENH6XNML42 | 7 096,00  | 1 774,00  | Amex 6005           | 2893       |
| 13  | 2026-05-24 | HX7D5P5L42 | 7 096,00  | 1 774,00  | Amex 6005           | 2893       |
| 14  | 2026-05-25 | JBPD7P5L42 | 1 527,08  | 381,77    | Amex 6005           | 2893       |
| 15  | 2026-06-09 | QZKGYPRK42 | 7 096,00  | 1 774,00  | Amex 1008           | 2893       |
| 16  | 2026-06-11 | BZR2XP9L42 | 7 096,00  | 1 774,00  | Amex 1008           | 2893       |
| 17  | 2026-06-13 | HX59FQMK42 | 7 096,00  | 1 774,00  | Amex 1008           | 2893       |
| 18  | 2026-06-15 | 73C6VR5L42 | 7 096,00  | 1 774,00  | Amex 6005           | 2893       |
| 19  | 2026-06-18 | FSCJ8RVK42 | 7 096,00  | 1 774,00  | Amex 6005           | 2893       |
| 20  | 2026-06-24 | 3Q5EQRDL42 | 7 096,00  | 1 774,00  | Amex 6005           | 2893       |

Nitton av tjugo är lästa direkt i kortutdragen `tmp/platinum-61008.csv` (Amex 1008) och `tmp/sas-elite-86005.csv` (Amex 6005). **Post 11 (QJ3UUMHL42)** finns inte på något Amex-kort; kortet ska bekräftas mot Meta-kvittot innan den bokförs.

## Konteringen

Fyra rader per post, **betalkontot överst**:

```
<betalkonto>  KREDIT  <netto>     2893 Skulder till närstående personer, kortfristig del
                                  (post 11: 2412 HB Kort)
5911          DEBET   <netto>     Facebookannonsering
2614          KREDIT  <moms>      Utgående moms omvänd skattskyldighet, 25 %
2645          DEBET   <moms>      Beräknad ingående moms på förvärv från utlandet
```

Summa debet = summa kredit = `netto + moms`. Differens 0,00.

Datum = **debiteringsdatumet i tabellen**, inte periodstarten.

Beskrivning: `Meta ref <REFERENS> - <kort>`, t.ex. `Meta ref NURP7B5L42 - Amex 6005`. Ordet "RÄTTELSE" ska inte förekomma.

## Innan varje post bokförs — obligatorisk dubblettkontroll

Det här är nya verifikationer, inte rättelser. Bokförs en post som redan finns någon annanstans uppstår exakt det problem ORD-169 höll på att städa upp.

För varje post, i denna ordning:

1. **Sök i Fortnox på beloppet** (Bokföring → Sök belopp) över hela räkenskapsåret.
2. Hittas en verifikation med samma belopp: **öppna den och fastställ dess transaktionsnyckel** innan du går vidare. Nyckeln är referensnumret, inte datumet.
3. Är det samma referens → posten är redan bokförd. Bokför inte. Notera i rapporten.
4. Är det en annan referens → posten saknas och ska bokföras.
5. Går nyckeln inte att fastställa → **bokför inte**. Lämna till Fazli.

**Bokför aldrig en post där en befintlig verifikation med samma belopp inte kunnat uteslutas.**

## Så hittas underlaget — bekräftad metod

`kvitto@hairtpclinic.com` innehåller varje Meta-kvitto i original. Sök på avsändare `noreply@business-updates.facebook.com` och filtrera på datum.

Mailet innehåller **Transaktions-id** och **Referensnummer** i klartext. Matcha på referensnumret i tabellen ovan.

Kvitto-PDF:erna ligger dessutom i `~/Downloads/meta_all_transactions/hairtp/` (jan–jun) och `~/Downloads/kvitton-2026/` (jul–aug), med filnamnet `ÅÅÅÅ-MM-DDTHH-MM Transaktion #<transaktions-id>.pdf`. Transaktions-id i filnamnet matchar mailet exakt.

### Två fällor som kostade tid i ORD-169

1. **Använd ALDRIG cm-lagrets datum.** CM fyller datumfältet från `Datumintervall`, alltså periodens början, när transaktions-id maskerats bort av PII-tvätten. En post daterad 07-02 i CM var i själva verket debiteringen 07-07. Cm-datum får aldrig ligga till grund för ett dubblettbeslut.
2. **Betalkortet läses ur Meta-kvittot**, som anger `Betalningsmetod` i klartext. Leta inte i kortutdrag för att avgöra kortet — kvittot är primärkällan och finns för varje debitering.

## Hårda regler

1. Betalkontot ligger alltid överst.
2. 2614 och 2645 ska bära identiskt belopp.
3. Konto 5900 får aldrig användas — det är ett gruppkonto. Rätt konto är 5911.
4. Ett kvitto utan `Faktura-nr` är ett misslyckat betalningsförsök och bokförs aldrig.
5. Saknas underlaget både i kvitto@-brevlådan och i `~/Downloads` → bokför inte, lämna till Fazli.
6. Vid minsta tvekan: avbryt utan att spara och rapportera.
7. Arbeta i batchar om **tio**. Stanna, rapportera, invänta granskning.

## Rapport

`docs/handover/ORDERS/facit/ord-170-batch-<nr>.md`, en rad per post:

| #   | Datum | Referens | Underlag (mail/PDF) | Dubblettkontroll | Vernr | Summa D/K | Differens |
| --- | ----- | -------- | ------------------- | ---------------- | ----- | --------- | --------- |

Plus: antal bokförda, antal som visade sig redan finnas, antal lämnade till Fazli.

## Acceptanskriterier

1. Varje bokförd post har ett underlag med referensnummer läst ur mail eller PDF.
2. Debet = kredit i varje post, differens 0,00.
3. Betalkontot på rad 1.
4. Inget konto 5900.
5. Dubblettkontrollen dokumenterad per post — inte bara påstådd.
6. Summan av bokfört netto stämmer mot tabellen ovan, minus eventuella poster som visade sig redan finnas.
