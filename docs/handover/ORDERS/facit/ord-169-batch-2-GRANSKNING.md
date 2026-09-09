# ORD-169 Batch 2 — Claudes granskning

Datum: 2026-09-08 · Granskare: Claude · Underlag: `ord-169-batch-2-hair-tp.md` + direktläsning i Fortnox (Hair TP Clinic gbg AB)

---

## TILLÄGG 2026-09-08 — A1995 ska INTE flyttas till Curatiio

Förslaget att nolla A1995 + A2001 i Hair TP och bokföra dem i Curatiio bygger på annonskontots namn. Kvittona säger något annat. Båda lästa i sin helhet:

**Curatiio-kvittot** (`meta_all_transactions/curatiio/2026-01-11T18-24 Transaktion #25642958705391872-...pdf`)
Konto-id 479410056348442 · ref 6WWAYBVBK2 · Faktura-nr FBADS-443-105363078 · Amex 6005 · 7 500,00 kr · Betald
Fakturamottagare: **Fazli Hair OP AB**, Kungsgatan 17, 503 33 Borås — **VAT: SE559034268801**

**Hair TP-kvittot** (`meta_all_transactions/hairtp/2026-01-20T08-12 Transaktion #25455113680839268-...pdf`)
Konto-id 1112651725849665 · ref B2J8U9VK42 · Faktura-nr FBADS-066-105432113 · Amex 1008 · 7 096,00 kr · Betald
Fakturamottagare: **Hair TP Clinic gbg AB**, Vasaplasten 2, 411 34 Göteborg — **VAT: SE559034268801**

Olika bolagsnamn och olika adresser — men **identiskt momsregistreringsnummer**. SE559034268801 motsvarar org.nr 559034-2688, vilket är det organisationsnummer som Fortnox-företaget "Hair TP Clinic" är registrerat på.

Ett svenskt momsnummer är unikt per juridisk person. Två skilda bolag kan inte dela ett. Vid omvänd skattskyldighet enligt art. 196 är det den momsregistrerade mottagaren som ska redovisa skatten — och den är densamma för båda annonskontona.

**Slutsats: kostnaden är rätt bokförd där den ligger. A1995 och A2001 rörs inte.**

### A1995:s betalkonto är nu bevisat, inte antaget

Min tidigare anmärkning faller. Kvittot anger **American Express ···· 6005**. Amex är privat på Fazli, alltså **2893** — precis som bokfört. A1995 är därmed fullt verifierad: belopp, referensnummer, fakturanummer, betalstatus och betalkonto.

---

## TILLÄGG 2 — egen verifiering mot primärkällorna

Kortutdragen finns lokalt (`tmp/platinum-61008.csv` = Amex 1008, `tmp/sas-elite-86005.csv` = Amex 6005). Nedanstående är läst där och i kvittomapparna, inte hämtat ur rapporten.

### Bekräftat

| Påstående                       | Kontroll                                                              | Utfall            |
| ------------------------------- | --------------------------------------------------------------------- | ----------------- |
| A2224: 01-20 7 096 unikt        | 1008 = B2J8U9VK42 7 096 · 6005 = UU7YNC5BK2 1 391,73                  | Unikt ✓           |
| A2225: 02-25 2 817,88 unikt     | 6005 = X7Y4TCDL42 2 817,88 · endast andra beloppet 5 315,88 samma dag | Unikt ✓           |
| A2223: 04-09 376,63 unikt       | 6005 = YNF54J5L42 376,63 · 1008 = 7 500,00 samma dag                  | Unikt ✓           |
| A2220: 06-25 692,33 unikt       | 6005 = WGTRTRRK42 692,33 · endast 7 246,94 samma dag                  | Unikt ✓           |
| A2227: 08-11 7 096 unikt        | 6005 = LBJE4XVK42 7 096 · inget på 1008                               | Unikt ✓           |
| A1209/A1210: verklig debitering | 1008, 07-14, G5LKWWMBK2 **135,45**                                    | Finns ✓           |
| A962: verklig debitering        | 6005, 07-25, A98FJZRBK2 **1 154,60**                                  | Finns ✓           |
| 06-24 saknar bokföring          | 6005, 06-24, 3Q5EQRDL42 **7 096,00**                                  | Finns, obokförd ✓ |

### A1065 och A1067 — bekräftat att debitering saknas, men de är inte dubbletter

