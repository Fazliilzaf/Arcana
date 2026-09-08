# ORD-169 — Rättning av annonsbokföringen (Meta + Google)

Datum: 2026-09-08 · Ägar-GO: Fazli (2026-09-08) · **Utförare: DeepSeek** · **Granskare: Claude**

## Rollfördelning

| Roll         | Ansvar                                                                                                                |
| ------------ | --------------------------------------------------------------------------------------------------------------------- |
| **DeepSeek** | Rättar verifikationerna i Fortnox: stryker, konterar om, kopplar underlag, bokför. En månad i taget.                  |
| **Claude**   | Granskar efteråt, verifikation för verifikation, mot underlaget. Rättar inte själv — rapporterar avvikelser tillbaka. |
| **Fazli**    | Beslutar i de fall där underlag saknas helt.                                                                          |

Endast DeepSeek skriver. Claude läser. Det får aldrig vara två som skriver samtidigt — så uppstod dubbletterna A2241 och A2242.

## Metoden — så här rättas en verifikation

Fastställd av Fazli 2026-09-08 och genomförd skarpt på A331 → A2232 samma dag.

1. Öppna verifikationen. Tryck **"Ändra"** — knapp 3. **Inte "Ändringsverifikation"** (knapp 2); den skapar ett nytt verifikat och ger dubbletter.
2. Knappraden ska nu vara `Avbryt · Bokför`, och varje rad ska ha ett litet **S** (`icon-strikethrough`) längst till höger vid Kontosaldo. Syns inte det är du inte i ändraläget — avbryt och börja om.
3. **Stryk ALLA rader**, inte bara de felaktiga. Strukna rader räknas inte i saldot men står kvar överstrukna för spårbarheten.
4. Skriv in hela facit-konteringen på nytt, **betalkontot överst**. Momsraderna tas med igen även om de nyss strukits — det gör inget att de kommer en gång till.
5. Kontrollera att **Summa debet = Summa kredit** och **Differens = 0,00**.
6. Koppla underlaget (kvittot).
7. **Bokför.**
8. Nolla motparten: det gamla verifikatet (eller den överflödiga rättelsen) öppnas, alla rader stryks, och den bokförs på 0,00 / 0,00.

**Ordningen är viktig.** Nolla först, fyll sedan i — aldrig tvärtom. Blir körningen avbruten mitt i ska kostnaden saknas, inte vara dubbel.

### Teknisk fälla som kostade en halv dag

Fortnox konto-fält är en autocomplete som **inte reagerar på syntetiska events**. `element.click()` och `input.value = "..."` gör ingenting — fältet ser ifyllt ut men Fortnox registrerar inget, och benämningen fylls aldrig i.

- **Konto- och beloppsfält:** kräver riktig musklick + riktig tangentbordsinmatning. Skriv kontonumret, vänta på listrutan, klicka på raden i listrutan.
- **Strykningsikonen (S):** kräver hela sekvensen `mouseover → mousemove → mousedown → mouseup → click`. Enbart `click()` fungerar inte.
- **Beskrivningsfältet:** vanligt fält, går bra att sätta programmatiskt.
- Fortnox avvisar `·` (mittpunkt) och tabbtecken i beskrivningen — "Värdet innehåller ej tillåtna tecken". Använd bindestreck.
- Sessionen dör ofta och kastar tillbaka till företagsväljaren. Sessions-id i URL:en byts då. Kontrollera alltid att du står på rätt verifikation innan du stryker något.

## Moms och avrundning

Momsen ska aldrig räknas fram på nytt när den redan finns bokförd.

1. **Har originalet momsrader (2645/2614)? Använd exakt de beloppen.** De ligger redan i momsrapporten och ska inte ändras. Verifierat 2026-09-08: A348 = 1 868,71 (av 7 474,82) och A350 = 321,46 (av 1 285,83).
2. **Saknar originalet momsrader?** Räkna 25 % av nettot och avrunda till närmaste öre, halvt öre uppåt — samma konvention som Arcana använt. A2226 → A2239: 6 710,02 × 0,25 = 1 677,505 → **1 677,51**.
3. **2614 och 2645 ska ALLTID bära identiskt belopp.** De tar ut varandra, så avrundningen har ingen netto-, resultat- eller balanseffekt. Det enda som spelar roll är att de två raderna stämmer exakt med varandra. Skiljer de sig är verifikationen fel.

## Teknisk metod — beprövad 2026-09-08

Hela flödet är genomfört skarpt på A331 → A2232 med vanlig webbläsare och JavaScript-exekvering. **Varken debug-Chrome, Midscene eller andra verktyg behövs.**

