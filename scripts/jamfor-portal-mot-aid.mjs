#!/usr/bin/env node
/**
 * Jämför offertportalen mot Hair AI Doctor — visuellt och i siffror.
 *
 * Bakgrund: portalen och AID ska kännas som samma produkt. "Kännas" går
 * inte att granska i källkod; det måste renderas och ses. Det här skriptet
 * gör tre saker i en körning:
 *
 *   1. Skärmbild av båda, samma bredd och pixeltäthet.
 *   2. En sammanfogad bild sida vid sida, så ögat kan jämföra direkt.
 *   3. En tabell över de beräknade värden som faktiskt bär känslan —
 *      typsnitt, radie, kant, skugga, ytgradient, knappform.
 *
 * Varför beräknade värden och inte källkod: under det här arbetet ljög
 * källkodsskanning sju gånger (räknade vita ljuslinjer som handskrivna
 * ytor, missade var() i inline-stilar, parade mörk text mot fel
 * gradientstopp). Renderad sida ljuger inte.
 *
 * AID kräver inloggning. Skriptet loggar ALDRIG in — det använder
 * /login, som är en riktig AID-yta med kort, fält och primärknapp, och
 * det räcker för att läsa av designspråket. Vill man jämföra en inloggad
 * vy får en människa logga in först och skicka --aid-url.
 *
 *   node scripts/jamfor-portal-mot-aid.mjs [--aid-url URL] [--ut KATALOG]
 */
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const arg = (namn, standard) => {
  const i = process.argv.indexOf(namn)
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : standard
}

const AID_URL = arg('--aid-url', 'http://127.0.0.1:5199/login')
const PORTAL_URL = arg(
  '--portal-url',
  'http://127.0.0.1:3100/major-arcana-preview/cco-patient-offer-portal-v3.html',
)
const UT = arg('--ut', '/tmp/jmf')
const BREDD = Number(arg('--bredd', '1440'))
const HOJD = Number(arg('--hojd', '1400'))

mkdirSync(UT, { recursive: true })

/** Läser de beräknade värden som bär den visuella känslan. */
const AVLASNING = `(() => {
  const c = el => el ? getComputedStyle(el) : null
  const forst = (...sel) => sel.map(s => document.querySelector(s)).find(Boolean)
  const kropp = getComputedStyle(document.body)
  const kort = forst('.card', '.aid-kort', '.portal-card', '[class*="card"]')
  const knapp = [...document.querySelectorAll('button')]
    .find(b => { const s = getComputedStyle(b); return s.backgroundImage !== 'none' || s.backgroundColor !== 'rgba(0, 0, 0, 0)' })
  const falt = forst('input[type="text"]', 'input:not([type="checkbox"]):not([type="radio"])', 'input')
  const kap = (s, n = 200) => (s || '').replace(/\\s+/g, ' ').trim().slice(0, n)
  return {
    typsnitt: kap(kropp.fontFamily, 90),
    brodstorlek: kropp.fontSize,
    radhojd: kropp.lineHeight,
    kort: kort && {
      radie: c(kort).borderRadius,
      kant: kap(c(kort).border, 60),
      skugga: kap(c(kort).boxShadow),
      yta: kap(c(kort).backgroundImage !== 'none' ? c(kort).backgroundImage : c(kort).backgroundColor),
      padding: c(kort).padding,
    },
    knapp: knapp && {
      radie: c(knapp).borderRadius,
      hojd: c(knapp).height,
      skugga: kap(c(knapp).boxShadow, 140),
      yta: kap(c(knapp).backgroundImage !== 'none' ? c(knapp).backgroundImage : c(knapp).backgroundColor, 140),
      vikt: c(knapp).fontWeight,
    },
    falt: falt && {
      radie: c(falt).borderRadius,
      hojd: c(falt).height,
      kant: kap(c(falt).border, 60),
      yta: c(falt).backgroundColor,
    },
  }
})()`

async function las(sida, url, namn) {
  await sida.goto(url, { waitUntil: 'networkidle', timeout: 45000 })
  // Animationer av: annars blir två körningar aldrig jämförbara.
  await sida.addStyleTag({
    content: '*,*::before,*::after{animation:none!important;transition:none!important}',
  })
  await sida.waitForTimeout(900)
  const fil = join(UT, `${namn}.png`)
  await sida.screenshot({ path: fil })
  return { fil, varden: await sida.evaluate(AVLASNING) }
}

const wb = await chromium.launch()
const ctx = await wb.newContext({
  viewport: { width: BREDD, height: HOJD },
  deviceScaleFactor: 2,
})
const sida = await ctx.newPage()

const aid = await las(sida, AID_URL, 'aid')
const portal = await las(sida, PORTAL_URL, 'portal')

// Sammanfogad bild — ögat jämför bättre än två filer i tur och ordning.
const ihop = await ctx.newPage()
await ihop.setViewportSize({ width: BREDD * 2 + 48, height: HOJD + 72 })
await ihop.setContent(`<!doctype html><meta charset="utf-8">
<style>
  body{margin:0;background:#1b1714;font:600 15px/1.4 -apple-system,system-ui,sans-serif;color:#f3ece4}
  .rad{display:flex;gap:16px;padding:16px}
  figure{margin:0;flex:1}
  figcaption{padding:6px 2px 10px;letter-spacing:.06em;text-transform:uppercase;font-size:12px;opacity:.75}
  img{width:100%;display:block;border-radius:8px}
</style>
<div class="rad">
  <figure><figcaption>Hair AI Doctor</figcaption><img src="file://${aid.fil}"></figure>
  <figure><figcaption>Offertportalen</figcaption><img src="file://${portal.fil}"></figure>
</div>`)
await ihop.waitForTimeout(500)
const sidaVidSida = join(UT, 'sida-vid-sida.png')
await ihop.screenshot({ path: sidaVidSida, fullPage: true })

// Tabellen. Skillnad markeras — likhet är poängen, inte listan.
const rader = []
const jmf = (etikett, a, b) => rader.push({ etikett, aid: a ?? '—', portal: b ?? '—', lika: String(a) === String(b) })
jmf('typsnitt', aid.varden.typsnitt, portal.varden.typsnitt)
jmf('brödstorlek', aid.varden.brodstorlek, portal.varden.brodstorlek)
jmf('radhöjd', aid.varden.radhojd, portal.varden.radhojd)
for (const del of ['kort', 'knapp', 'falt']) {
  const a = aid.varden[del] || {}
  const b = portal.varden[del] || {}
  for (const n of new Set([...Object.keys(a), ...Object.keys(b)])) jmf(`${del}.${n}`, a[n], b[n])
}

console.log(`\nSKÄRMBILDER\n  ${aid.fil}\n  ${portal.fil}\n  ${sidaVidSida}  ← sida vid sida\n`)
console.log('VÄRDEN SOM BÄR KÄNSLAN\n')
for (const r of rader) {
  console.log(`${r.lika ? '  =' : '  ≠'} ${r.etikett}`)
  if (!r.lika) {
    console.log(`      AID:     ${r.aid}`)
    console.log(`      portal:  ${r.portal}`)
  }
}
const olika = rader.filter(r => !r.lika).length
console.log(`\n${olika} av ${rader.length} skiljer sig.`)
writeFileSync(join(UT, 'jamforelse.json'), JSON.stringify({ aid: aid.varden, portal: portal.varden }, null, 2))
await wb.close()