Amex 1008 har i intervallet 07-01–07-08 exakt tre Meta-debiteringar: 07-01, 07-03 och 07-07. Amex 6005 har ingen alls i samma intervall. I `~/Downloads` finns kvitton bara för 07-01, 07-03 och 07-07 (två per datum — en betald, en misslyckad).

Ingen debitering och inget kvitto existerar alltså för 07-02 eller 07-06. Att nolla dem är därför rätt utfall — beloppen har aldrig belastat något kort.

Men beskrivningen `Makulerad dubblett av A2235` respektive `av A2233` påstår ett dubblettförhållande som inte är bevisat. De är inte dubbletter av något; de saknar underliggande transaktion helt. Formuleringen valdes med motiveringen "närmast", vilket är just den sortens bedömning regeln finns för att stoppa.

**Förslag:** ändra beskrivningen på dessa två till något som stämmer med vad som faktiskt konstaterats. Kräver din GO för ny formulering — jag ändrar ingenting utan den.

### Mastercard-posterna — verifierade (rättelse av tidigare påstående)

Jag skrev först att 05-19 och 07-14 inte gick att verifiera eftersom inget utdrag för Mastercard 3888 finns i `tmp/`. Det var fel källa. **Meta-kvittot anger betalningsmetoden självt** — inget kortutdrag behövs. Båda lästa i sin helhet:

| Datum            | Ref        | Belopp   | Betalningsmetod          | Faktura-nr          | Konto                    |
| ---------------- | ---------- | -------- | ------------------------ | ------------------- | ------------------------ |
| 2026-05-19 20:17 | FXZQ8MZK42 | 5 322,00 | **Mastercard ···· 3888** | FBADS-066-106004904 | Hair TP 1112651725849665 |
| 2026-07-14 14:38 | YA64TTDL42 | 7 474,82 | **Mastercard ···· 3888** | FBADS-066-106284095 | Hair TP 1112651725849665 |

Båda märkta **Betald**. Det bekräftar:

- **A1303** → 2412 HB Kort är rätt betalkonto.
- **A2236** → 2412 HB Kort är rätt betalkonto.
- **A1302:s nyckel** — rapporten angav "Faktura FBADS-066-106284095 (= YA64TTDL42)". Fakturanumret stämmer exakt mot kvittot.

**Lärdom för framtida kontroller:** betalkortet ska läsas ur Meta-kvittot, inte sökas i ett kortutdrag. Kvittot är primärkällan och finns för varje debitering.

---

## TILLÄGG 3 — cm-record-kedjan läst

CM-lagret nås via `cfo.hairtpclinic.com` (inte `arcana.`), inloggad som owner@hairtpclinic.se. Endpoints: `/api/v1/cm/receipts`, `/api/v1/cm/expense-records/:id`, `/api/v1/cm/raw-items/:id?full=1`.

### A1062 / A1218 — min misstanke var fel, och det är nu bevisat

cm-record `a92f8222-c82f-49ef-a040-7db9e90b3340` → rawItem `23da82d6-e013-4c96-8c54-a08e00eef7f4`. Råmailet innehåller:

```
Referensnummer   BQREPSMK42
Transaktions-id  27424227413927882-27495274520156505
```

Det transaktions-id:t är exakt filnamnet på kvittot i `~/Downloads`:
`2026-07-03T14-09 Transaktion #27424227413927882-27495274520156505.pdf`

**A1062 och A1218 hör alltså till 07-03-debiteringen (BQREPSMK42), inte till 06-24.** Nollningen står. Min invändning i granskningen är därmed avfärdad med primärkälla.

### A1065 / A1067 — grunden för nollningen håller inte

cm-record `523c35ef` (07-02) och `efe67fb8` (07-06). Deras råmail ser ut så här i sin helhet:

```
Det här är ingen faktura Transaktion för Hair TP Clinic annonskonto ([telefon])
Transaktions-id [telefon] Betalningssammanfattning Fakturerat belopp
7 096,00 kr (SEK) Datumintervall 2 jul 2026 00:00
```

Tre saker framgår:

1. **Transaktions-id är maskerat till `[telefon]`.** En PII-tvätt har tolkat det långa siffertalet som ett telefonnummer och skrivit över det. Transaktionsnyckeln är förstörd i den lagrade kopian.
2. **Texten är avkortad** precis efter `Datumintervall` — före det ställe där Referensnummer står i ett komplett mail (jämför a92f8222 ovan, 1 720 tecken mot 460).
3. **Datumet 07-02 kommer från `Datumintervall`**, alltså periodens början — inte från ett debiteringsdatum.