Två problem som ser blockerande ut och deras lösning:

**Kontextsvällning.** Läs aldrig tillgänglighetsträdet — det returnerar hundratals KB per anrop. Kör i stället JavaScript som returnerar exakt de fält som behövs. En hel verifikation blir några hundra byte.

**Strykningssekvensen.** Den körs i JavaScript med `dispatchEvent`, inte med fysisk mus. Inget `AXPress` behövs.

Fortnox ligger i en iframe. Allt nedan utgår från `document.querySelector('iframe').contentDocument`.

### Läs verifikationen (kompakt)

```js
(() => {
  const f = document.querySelector('iframe');
  if (!f || !f.contentDocument)
    return { state: 'no frame', url: location.href };
  const d = f.contentDocument,
    t = d.body.innerText;
  const desc = [...d.querySelectorAll('input')]
    .filter((x) => x.offsetParent)
    .map((x) => x.value)
    .filter((v) => v && v.length > 4)
    .slice(0, 2);
  const i = t.indexOf('KONTO\t');
  return { desc, rows: t.slice(i, i + 600) };
})();
```

### Gå in i ändraläget

```js
document
  .querySelector('iframe')
  .contentDocument.querySelector('.js-voucher-alter-voucher')
  .click();
```

Verifiera sedan att rubriken blivit `VERIFIKATION - ÄNDRA <vernr>`. Står det något annat: avbryt.

### Lista raderna med sina cid

```js
(() => {
  const d = document.querySelector('iframe').contentDocument;
  const t = [...d.querySelectorAll('table')].find((x) =>
    /KONTOSALDO/i.test(x.innerText)
  );
  return [...t.querySelectorAll('tbody tr')]
    .filter((r) => r.querySelector('.posting-tool-toggle-remove'))
    .map((r) => ({
      cid: r.dataset?.cid,
      konto: r.children[0].innerText.trim(),
    }));
})();
```

### Stryk en rad — en cid per anrop

```js
(() => {
  const fr = document.querySelector('iframe');
  const d = fr.contentDocument,
    w = fr.contentWindow;
  const t = [...d.querySelectorAll('table')].find((x) =>
    /KONTOSALDO/i.test(x.innerText)
  );
  const row = [...t.querySelectorAll('tbody tr')].find(
    (r) => r.dataset?.cid === 'CID_HÄR'
  );
  const icon = row.querySelector('.posting-tool-toggle-remove');
  const r = icon.getBoundingClientRect();
  const opts = {
    bubbles: true,
    cancelable: true,
    view: w,
    clientX: r.x + r.width / 2,
    clientY: r.y + r.height / 2,
    button: 0,
  };
  ['mouseover', 'mousemove', 'mousedown', 'mouseup', 'click'].forEach((ty) =>
    icon.dispatchEvent(new w.MouseEvent(ty, opts))
  );
  return 'struck';
})();
```

Kör en rad per anrop. En loop över flera rader fungerar inte tillförlitligt — widgeten hinner inte rendera om.

### Kontrollera summan

```js
(() => {
  const d = document.querySelector('iframe').contentDocument;
  const t = [...d.querySelectorAll('table')].find((x) =>
    /KONTOSALDO/i.test(x.innerText)
  );
  const rows = [...t.querySelectorAll('tbody tr')];
  return {
    sum: rows
      .find((r) => /Summa/.test(r.innerText))
      .innerText.replace(/\s+/g, ' ')
      .trim(),
    diff: rows
      .find((r) => /Differens/.test(r.innerText))
      .innerText.replace(/\s+/g, ' ')
      .trim(),
  };
})();
```

### Fyll i konto och belopp — enda stället som kräver fysisk inmatning

Kontofältet är en autocomplete som **inte** reagerar på syntetiska events. `input.value = "..."` ser ut att fungera men Fortnox registrerar ingenting och benämningen fylls aldrig i.

1. Fysisk musklick i KONTO-cellen på första tomma raden.
2. Skriv kontonumret med riktigt tangentbord.
3. Vänta på listrutan och **klicka på raden i listrutan** — annars binds kontot inte.
4. Fysisk musklick i DEBET- eller KREDIT-cellen, skriv beloppet med komma som decimaltecken (`7096,00`).
5. Klicka på KONTO-cellen i nästa tomma rad — det commit:ar föregående fält.

Tomma rader fylls på automatiskt. Behöver du koordinater: hämta dem via `getBoundingClientRect()` plus iframens offset, och skala mot skärmbildens koordinatsystem.

