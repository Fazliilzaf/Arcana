# ORD-169 Batch 2 — Claudes granskning

Datum: 2026-09-08 · Granskare: Claude · Underlag: `ord-169-batch-2-hair-tp.md` + direktläsning i Fortnox (Hair TP Clinic gbg AB)

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
