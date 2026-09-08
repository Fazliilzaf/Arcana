#!/usr/bin/env node
/**
 * Mäter WCAG-kontrast i en renderad sida.
 *
 * Varför renderad och inte källkod: portalens färger kommer ur tokens,
 * genom gradienter, med alfa, och ärvda genom flera lager. Att räkna ut
 * vad en regel BLIR kräver att man är en webbläsare. Under det här
 * arbetet överskattade källkodsskanning sju gånger i rad.
 *
 * Instrumentet har en känd svaghet: när texten ligger på en gradient
 * väljer det det STOPP som ger sämst kontrast, även om texten i själva
 * verket sitter på den ljusa änden. Det gör siffran pessimistisk, aldrig
 * optimistisk — man missar alltså inget verkligt fel, men får några
 * falska.
 *
 * Därför är verktyget byggt för JÄMFÖRELSE, inte för absoluta tal:
 * kör före en ändring, spara antalet, kör efter. Samma pessimism i båda
 * körningarna betyder att bara SKILLNADEN är verklig.
 *
 *   node scripts/mat-kontrast.mjs [url] [--baslinje N]
 */
import { chromium } from 'playwright'

const url =
  process.argv[2] && !process.argv[2].startsWith('--')
    ? process.argv[2]
    : 'http://127.0.0.1:3100/major-arcana-preview/cco-patient-offer-portal-v3.html'
const i = process.argv.indexOf('--baslinje')
const baslinje = i > -1 ? Number(process.argv[i + 1]) : null

const wb = await chromium.launch()
const sida = await (await wb.newContext({ viewport: { width: 1280, height: 900 } })).newPage()
await sida.goto(url, { waitUntil: 'networkidle', timeout: 45000 })
await sida.waitForTimeout(700)

const fel = await sida.evaluate(() => {
  const lum = (r, g, b) => {
    const c = [r, g, b].map((v) => {
      v /= 255
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
  }
  const parse = (s) => {
    const m = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/)
    return m ? [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]] : null
  }
  const kon = (a, b) => {
    const [x, y] = [lum(...a), lum(...b)].sort((p, q) => q - p)
    return (x + 0.05) / (y + 0.05)
  }
  const stopp = (bi) =>
    [...bi.matchAll(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/g)]
      .filter((m) => m[4] === undefined || +m[4] >= 0.9)
      .map((m) => [+m[1], +m[2], +m[3]])
  const bakgrunder = (el) => {
    let n = el
    while (n && n !== document.documentElement) {
      const cs = getComputedStyle(n)
      if (cs.backgroundImage && cs.backgroundImage !== 'none') {
        const s = stopp(cs.backgroundImage)
        if (s.length) return s
      }
      const b = parse(cs.backgroundColor)
      if (b && b[3] >= 0.95) return [[b[0], b[1], b[2]]]
      n = n.parentElement
    }
    return [[250, 246, 242]]
  }

  const ut = []
  for (const el of document.querySelectorAll('*')) {
    if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue
    const cs = getComputedStyle(el)
    if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) continue
    const fg = parse(cs.color)
    if (!fg) continue
    const px = parseFloat(cs.fontSize)
    const fet = parseInt(cs.fontWeight) >= 700
    const krav = px >= 24 || (px >= 18.66 && fet) ? 3.0 : 4.5
    const k = Math.min(...bakgrunder(el).map((b) => kon([fg[0], fg[1], fg[2]], b)))
    if (k < krav) {
      ut.push({
        sel:
          el.tagName.toLowerCase() +
          (typeof el.className === 'string' && el.className
            ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
            : ''),
        px: +px.toFixed(0),
        krav,
        k: +k.toFixed(2),
        farg: cs.color,
        text: el.textContent.trim().slice(0, 28),
      })
    }
  }
  return ut
})
await wb.close()

const per = new Map()
for (const f of fel) {
  const n = `${f.sel}|${f.farg}`
  if (!per.has(n)) per.set(n, { ...f, antal: 0 })
  per.get(n).antal++
}
console.log(`KONTRASTBROTT: ${fel.length}`)
for (const v of [...per.values()].sort((a, b) => a.k - b.k)) {
  console.log(
    `  ${String(v.antal).padStart(3)}×  ${v.k} (krav ${v.krav})  ${v.px}px  ${v.sel}  ${v.farg}  "${v.text}"`,
  )
}
if (baslinje !== null) {
  const d = fel.length - baslinje
  console.log(`\nBaslinje ${baslinje} → nu ${fel.length}  (${d > 0 ? '+' : ''}${d})`)
  if (d > 0) {
    console.log('NYA BROTT INFÖRDA. Ändringen är inte klar.')
    process.exit(1)
  }
  console.log(d < 0 ? 'Färre brott än baslinjen.' : 'Oförändrat — inga nya brott.')
}