### Beskrivningsfältet

Vanligt fält. Sätt det programmatiskt med den nativa settern:

```js
(() => {
  const fr = document.querySelector('iframe');
  const d = fr.contentDocument,
    w = fr.contentWindow;
  const inp = [...d.querySelectorAll('input')].find(
    (x) => x.offsetParent && /^RATTELSE/.test(x.value)
  );
  if (!inp) return 'not found';
  Object.getOwnPropertyDescriptor(
    w.HTMLInputElement.prototype,
    'value'
  ).set.call(inp, 'NY_TEXT');
  ['input', 'change', 'blur'].forEach((ty) =>
    inp.dispatchEvent(new w.Event(ty, { bubbles: true }))
  );
  return inp.value;
})();
```

### Bokför

```js
document
  .querySelector('iframe')
  .contentDocument.querySelector('.js-book-keep')
  .click();
```

Blir anropet blockerat: klicka knappen fysiskt i stället. Bekräftelsen är notisen `Verifikation <vernr> har uppdaterats` och att sidan går tillbaka till verifikationslistan.

### Fällor

- Fortnox avvisar `·` (mittpunkt) och tabbtecken i beskrivningen — "Värdet innehåller ej tillåtna tecken". Använd bindestreck.
- Sessionen dör ofta och kastar tillbaka till företagsväljaren. **Sessions-id:t i URL:en byts då.** Kontrollera alltid vilken verifikation du står på innan du stryker en rad.
- `body.innerText` innehåller även dolda paneler (Inställningar m.m.). Läs rubriken specifikt, inte hela texten.

## Beskrivningar

Beskrivningsfältet ändras **inte**. Två undantag, båda godkända av Fazli:

- Prefixet `RÄTTELSE …` som Claude råkade lägga in i A2232–A2240 tas bort. Kvar blir sakinnehållet, t.ex. `Meta ref VN57KU5L42 - Amex 1008`.
- En verifikation som nollas för att den är dubblett får `Makulerad dubblett av <vernr> - samtliga rader strukna`.

Ordet "RÄTTELSE" ska inte finnas kvar någonstans.

## Kontologik

| Situation                                                 | Kontering (betalkontot överst)                          |
| --------------------------------------------------------- | ------------------------------------------------------- |
| Meta-annons, betald med privat Amex (6005 / 1008)         | 2893 K netto · 5911 D netto · 2614 K 25 % · 2645 D 25 % |
| Meta-annons, betald med HB företagskort (Mastercard 3888) | 2412 K netto · 5911 D netto · 2614 K 25 % · 2645 D 25 % |
| Betald från Handelsbanken direkt                          | 1930 K netto · 5911 D netto · 2614 K 25 % · 2645 D 25 % |

- **5900 är ett gruppkonto** — Fortnox märker det själv "Reklam och PR (gruppkonto)". Får aldrig konteras på. Rätt konto är **5911 Facebookannonsering**.
- **Amex har inget företagskort.** Korten står privat på Fazli, godkänt av revisorn. Företagsutgifter på dem är privata utlägg → 2893 kredit vid köp, 2893 debet vid återbetalning till Fazli.
- **1581 Fordran AmEx tillhör intäktssidan** — patienters kortbetalningar via Cliento. Får aldrig användas för företagets egna kortköp.
- Leverantörer: Meta Platforms Ireland Ltd (VAT IE9692928F) och Google Ireland (VAT IE6388047V), båda omvänd skattskyldighet art. 196.

## Regler som avgör om en rättelse får göras

Bryts någon av dessa är rättelsen ogiltig och ska rullas tillbaka.

1. **Betalkontot ligger ALLTID överst.** Betalkonton: 1910, 1930, 1581, 1582, 2412, 2440, 2891, 2893.
2. **Dubblettnyckeln är transaktions-/fakturanumret inne i PDF:en — aldrig belopp + datum.** Två skilda köp kan ha identiskt belopp, datum och klockslag. Filnamnet räcker inte; PDF:en måste läsas.
3. **Ett Meta-kvitto utan `Faktura-nr` är ett misslyckat betalningsförsök** och bokförs aldrig. Endast poster märkta "Betald" räknas.
4. **Ett par får kallas dubblett först när en av dem är verifierad korrekt.** Kan ingen av dem verifieras: rör den inte, lämna till Fazli.
5. **Googles "Gränsdebitering" (ofta 5 000,00 kr) är en BETALNING, inte en kostnad.** Kostnaden är månadsfakturan. Avvisade dragningar bokförs aldrig. Beloppet 5 000,00 i bokföringen är alltid en Google-dragning.
6. **Underlag saknas → stanna.** Sök i tur och ordning: (a) `~/Downloads`, (b) leverantörens eget konto. Finns det på ingetdera är det Fazlis beslut, inte ditt. Makulera aldrig på eget bevåg.
7. **Gör inget om det kan bli dubbelt.** Vid minsta tvekan: avbryt utan att spara och rapportera.