Slutsatsen "ingen debitering existerar 07-02" är därför korrekt men irrelevant. Källan har aldrig påstått att 07-02 var ett debiteringsdatum — det är en periodstart.

### Löst via kvitto@-brevlådan

Originalmailen finns omaskerade i `kvitto@hairtpclinic.com`. Sökning på avsändaren `business-updates.facebook.com` ger för Hair TP-kontot:

| Mail mottaget    | Transaktions-id                     | Belopp   | Datumintervall (start) |
| ---------------- | ----------------------------------- | -------- | ---------------------- |
| 2026-07-01 04:42 | 27336936719323613-27300527182964571 | 7 096,00 | 26 jun                 |
| 2026-07-03 12:09 | 27424227413927882-27495274520156505 | 7 096,00 | **30 jun**             |
| 2026-07-07 04:30 | 27408746742142610-27401561106194512 | 7 096,00 | **2 jul**              |
| 2026-07-10 00:54 | 27433810176302938-27440900005593950 | 7 096,00 | **6 jul**              |

Periodstarterna matchar cm-posternas datum exakt:

- `a92f8222` (cm-datum **06-30**) → mailet 07-03 → **BQREPSMK42**, 07-03-debiteringen
- `523c35ef` (cm-datum **07-02**) → mailet 07-07 → **XYTK3TDL42**, 07-07-debiteringen
- `efe67fb8` (cm-datum **07-06**) → mailet 07-10 → **VN57KU5L42**, 07-10-debiteringen

**A1065 och A1067 är alltså verkliga dubbletter.** Nollningen står. Men de är dubbletter av andra verifikationer än de märkts som:

| Vernr | Märkt som dubblett av | Verklig motpart               |
| ----- | --------------------- | ----------------------------- |
| A1065 | A2235 (07-03)         | **A2233** (07-07, XYTK3TDL42) |
| A1067 | A2233 (07-07)         | **A2232** (07-10, VN57KU5L42) |

Utfallet är rätt, attributionen fel i båda — och omkastad sinsemellan. Två beskrivningar att rätta, inget mer.

### Generell konsekvens: cm-datumet är inte ett debiteringsdatum

`a92f8222` har `date: 2026-06-30` men avser debiteringen 07-03. `523c35ef` har `date: 2026-07-02` från en periodstart. Fältet fylls från `Datumintervall` när transaktions-id saknas.

Det förklarar hela mönstret av verifikationer med "fel datum" som återkommit genom hela genomgången. **Datum i cm-records får aldrig användas som debiteringsdatum, och aldrig som grund för ett dubblettbeslut.**

### Kvarstår

- **A1065 / A1067:** nollningen står, men beskrivningarna pekar på fel motpart. Rättas till A2233 respektive A2232. Kräver Fazlis GO.
- **A2221 / A2231** vilar på att 7 474,82 förekommer exakt en gång. Beloppet är bekräftat för 07-14 via kvittot; att det inte förekommer någon annan gång är inte uttömmande kontrollerat.

### Metod som fungerade — använd den framåt

`kvitto@hairtpclinic.com` innehåller varje Meta-kvitto i original, omaskerat. Sök på avsändare `business-updates.facebook.com` och matcha på **Transaktions-id** eller **Datumintervall**. Det är den snabbaste och säkraste vägen till transaktionsnyckeln — snabbare än cm-lagret, som både maskerar id:t och avkortar texten.

### Nytt fynd: referensserierna skiljer annonskontona åt

Meta-referenserna delar sig i två serier:

- `*K42` / `*L42` → **Hair TP-kontot** (1112651725849665)
- `*BK2` → **Curatiio-kontot** (479410056348442)

Verifierat genom datummatchning: samtliga `*BK2`-debiteringar på båda Amex-korten (06-28, 06-25, 06-13, 06-11, 06-09, 06-07, 05-31, 05-25, 05-21 ×2, 05-18, 05-16, 05-14, 05-09, 04-25, 04-24, 04-09, 03-25, 03-16, 02-25, 02-16, 02-05, 02-03, 01-25, 01-11) har ett motsvarande kvitto i `meta_all_transactions/curatiio/`. Ingen `*K42`/`*L42` gör det.

Det ger en tillförlitlig regel för att skilja kontona åt direkt ur kortutdraget, utan att öppna varje PDF.

