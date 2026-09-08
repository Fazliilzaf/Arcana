#!/usr/bin/env node
/**
 * Flyttar offertportalens beslutsblock till rätt ordning.
 *
 * VARFÖR ETT SKRIPT OCH INTE EN HANDREDIGERING. De två block som ska
 * byta plats är 358 respektive 392 rader. Att återge dem för hand i en
 * redigering av en produktionsfil på 6 000 rader är ett
 * transkriberingsfel som väntar på att hända, och det syns inte i en
 * diff eftersom diffen ÄR flytten. Ett skript som lokaliserar block via
 * markörer, klipper, klistrar och sedan RÄKNAR OM allt det bar gör
 * samma sak utan att någon behöver skriva av något.
 *
 * VAD SOM FLYTTAS OCH VARFÖR. I dag möter patienten tillväxtdiagrammet
 * och signeringskortet INNAN hen sett bilderna, zonerna och priset. Hen
 * ombeds alltså skriva under före hen läst vad hon skriver under på.
 * Efter flytten: underlaget först, sedan förloppet, sedan signeringen.
 *
 *   före                          efter
 *   ─────────────────────         ─────────────────────
 *   patientband                   patientband
 *   nästa steg                    nästa steg
 *   grindar, opdag, eftervård     grindar, opdag, eftervård
 *   TILLVÄXT                      Din offert · underlag
 *   SIGNERING                     zoner · pris · vad ingår
 *   Din offert · underlag         TILLVÄXT
 *   zoner · pris · vad ingår      SIGNERING
 *   AI-analys …                   AI-analys …
 *
 * SÄKERHETEN LIGGER I ATT DET VÄGRAR. Skriptet räknar de 83
 * datakrokarna, de 11 funktions-id:na och taggbalansen före och efter.
 * Skiljer sig något skrivs ingenting. Det skriver heller ingenting utan
 * --skriv; utan flaggan är det en torrkörning som bara rapporterar.
 *
 *   node scripts/ordna-om-offertportalen.mjs           # torrkörning
 *   node scripts/ordna-om-offertportalen.mjs --skriv   # utför
 *
 * EFTERÅT MÅSTE SIDAN RENDERAS. Krokräkning bevisar att inget
 * försvunnit. Den bevisar INTE att ett block hamnat i rätt förälder
 * eller att sidan ser rätt ut. Kör tests/public/ och titta på sidan.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HÄR = path.dirname(fileURLToPath(import.meta.url));
const FIL = path.join(
  HÄR,
  '..',
  'public',
  'major-arcana-preview',
  'cco-patient-offer-portal-v3.html'
);

/* Markörer. Textstycken som är unika i filen och som inte är
   formateringskänsliga — inga radnummer, för de flyttar sig. */
const BLOCK_START = '      <div class="timeline-card" data-unlock="1"';
const BLOCK_SLUT_EFTER = '      <div class="section-heading ton-gron" data-unlock="1"';
const MÅL_FÖRE = '      <div class="section-heading ton-lila" data-unlock="1"';

const KROKAR = [
  'data-staff-preview-banner', 'data-offer-customer-first-name', 'data-offer-operation-date',
  'data-cco-portal-level2', 'data-portal-next-action', 'data-next-action-kicker',
  'data-next-action-title', 'data-next-action-copy', 'data-next-action-status',
  'data-next-action-cooling', 'data-next-action-evidence', 'data-next-action-button',
  'data-next-action-hint', 'data-portal-journey-gates', 'data-portal-journey-gates-list',
  'data-operation-day-panel', 'data-operation-day-eyebrow', 'data-operation-day-title',
  'data-operation-day-date', 'data-operation-day-copy', 'data-operation-day-checks',
  'data-operation-day-hint', 'data-aftercare-panel', 'data-aftercare-eyebrow',
  'data-aftercare-title', 'data-aftercare-status', 'data-aftercare-copy',
  'data-aftercare-steps', 'data-aftercare-hint', 'data-portal-status-chip',
  'data-portal-sign-title', 'data-portal-sign-copy', 'data-portal-quote-status',
  'data-portal-esign-status', 'data-portal-cooling-status', 'data-portal-next-step',
  'data-offer-customer-name', 'data-offer-document-pdf', 'data-offer-document-link',
  'data-portal-files-panel', 'data-portal-files-list', 'data-portal-photos-panel',
  'data-portal-photos-list', 'data-portal-plan-evidence', 'data-plan-evidence-photo-count',
  'data-plan-evidence-total-grafts', 'data-plan-evidence-price', 'data-plan-evidence-method',
  'data-plan-evidence-zones', 'data-offer-method', 'data-offer-zone-legend',
  'data-offer-graft-bar', 'data-offer-zones', 'data-offer-price-method',
  'data-offer-price-total-grafts', 'data-offer-quoted-amount', 'data-offer-deposit-amount',
  'data-offer-total-amount', 'data-offer-value-method', 'data-offer-value-total-grafts',
  'data-offer-value-total', 'data-offer-planning-note', 'data-secure-contact-panel',
  'data-secure-contact-eyebrow', 'data-secure-contact-title', 'data-secure-contact-status',
  'data-secure-contact-copy', 'data-secure-contact-owner', 'data-secure-contact-thread',
  'data-secure-contact-next', 'data-secure-contact-hint', 'data-portal-trust-log',
  'data-portal-trust-eyebrow', 'data-portal-trust-title', 'data-portal-trust-badge',
  'data-portal-trust-copy', 'data-portal-trust-updated', 'data-portal-trust-access',
  'data-portal-trust-evidence', 'data-portal-trust-sharing', 'data-portal-trust-hint',
  'data-sticky-sign-title', 'data-sticky-sign-copy',
];