## Var underlagen finns

- `~/Downloads/kvitton-2026/` — juli–augusti 2026
- `~/Downloads/meta_hairtp_transactions/` och `~/Downloads/meta_all_transactions/{hairtp,curatiio}/` — januari–juni
- `~/Downloads/underlag/google-ads-{hairtp,curatiio}_2026-MM.pdf` + `.csv`
- Filnamnsmönster: `ÅÅÅÅ-MM-DDTHH-MM Transaktion #<id>-<id>.pdf`

Två annonskonton, samma bokföringslogik: `1112651725849665` = Hair TP Clinic gbg AB, `479410056348442` = Curatiio / Fazli Hair OP AB.

Fortnox-inkorgen innehåller **inga** Meta-kvitton. De finns bara i `~/Downloads` och måste laddas upp, alternativt mejlas till `inbox.ver.326970@arkivplats.se`, innan de kan kopplas.

## Utgångsläge — vad som redan är gjort (2026-09-08)

Claude har utfört följande i skarp bokföring. DeepSeek ska **inte** göra om detta, men ska känna till det.

| Vernr     | Åtgärd                                                                   | Resultat                                                                                                                                                       |
| --------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A2241** | Dubblett av A2232. Alla rader strukna.                                   | 0,00 / 0,00. Beskrivning: `Makulerad dubblett av A2232 - samtliga rader strukna`                                                                               |
| **A2242** | Dubblett av A2238. Alla rader strukna.                                   | 0,00 / 0,00. Beskrivning: `Makulerad dubblett av A2238 - samtliga rader strukna`                                                                               |
| **A2232** | Alla rader strukna, facit inlagt, "RÄTTELSE" borttaget ur beskrivningen. | 2893 K 7 096 · 5911 D 7 096 · 2614 K 1 774 · 2645 D 1 774. Summa 8 870/8 870, diff 0. Beskrivning: `Meta ref VN57KU5L42 - Amex 1008`. **Underlag ej kopplat.** |
| **A331**  | Motpart till A2232. Alla rader strukna. Beskrivning orörd.               | 0,00 / 0,00                                                                                                                                                    |

Bakgrund: A2232–A2240 skapades av Claude via Fortnox API som fristående rättelseverifikat. Det var fel form — rättelser ska göras i verifikationen med strykmetoden. A2241 och A2242 uppstod dessutom som dubbletter av A2232 och A2238 när en trasig idempotenskontroll kördes mot skarpa data.

### Kvar i juli 2026, Hair TP

Sju par enligt samma mönster som A331 → A2232:

| Rättelse | Original | Datum      | Meta-ref   | Netto    | Kort                       |
| -------- | -------- | ---------- | ---------- | -------- | -------------------------- |
| A2233    | A332     | 2026-07-07 | XYTK3TDL42 | 7 096,00 | Amex 1008                  |
| A2234    | A333     | 2026-07-01 | 9MH3MSVK42 | 7 096,00 | Amex 1008                  |
| A2235    | A334     | 2026-07-03 | BQREPSMK42 | 7 096,00 | Amex 1008                  |
| A2236    | A348     | 2026-07-14 | YA64TTDL42 | 7 474,82 | Mastercard 3888 → **2412** |
| A2237    | A350     | 2026-07-15 | ZLTFXTRK42 | 1 285,83 | Amex 1008                  |
| A2238    | A352     | 2026-07-16 | S3TH9VML42 | 5 322,00 | Amex 6005                  |
| A2239    | A2226    | 2026-07-25 | K3NQYUDL42 | 6 710,02 | Amex 6005                  |

**A2240** är ingen rättelse — det är en betald Meta-transaktion 2026-07-19 (ref QTRMKV5L42, Amex 6005, 7 096,00) som aldrig bokförts. Den har redan rätt form och ska stå kvar. Kontrollera bara att beskrivningen inte innehåller "RÄTTELSE".

Mappningen ovan är verifierad för A2232→A331, A2233→A332 och A2238 (via A2242). Resten ska bekräftas mot beskrivningsfältet innan något stryks.

### Rör inte i denna order

