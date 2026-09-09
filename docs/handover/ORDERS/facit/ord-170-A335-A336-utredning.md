# ORD-170 · A335 och A336 — utredda, blockeringen släpps

Datum: 2026-09-08 · Utredare: Claude · Källor: Meta-kvitton i `~/Downloads`, kortutdrag `tmp/platinum-61008.csv` och `tmp/sas-elite-86005.csv`, samt `kvitto@hairtpclinic.com`

## Frågan

Batch 1 stannade på att A335 (daterad 2026-07-02) och A336 (daterad 2026-07-06) inte gick att knyta till någon transaktionsnyckel. Så länge de var okända kunde de vara någon av de åtta obokförda 7 096-posterna, och då skulle en ny bokföring dubblera kostnaden.

## Svaret

Datumen är **periodstarter, inte debiteringsdatum**. Ingen Meta-debitering har någonsin skett 07-02 eller 07-06 — varken på Amex 1008, Amex 6005 eller något annat kort. Inga kvitton finns för de datumen.

Två kvitton lästa i sin helhet avgör saken:

**`2026-07-07T06-30 Transaktion #27408746742142610-27401561106194512.pdf`**
Referensnummer **XYTK3TDL42** · Amex 1008 · 7 096,00 kr · Betald · Faktura-nr FBADS-066-106247380
Kampanjperiod: **"Från 2 jul 2026 00:00 till 7 jul 2026 06:30"**

**`2026-07-10T02-53 Transaktion #27433810176302938-27440900005593950.pdf`**
Referensnummer **VN57KU5L42** · Amex 1008 · 7 096,00 kr · Betald · Faktura-nr FBADS-066-106261282
Kampanjperiod: **"Från 6 jul 2026 00:00 till 10 jul 2026 02:53"**

Periodstarterna 2 jul och 6 jul motsvarar alltså debiteringarna 07-07 respektive 07-10.

| Verifikation | Datum (periodstart) | Verklig debitering | Referens       | Redan bokförd som |
| ------------ | ------------------- | ------------------ | -------------- | ----------------- |
| A335         | 2026-07-02          | 2026-07-07         | **XYTK3TDL42** | **A2233**         |
| A336         | 2026-07-06          | 2026-07-10         | **VN57KU5L42** | **A2232**         |

Samma mönster bevisades tidigare för A1065 och A1067 via cm-record-kedjan (`523c35ef` → mail 07-07, `efe67fb8` → mail 07-10).

## Konsekvens för ORD-170

**Blockeringen släpps. De åtta 7 096-posterna kan bokföras.**

A335 och A336 är dubbletter av kostnader som redan ligger bokförda i A2233 och A2232. De är alltså **inte** någon av de obokförda debiteringarna, och kan därför inte kollidera med dem.

## Separat — kräver Fazlis GO

A335 och A336 är dubbletter och bör nollas, men de står på "rör inte"-listan i ORD-169 och det är en ny nollning. Föreslagen åtgärd, med de beskrivningar som redan är godkända:

- A335 → `Makulerad dubblett av A2233 - samtliga rader strukna`
- A336 → `Makulerad dubblett av A2232 - samtliga rader strukna`

Detta hör till ORD-169, inte till ORD-170. Blanda inte in det i batcharna.

## Metodnot

Att slå upp `kvitto@hairtpclinic.com` löser inte den här typen av fråga snabbare än kvittot självt — mailets sammanfattning visar `Datumintervall`, alltså periodstarten, och det är just det fältet som skapade förvirringen. **Kampanjperioden i kvitto-PDF:en** (`Från … till …`) är det som binder periodstart till debiteringsdatum.