const IDN = [
  'mainSignCard', 'bankidBtn', 'bankidSigned', 'signedTime', 'countdownCard',
  'countdownDays', 'reminderToggle', 'reminderConfirm', 'faqCard', 'faqOverlay', 'stickySign',
];

/** Bara kroppen. Skriptblocket nämner varje kroknamn som sträng, så en
 *  räkning över hela filen hade dolt en försvunnen krok bakom det anrop
 *  som just blivit trasigt. */
function kropp(html) {
  const a = html.indexOf('<body');
  const b = html.indexOf('<script', a);
  if (a < 0 || b < 0) throw new Error('Hittade inte <body>…<script>.');
  return html.slice(a, b);
}

function inventera(html) {
  const k = kropp(html);
  const bok = { krokar: {}, idn: {}, oppna: 0, stangda: 0 };
  for (const namn of KROKAR) {
    bok.krokar[namn] = (k.match(new RegExp(`\\s${namn}(?=[\\s=>/])`, 'g')) || []).length;
  }
  for (const id of IDN) {
    bok.idn[id] = k.split(`id="${id}"`).length - 1;
  }
  bok.oppna = (k.match(/<div\b/g) || []).length;
  bok.stangda = (k.match(/<\/div>/g) || []).length;
  return bok;
}

function jamfor(fore, efter) {
  const avvikelser = [];
  for (const namn of KROKAR) {
    if (fore.krokar[namn] !== efter.krokar[namn]) {
      avvikelser.push(`  ${namn}: ${fore.krokar[namn]} → ${efter.krokar[namn]}`);
    }
  }
  for (const id of IDN) {
    if (fore.idn[id] !== efter.idn[id]) {
      avvikelser.push(`  #${id}: ${fore.idn[id]} → ${efter.idn[id]}`);
    }
  }
  if (fore.oppna !== efter.oppna) avvikelser.push(`  <div: ${fore.oppna} → ${efter.oppna}`);
  if (fore.stangda !== efter.stangda) {
    avvikelser.push(`  </div>: ${fore.stangda} → ${efter.stangda}`);
  }
  return avvikelser;
}

function hittaEn(html, markör, vad) {
  const i = html.indexOf(markör);
  if (i < 0) throw new Error(`Hittade inte ${vad}. Markören: ${markör.trim()}`);
  if (html.indexOf(markör, i + 1) >= 0) {
    throw new Error(`${vad} förekommer mer än en gång — markören är inte unik.`);
  }
  return i;
}

function main() {
  const skriv = process.argv.includes('--skriv');
  const original = fs.readFileSync(FIL, 'utf8');
  const fore = inventera(original);

  const start = hittaEn(original, BLOCK_START, 'blockets början (tillväxtdiagrammet)');
  const slut = hittaEn(original, BLOCK_SLUT_EFTER, 'blockets slut (rubriken Din offert)');
  const mål = hittaEn(original, MÅL_FÖRE, 'målet (rubriken AI-analys)');

  if (!(start < slut && slut < mål)) {
    throw new Error(
      'Blocken ligger inte i väntad ordning. Antingen är flytten redan gjord ' +
        'eller så har filen byggts om. Kör inte vidare utan att titta.'
    );
  }

  const block = original.slice(start, slut);
  const utan = original.slice(0, start) + original.slice(slut);
  const nyttMål = utan.indexOf(MÅL_FÖRE);
  const resultat = utan.slice(0, nyttMål) + block + utan.slice(nyttMål);

  const efter = inventera(resultat);
  const avvikelser = jamfor(fore, efter);

  console.log(`Block som flyttas: ${block.split('\n').length} rader.`);
  console.log(`Krokar: ${KROKAR.length} · id:n: ${IDN.length}`);
  console.log(`Taggar i kroppen: ${fore.oppna} <div, ${fore.stangda} </div>`);

  if (avvikelser.length) {
    console.error('\nAVBRYTER. Inventariet skiljer sig efter flytten:\n');
    console.error(avvikelser.join('\n'));
    console.error('\nInget har skrivits.');
    process.exit(1);
  }

  if (resultat.length !== original.length) {
    console.error(
      `\nAVBRYTER. Filen ändrade längd: ${original.length} → ${resultat.length}. ` +
        'En ren flytt får inte ändra en enda byte i mängd.'
    );
    process.exit(1);
  }

  console.log('\nInventariet är identiskt före och efter. Filens längd oförändrad.');

  if (!skriv) {
    console.log('\nTorrkörning — inget skrivet. Kör med --skriv för att utföra.');
    return;
  }

  fs.writeFileSync(FIL, resultat, 'utf8');
  console.log('\nSkrivet.');
  console.log('KVAR ATT GÖRA: kör tests/public/ och RENDERA sidan. Räkningen bevisar');
  console.log('att inget försvunnit — den bevisar inte att något hamnat rätt.');
}

main();