| Vernr                           | Varför                                                                                                    |
| ------------------------------- | --------------------------------------------------------------------------------------------------------- |
| A347, A349, A351                | Dubbletter. Rätt motpart fastställd (A348, A350, A352). Fazli avgör.                                      |
| A335, A336, A345, A346          | Saknar betald Meta-transaktion. Ingen verifierad motpart → kan inte klassas som dubblett. Egen utredning. |
| A1649, A1657, A1676–A1679 m.fl. | Google-gränsdebiteringar bokförda som kostnad. Egen order.                                                |

## Arbetssätt — tio rättelser i taget

Fazlis beslut 2026-09-08. Arbetet sker i batchar om **tio rättelser**, inte månadsvis och inte i klump.

En "rättelse" = ett par: verifikationen som får facit-konteringen, plus motparten som nollas. Tio rättelser innebär alltså cirka tjugo verifikationer som rörs.

**Cykeln:**

1. DeepSeek rättar tio stycken.
2. DeepSeek rapporterar (format nedan) och stannar.
3. Claude granskar alla tio mot underlagen och rapporterar avvikelser.
4. Först när alla tio är godkända påbörjas nästa batch.

Ingen ny batch startas med öppna avvikelser i den föregående.

### Batch 1 — Meta, Hair TP

De sju kvarvarande juli-paren (tabellen under Utgångsläge), plus de tre tidigaste Meta-transaktionerna i juni 2026 för Hair TP.

Juli innehåller bara sju par — de tre sista hämtas från juni i datumordning, äldst först. Vilka de tre är avgörs av underlagen i `~/Downloads`, matchade mot Fortnox. Bekräfta mappningen mot beskrivningsfältet innan något stryks.

## Efter batcherna — avstämningsordern

När Meta för Hair TP är genomgånget skrivs **en enda order** som besvarar:

1. Hur många verifikationer som var felaktiga totalt.
2. Fördelningen per feltyp: fel kostnadskonto (5900 i stället för 5911), fel betalkonto (1930 i stället för 2893/2412), betalning bokförd som kostnad (Googles gränsdebiteringar), dubbletter, saknad omvänd moms, samt betalda transaktioner som aldrig bokförts.
3. **Varför volymen blev så stor** — grundorsaken bakom mönstret, inte en lista över symptom.
4. Vad som återstår och vad som lämnas till Fazli för beslut.

Den ordern skrivs en gång per bolag, inte per månad.

## Ordning mellan bolagen

1. **Hair TP Clinic gbg AB** — Meta (annonskonto `1112651725849665`), juli och bakåt
2. Hair TP — Google, gränsdebiteringarna separat från månadsfakturorna
3. **Curatiio / Fazli Hair OP AB** — Meta (annonskonto `479410056348442`)
4. Curatiio — Google

Ett bolag i taget, färdigt och avstämt innan nästa påbörjas.

## Rapport per batch

Levereras som `docs/handover/ORDERS/facit/ord-169-batch-<nr>-<bolag>.md`, med en rad per rättelse:

| Vernr | Datum | Underlag (transaktionsnr) | Gammal kontering | Ny kontering | Summa D/K | Motpart nollad | Underlag kopplat |
| ----- | ----- | ------------------------- | ---------------- | ------------ | --------- | -------------- | ---------------- |

Plus: antal rättade, antal nollade, antal lämnade till Fazli, summa netto, summa moms, och vilka betalda Meta-transaktioner i perioden som saknar verifikation.

Rapporten ska gå att kontrollera utan att fråga. Varje belopp ska kunna spåras till en namngiven fil.

## Vad Claude granskar

Per verifikation, mot underlaget:

1. Konto, benämning, debet, kredit, kontosaldo.
2. Summa debet = summa kredit, differens 0,00.
3. Betalkontot på rad 1.
4. Inget konto 5900 kvar i den aktiva konteringen.
5. Motparten nollad — kostnaden finns exakt en gång.
6. Underlaget kopplat, och transaktionsnumret i det stämmer med verifikationen.
7. Ingen "RÄTTELSE" i beskrivningen; beskrivningen i övrigt oförändrad.
8. Inga nya verifikationsnummer som inte finns i rapporten.

Avvikelser rapporteras tillbaka till DeepSeek. **Claude rättar inte själv — inte i någon månad.** Enda undantaget är de fyra verifikationer som redan är genomförda och listade under Utgångsläge.

## Referens

Kontologiken kommer från facit A268 (Meta), A1028 (HB-kort), A26 (utlägg Fazli) och A28 (Amex-inlösen). Metoden är genomförd skarpt på A331 → A2232 den 2026-09-08. Bakgrund i ORD-168.