**Konsekvens:** `meta_all_transactions/curatiio/` slutar 2026-06-28. Juli och augusti är aldrig nedladdade. Det är därför kvittona saknas för A1209/A1210 (G5LKWWMBK2, 07-14) och A962 (A98FJZRBK2, 07-25) — båda är `*BK2`. De ska hämtas från Curatiio-kontot, inte letas efter i Hair TP-mappen.

### Samtliga 20 obokförda tillhör Hair TP-kontot

Alla tjugo referenser i listan är `*K42`/`*L42`. Ingen är Curatiio.

Netto **131 979,34 kr**, moms 25 % **32 994,84 kr**. Det är den enskilt största kvarvarande posten i hela genomgången — större än allt som hittills rättats.

---

## Utfall

**Godkänt:** de 11 facit-rättelserna.
**Underkänt:** de 26 nollade dubbletterna. Batch 3 ska inte påbörjas förrän de är omprövade.

---

## Godkänt — de 11 facit-rättelserna

Samtliga elva lästa individuellt i Fortnox. Alla stämmer.

| Vernr | Datum      | Summa D/K | Betalkonto överst | 2614 = 2645 | 5900 levande |
| ----- | ---------- | --------- | ----------------- | ----------- | ------------ |
| A1995 | 2026-01-11 | 9 375,00  | 2893 ✓            | 1 875,00 ✓  | nej ✓        |
| A1305 | 2026-01-20 | 8 870,00  | 2893 ✓            | 1 774,00 ✓  | nej ✓        |
| A1307 | 2026-02-25 | 3 522,35  | 2893 ✓            | 704,47 ✓    | nej ✓        |
| A2228 | 2026-03-25 | 5 637,13  | 2893 ✓            | 1 127,43 ✓  | nej ✓        |
| A1304 | 2026-04-09 | 470,79    | 2893 ✓            | 94,16 ✓     | nej ✓        |
| A1303 | 2026-05-19 | 6 652,50  | **2412** ✓        | 1 330,50 ✓  | nej ✓        |
| A2230 | 2026-06-22 | 8 870,00  | 2893 ✓            | 1 774,00 ✓  | nej ✓        |
| A1301 | 2026-06-25 | 865,41    | 2893 ✓            | 173,08 ✓    | nej ✓        |
| A340  | 2026-06-30 | 8 870,00  | 2893 ✓            | 1 774,00 ✓  | nej ✓        |
| A960  | 2026-07-23 | 9 360,65  | 2893 ✓            | 1 872,13 ✓  | nej ✓        |
| A958  | 2026-08-11 | 8 870,00  | 2893 ✓            | 1 774,00 ✓  | nej ✓        |

Differens 0,00 i samtliga. Kontrollmetod: summan motsvarar exakt `netto + moms` för de fyra facit-raderna, vilket bevisar att de gamla raderna är strukna och inte räknas.

Räknekontroll av rapportens totaler:

- Netto 57 091,06 kr — stämmer, summan av de elva nettobeloppen.
- Moms 14 272,77 kr — stämmer, och är exakt 25 % av nettot (57 091,06 × 0,25 = 14 272,765 → 14 272,77) med den överenskomna avrundningen.

Att A1303 fick 2412 HB Kort och inte 2893 är rätt — Mastercard 3888 är företagskortet.

Bra omdöme på två punkter till: de 20 obokförda debiteringarna bokfördes **inte** blint, och de 12 osäkra lämnades orörda. Båda är rätt beslut.

---

## Underkänt — de 26 nollade dubbletterna

### 1. Fel dubblettnyckel

Ägarregeln är att en dubblett får fastställas på **transaktions-/fakturanumret inne i PDF:en, aldrig på belopp + datum**. Skälet är känt sedan tidigare: Meta debiterar ofta identiska belopp samma dag på skilda köp.

Av de 26 anges nyckeln bara för **en** post — A2001 mot A1995, "samma CF-id". För de övriga 25 finns ingen transaktionsnyckel redovisad. Rapporten är själv medveten om regeln och tillämpar den korrekt på de 12 som lämnades kvar ("regel kräver transaktionsnyckel"), men inte på de 26 som nollades.

### 2. Konkret motsägelse: A1062 och A1218

Läst i Fortnox:

| Vernr | Datum      | Belopp   | Status                                                  |
| ----- | ---------- | -------- | ------------------------------------------------------- |
| A1062 | 2026-06-30 | 7 096,00 | 0,00 / 0,00 — "Makulerad dubblett av A340"              |
| A1218 | 2026-06-30 | 7 096,00 | 0,00 / 0,00 — "Makulerad dubblett av A340"              |
| A340  | 2026-06-30 | 7 096,00 | levande, facit, avser debitering **06-28** (W6JYBT5L42) |

