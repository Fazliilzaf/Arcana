# Hair TP Clinic – kunskapsbas

Lägg in klinikens innehåll här som `.md` eller `.txt` (t.ex. FAQ, priser, behandling, eftervård).

Arcana använder filerna för att plocka fram relevanta stycken och svara mer korrekt.

## Snabb import från webb
Om du vill fylla kunskapsbasen automatiskt från hemsidan kan du köra:

`npm run ingest:hairtpclinic`

Det skapar Markdown-filer i `knowledge/hair-tp-clinic/site/` som Arcana indexerar vid omstart.

Förslag på filer:
- `faq.md`
- `priser.md`
- `behandling.md`
- `eftervard.md`
- `kontakt.md`
