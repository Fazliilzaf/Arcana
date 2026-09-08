# ORD-169 Batch 1 — komplett brief

Datum: 2026-09-08 · Bolag: **Hair TP Clinic gbg AB** · Leverantör: Meta · Ägar-GO: Fazli

Allt du behöver står här. Full bakgrund i `ORD-169-facit-arbetslistor-annonsbokforing-2026-09-08.md`.

## Innan du börjar

Öppna rätt projekt i VS Code:

```
/Users/fazlikrasniqi/Code/major-arcana
```

Det är där briefen och ordern ligger. Öppna **inte** `curatiio-web` eller någon annan mapp — Fortnox-arbetet hör till Hair TP och dokumentationen finns bara i `major-arcana`.

Cursor delar arbetskopian i det här repot. Kör `git status` och kontrollera vilken gren du står på innan du rör någon fil. Använd aldrig `git add -A` — stagea explicita filer.

## Uppgift

Sju rättelser i Fortnox. Varje rättelse är ett **par**: originalet nollas, rättelseverifikationen får facit-konteringen.

**Stanna efter de sju och rapportera. Börja inte på nästa batch.**

## De sju paren

| #   | Nollas | Får facit | Datum      | Meta-ref   | Netto    | Moms     | Betalkonto |
| --- | ------ | --------- | ---------- | ---------- | -------- | -------- | ---------- |
| 1   | A332   | A2233     | 2026-07-07 | XYTK3TDL42 | 7 096,00 | 1 774,00 | 2893       |
| 2   | A333   | A2234     | 2026-07-01 | 9MH3MSVK42 | 7 096,00 | 1 774,00 | 2893       |
| 3   | A334   | A2235     | 2026-07-03 | BQREPSMK42 | 7 096,00 | 1 774,00 | 2893       |
| 4   | A348   | A2236     | 2026-07-14 | YA64TTDL42 | 7 474,82 | 1 868,71 | **2412**   |
| 5   | A350   | A2237     | 2026-07-15 | ZLTFXTRK42 | 1 285,83 | 321,46   | 2893       |
| 6   | A352   | A2238     | 2026-07-16 | S3TH9VML42 | 5 322,00 | 1 330,50 | 2893       |
| 7   | A2226  | A2239     | 2026-07-25 | K3NQYUDL42 | 6 710,02 | 1 677,51 | 2893       |

Momsbeloppen är fastställda — räkna inte om dem. A348 och A350 bär redan sina belopp i Fortnox och de ligger i momsrapporten.

## Konteringen som ska in i A22xx

Fyra rader, **betalkontot överst**:

```
<betalkonto>  KREDIT  <netto>     2893 Skulder till närstående personer, kortfristig del
                                  (par 4: 2412 HB Kort)
5911          DEBET   <netto>     Facebookannonsering
2614          KREDIT  <moms>      Utgående moms omvänd skattskyldighet, 25 %
2645          DEBET   <moms>      Beräknad ingående moms på förvärv från utlandet
```

Summa debet ska bli `netto + moms`, lika mycket i kredit, differens 0,00.

## Ordning per par — får inte kastas om

1. **Öppna originalet.** Ändra → stryk ALLA rader → kontrollera 0,00 / 0,00 → Bokför. Beskrivningen rörs inte.
2. **Öppna rättelsen A22xx.** Ändra → stryk ALLA rader → skriv in de fyra facit-raderna → kontrollera summan → ta bort `RATTELSE Axxx - ` ur beskrivningen → Bokför.

Originalet nollas först. Avbryts körningen mitt i ska kostnaden saknas — aldrig vara dubbel.

Exempel på beskrivning efter redigering: `RATTELSE A332 - Meta ref XYTK3TDL42 - Amex 1008` → `Meta ref XYTK3TDL42 - Amex 1008`.

## Metod

Fortnox ligger i en iframe: `document.querySelector('iframe').contentDocument`.

**Läs aldrig tillgänglighetsträdet** — det ger hundratals KB per anrop och fyller kontexten. Använd JavaScript nedan; en verifikation blir några hundra byte.

### Läs verifikationen

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

### Ändraläget

```js
document
  .querySelector('iframe')
  .contentDocument.querySelector('.js-voucher-alter-voucher')
  .click();
```

Rubriken måste sedan vara `VERIFIKATION - ÄNDRA <vernr>`. Står det något annat — avbryt. Läs rubriken specifikt, inte hela `body.innerText`; Fortnox har dolda paneler i samma DOM.

### Lista raderna

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

### Stryk en rad — ETT anrop per rad

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

Enbart `.click()` fungerar **inte**. Hela sekvensen krävs. En loop över flera rader fungerar inte heller — widgeten hinner inte rendera om.

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

Kontofältet är en autocomplete som **inte** reagerar på syntetiska events. `input.value = "..."` ser ut att fungera men Fortnox registrerar ingenting.

1. Fysisk musklick i KONTO-cellen på första tomma raden.
2. Skriv kontonumret med riktigt tangentbord.
3. **Klicka på raden i listrutan** — annars binds kontot inte.
4. Fysisk musklick i DEBET- eller KREDIT-cellen, skriv beloppet med komma: `7096,00`.
5. Klicka i KONTO-cellen på nästa tomma rad — det commit:ar föregående fält.

Nya tomma rader tillkommer automatiskt.

### Beskrivningen

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

Blockeras anropet: klicka knappen fysiskt. Kvitto på att det gick igenom är notisen `Verifikation <vernr> har uppdaterats` och att sidan går till verifikationslistan.

## Hårda regler

1. **Betalkontot ligger alltid överst.**
2. **Stryk alla rader, inte bara de felaktiga.** Strukna rader räknas inte i saldot men står kvar för spårbarheten. Att momsen kommer med en gång till är godkänt.
3. **Använd "Ändra" — aldrig "Ändringsverifikation".** Den senare skapar ett nytt verifikat och ger dubbletter.
4. **2614 och 2645 ska bära identiskt belopp.** Skiljer de sig är verifikationen fel.
5. **Konto 5900 får aldrig förekomma** i den nya konteringen. Det är ett gruppkonto.
6. **Beskrivningen ändras inte** utöver att `RATTELSE Axxx - ` tas bort. Ordet "RÄTTELSE" ska inte finnas kvar någonstans.
7. **Sessionen dör ofta** och kastar tillbaka till företagsväljaren — sessions-id:t i URL:en byts då. Kontrollera alltid vilken verifikation du står på innan du stryker något.
8. **Vid minsta tvekan: avbryt utan att spara och rapportera.** Gör ingenting som kan bli dubbelt.

## Rör inte

- **A2240** — betald Meta-transaktion 2026-07-19 (QTRMKV5L42, 7 096,00) som aldrig bokförts. Har rätt form redan. Ska stå kvar.
- **A2241, A2242** — redan nollade dubbletter.
- **A2232, A331** — redan klara.
- **A347, A349, A351** — dubbletter, Fazli avgör.
- **A335, A336, A345, A346** — saknar betald motpart, egen utredning.
- Misslyckade betalningar utan Faktura-nr: KEH3MSVK42 (07-01), 5Z9NNTHL42 (07-07), 4QVC4T9L42 (07-10). Bokförs aldrig.

## Rapportera

En rad per par:

| Par | Original nollat (0,00/0,00) | Rättelse bokförd | Summa D/K | Differens | Beskrivning efter |
| --- | --------------------------- | ---------------- | --------- | --------- | ----------------- |

Plus eventuella avvikelser. Claude granskar allt mot underlagen innan nästa batch startar.