Samtidigt listar samma rapport `06-24 3Q5EQRDL42 7 096,00` bland de **betalda debiteringar som saknar verifikation**.

Det går inte ihop. Tre verifikationer på 7 096 kr fanns i slutet av juni, och två betalda debiteringar på 7 096 kr finns i samma period. Om båda A1062 och A1218 var dubbletter av 06-28, var är då verifikationen för 06-24? Och om en av dem _var_ 06-24-debiteringen — vilket är den enklaste förklaringen — har en verklig kostnad på 7 096 kr plus 1 774 kr moms raderats ur böckerna och samtidigt rapporterats som saknad.

Rapporten bedömer detta som "osannolikt" med motiveringen att alla tre har samma datum 06-30. Men Arcana bokförde uppenbart på månadsskifte snarare än debiteringsdatum — det syns i A340 själv (bokförd 06-30, debiterad 06-28) och i A960 (bokförd 07-23, debiterad 08-01). Att datumen sammanfaller är därför inget argument för att det är dubbletter. Det är tvärtom förväntat även när det är skilda köp.

### 3. Samma mönster i stort

20 betalda debiteringar rapporteras sakna verifikation. 26 verifikationer nollades som dubbletter. Att dessa två tal är stora samtidigt pekar åt samma håll: en del av det som nollades var sannolikt de saknade posterna, bokförda med avrundat datum.

### 4. Beskrivningen skrevs över — nyckeln försvann

Verifikationerna bar ingen Meta-referens. Det enda som fanns var Arcanas CF-id i beskrivningen, t.ex. `CF 9d96e834f590a60c Meta Platforms Ireland Limited`. Den texten är nu ersatt med `Makulerad dubblett av <vernr> - samtliga rader strukna`, och originalet syns inte längre i verifikationsvyn.

Det var CF-id:t som gjorde A2001 → A1995 verifierbar. För de övriga 25 är samma nyckel nu överskriven.

---

## Anmärkning: A1995

A1995 är korrekt konterad, men den bokfördes på ett **antagande**: kvitto-PDF saknas och betalkontot 2893 valdes med motiveringen att Mastercard 3888 inte förekommer förrän i maj.

Ägarregeln är att ingenting ändras förrän underlaget har sökts (1) i `~/Downloads` och (2) hos leverantören — och saknas det på båda är det ett ägarbeslut. A1995 skulle ha lämnats till Fazli, inte bokförts.

Beloppet är verifierat via korttransaktionen FACEBK 6WWAYBVBK2, så kostnaden finns. Det är valet av betalkonto som är obelagt: 2893 (privat utlägg) mot 2412 (HB-kort). Skillnaden syns inte i resultatet men flyttar 7 500 kr mellan en skuld till Fazli och en skuld på företagskortet.

---

## Det goda beskedet

Nollningarna är **återställbara**. Strykmetoden tar inte bort rader — de ligger kvar överstrukna. Att ta bort en strykning är samma toggle en gång till. Ingen data är förlorad i själva bokföringen.

Det som behöver återskapas är originalbeskrivningarna. De finns sannolikt kvar i:

1. Fortnox SIE-export för räkenskapsåret, tagen före dagens ändringar.
2. Arcanas egen expense-store, som redan används för CF-id:n.
3. Fortnox verifikationshistorik via Skriv ut / revisorsutdrag.

---

## Åtgärder innan batch 3

1. **Återskapa CF-id:na** för de 26 nollade verifikationerna ur någon av källorna ovan.
2. **Ompröva var och en** mot transaktionsnyckeln. Där nyckeln inte kan fastställas: återställ strykningen och lämna posten till Fazli.
3. **Börja med A1062 och A1218** mot debiteringarna 06-24 (3Q5EQRDL42) och 06-28 (W6JYBT5L42). Sannolikt ska en av dem tillbaka som 06-24-kostnaden.
4. **Återställ A1995** till obokfört läge, eller låt Fazli bekräfta betalkontot.
5. **Batch 3 startar inte** förrän punkterna ovan är avslutade.

Regeln som gäller framåt: en dubblett fastställs på transaktionsnyckel, och beskrivningen skrivs inte över förrän nyckeln är dokumenterad någon annanstans.
