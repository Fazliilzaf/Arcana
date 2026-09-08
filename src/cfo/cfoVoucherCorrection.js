'use strict';

/**
 * ORD-168 · Rättelseverifikat via Fortnox API — spec-driven, fail-closed.
 *
 * Bakgrund: Arcana har bokfört Meta-/Google-annonser med fel kostnadskonto
 * (5900 gruppkonto i stället för 5911) och fel betalkonto (1930 i stället för
 * 2893 privat utlägg / 2412 HB-kort). Den här modulen rättar befintliga
 * verifikationer genom att posta RÄTTELSEVERIFIKAT — den ändrar och makulerar
 * aldrig något.
 *
 * SPECEN ÄR FACIT. Modulen härleder ingenting: den validerar, bygger payload
 * och postar. All bedömning sker utanför koden, av ägaren.
 *
 * HÅRDA GATES (i ordning):
 *  1. ARCANA_CFO_VOUCHER_CORRECTION_ENABLED === 'true', eller override-fil.
 *  2. Fortnox OAuth ansluten.
 *  3. fortnoxClient.createVoucher finns.
 *  4. Specen validerar (balans + radordning + obligatoriska fält).
 *  5. Idempotenskontroll mot redan skapade rättelser.
 *
 * dryRun = default true. Skarp körning kräver explicit dryRun:false.
 */

const DEFAULT_VOUCHER_SERIES = 'A';

/**
 * Betalkonton. Facit (A268, A1028, A26, A28) har ALLTID betalkontot på första
 * raden — ordningen är en del av kontraktet, inte kosmetik. Valideringen
 * avvisar specar som bryter mot det.
 */
const PAYMENT_ACCOUNTS = Object.freeze([
  1910, // Kassa
  1930, // Företagskonto/checkkonto
  1581, // Fordran AmEx (kortinlösen, INTÄKTSSIDAN — får ej användas för inköp)
  1582, // Övriga kortfordringar
  2412, // HB Kort (företagskort Handelsbanken)
  2440, // Leverantörsskulder
  2891, // Skuld till kortutgivare
  2893, // Skulder till närstående personer (privat utlägg)
]);

const CENT_TOLERANCE = 0.005;

function nowIso() {
  return new Date().toISOString();
}

function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

function normalizeText(v) {
  return typeof v === 'string' ? v.trim() : '';
}

/**
 * Validerar EN spec-post. Returnerar { ok, errors[] }.
 * Fel som fångas här får aldrig nå Fortnox.
 */
function validateEntry(entry, index) {
  const errors = [];
  const where = `spec[${index}]${entry?.origin ? ` (${entry.origin})` : ''}`;

  const date = normalizeText(entry?.date);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    errors.push(`${where}: date saknas eller har fel format (kräver ÅÅÅÅ-MM-DD)`);
  }
  if (!normalizeText(entry?.description)) {
    errors.push(`${where}: description saknas — krävs för idempotens`);
  }

  const rows = Array.isArray(entry?.rows) ? entry.rows : [];
  if (rows.length < 2) {
    errors.push(`${where}: minst två konteringsrader krävs`);
    return { ok: false, errors };
  }

  let debit = 0;
  let credit = 0;
  rows.forEach((row, i) => {
    const acc = Number(row?.Account);
    if (!Number.isInteger(acc) || acc < 1000 || acc > 9999) {
      errors.push(`${where} rad ${i + 1}: ogiltigt konto "${row?.Account}"`);
    }
    const d = Number(row?.Debit || 0);
    const c = Number(row?.Credit || 0);
    if (d < 0 || c < 0) errors.push(`${where} rad ${i + 1}: negativa belopp tillåts inte`);
    if (d > 0 && c > 0) {
      errors.push(`${where} rad ${i + 1}: både Debit och Credit satta`);
    }
    if (d === 0 && c === 0) {
      errors.push(`${where} rad ${i + 1}: raden saknar belopp`);
    }
    debit += d;
    credit += c;
  });

  if (Math.abs(round2(debit) - round2(credit)) > CENT_TOLERANCE) {
    errors.push(
      `${where}: debet ${round2(debit)} ≠ kredit ${round2(credit)} — verifikatet balanserar inte`
    );
  }

  // Facit-regeln: betalkontot överst.
  const firstAccount = Number(rows[0]?.Account);
  if (!PAYMENT_ACCOUNTS.includes(firstAccount)) {
    errors.push(
      `${where}: första raden är konto ${firstAccount} — betalkontot ska ligga överst ` +
        `(tillåtna: ${PAYMENT_ACCOUNTS.join(', ')})`
    );
  }

  return { ok: errors.length === 0, errors };
}

function validateSpec(spec) {
  const entries = Array.isArray(spec) ? spec : [];
  const errors = [];
  if (entries.length === 0) errors.push('specen är tom');

  // Dubbla descriptions i samma spec = garanterad dubbelbokning.
  const seen = new Map();
  entries.forEach((e, i) => {
    const key = normalizeText(e?.description).toLowerCase();
    if (key && seen.has(key)) {
      errors.push(`spec[${i}]: description dubblerad, redan använd i spec[${seen.get(key)}]`);
    } else if (key) {
      seen.set(key, i);
    }
    errors.push(...validateEntry(e, i).errors);
  });

  return { ok: errors.length === 0, errors, count: entries.length };
}

function buildPayload(entry, { series = DEFAULT_VOUCHER_SERIES } = {}) {
  const rows = entry.rows.map((r) => {
    const row = { Account: Number(r.Account) };
    const d = round2(Number(r.Debit || 0));
    const c = round2(Number(r.Credit || 0));
    if (d > 0) row.Debit = d;
    if (c > 0) row.Credit = c;
    if (normalizeText(r.TransactionInformation)) {
      row.TransactionInformation = normalizeText(r.TransactionInformation).slice(0, 100);
    }
    return row;
  });

  return {
    Voucher: {
      Description: normalizeText(entry.description).slice(0, 200),
      TransactionDate: normalizeText(entry.date),
      VoucherSeries: normalizeText(entry.series) || series,
      VoucherRows: rows,
    },
  };
}

function createCfoVoucherCorrection({
  env = process.env,
  fortnoxClient,
  fortnoxStore,
  audit = () => {},
  ensureAccountActiveForDate = async () => {},
  throttleMs = 600,
  rateLimitBackoffMs = 20000,
} = {}) {
  function readGateOverride() {
    const fs = require('fs');
    const path = require('path');
    const root = env.ARCANA_STATE_ROOT || '/var/data';
    const overridePath =
      env.ARCANA_CFO_VOUCHER_CORRECTION_OVERRIDE_PATH ||
      path.join(root, 'voucher-correction-override.json');
    try {
      const parsed = JSON.parse(fs.readFileSync(overridePath, 'utf8'));
      return { enabled: parsed && parsed.voucherCorrectionEnabled === true, path: overridePath };
    } catch {
      return { enabled: false, path: overridePath };
    }
  }

  /**
   * Idempotens: hämtar redan bokförda verifikat för räkenskapsåret och
   * returnerar ett Set med Description i gemener. En rättelse vars description
   * redan finns postas ALDRIG igen.
   */
  async function loadExistingDescriptions(financialYearDate, { maxPages = 10 } = {}) {
    const found = new Set();
    if (typeof fortnoxClient?.listVouchers !== 'function') return found;
    for (let page = 1; page <= maxPages; page += 1) {
      let res;
      try {
        res = await fortnoxClient.listVouchers({ financialYearDate, page, limit: 100 });
      } catch {
        break;
      }
      const list = Array.isArray(res?.Vouchers) ? res.Vouchers : [];
      list.forEach((v) => {
        const d = normalizeText(v?.Description).toLowerCase();
        if (d) found.add(d);
      });
      const meta = res?.MetaInformation || {};
      const totalPages = Number(meta['@TotalPages'] || meta.TotalPages || 0);
      if (!list.length || (totalPages && page >= totalPages)) break;
    }
    return found;
  }

  async function run({ spec, dryRun = true, series = DEFAULT_VOUCHER_SERIES } = {}) {
    const startedAt = nowIso();
    const validation = validateSpec(spec);
    const payloads = validation.ok
      ? spec.map((e) => ({ origin: e.origin || null, ...buildPayload(e, { series }) }))
      : [];

    if (!validation.ok) {
      return {
        ok: false,
        reason: 'spec_invalid',
        errors: validation.errors,
        count: validation.count,
        startedAt,
      };
    }

    const gate = readGateOverride();
    const enabled =
      String(env.ARCANA_CFO_VOUCHER_CORRECTION_ENABLED || '') === 'true' || gate.enabled === true;

    if (dryRun) {
      return {
        ok: true,
        dryRun: true,
        enabled,
        count: payloads.length,
        payloads,
        startedAt,
        note: enabled
          ? 'Gate är öppen — dryRun:false kör skarpt.'
          : 'Gate är STÄNGD. Skarp körning kräver ARCANA_CFO_VOUCHER_CORRECTION_ENABLED=true eller override-fil.',
      };
    }

    if (!enabled) {
      return {
        ok: false,
        reason: 'disabled',
        detail: 'ARCANA_CFO_VOUCHER_CORRECTION_ENABLED != true (fail-closed — kräver ägar-GO)',
        overridePath: gate.path,
        count: payloads.length,
        startedAt,
      };
    }

    const connection = fortnoxStore?.getConnection ? await fortnoxStore.getConnection() : null;
    if (!connection?.connected && !connection?.accessToken) {
      return { ok: false, reason: 'fortnox_not_connected', count: payloads.length, startedAt };
    }
    if (typeof fortnoxClient?.createVoucher !== 'function') {
      return {
        ok: false,
        reason: 'fortnox_client_missing_createVoucher',
        count: payloads.length,
        startedAt,
      };
    }

    // Idempotenskontroll per RÄKENSKAPSÅR, inte per datum. Nio poster i samma
    // månad ska ge ETT uppslag, inte nio — annars slår vi i Fortnox rate-limit
    // (429) redan innan första skrivningen. Ett representativt datum per år räcker;
    // Fortnox löser upp financialyeardate till hela året.
    const oneDatePerYear = new Map();
    payloads.forEach((p) => {
      const d = p.Voucher.TransactionDate;
      const year = String(d).slice(0, 4);
      if (!oneDatePerYear.has(year)) oneDatePerYear.set(year, d);
    });
    const existing = new Set();
    for (const key of oneDatePerYear.values()) {
      const descs = await loadExistingDescriptions(key);
      descs.forEach((d) => existing.add(d));
    }

    const results = [];
    for (const [i, item] of payloads.entries()) {
      const voucher = item.Voucher;
      const descKey = voucher.Description.toLowerCase();

      if (existing.has(descKey)) {
        results.push({
          origin: item.origin,
          ok: true,
          skipped: true,
          reason: 'already_exists',
          description: voucher.Description,
        });
        audit('cf.fortnox.voucher_correction_skipped', {
          origin: item.origin,
          description: voucher.Description,
        });
        continue;
      }

      try {
        if (i > 0 && throttleMs > 0) await new Promise((z) => setTimeout(z, throttleMs));

        // Konton måste vara aktiva för transaktionens räkenskapsår (ORD-CM-75).
        const accounts = [...new Set(voucher.VoucherRows.map((r) => r.Account))];
        for (const acc of accounts) {
          await ensureAccountActiveForDate(acc, voucher.TransactionDate);
        }

        let response;
        try {
          response = await fortnoxClient.createVoucher(voucher);
        } catch (err) {
          if (err && err.statusCode === 429) {
            await new Promise((z) => setTimeout(z, rateLimitBackoffMs));
            response = await fortnoxClient.createVoucher(voucher);
          } else throw err;
        }

        const number = response?.Voucher?.VoucherNumber || null;
        const vseries = response?.Voucher?.VoucherSeries || voucher.VoucherSeries;
        if (!number) {
          results.push({
            origin: item.origin,
            ok: false,
            error: 'voucher_number_missing_in_response',
            description: voucher.Description,
          });
          audit('cf.fortnox.voucher_correction_error', {
            origin: item.origin,
            error: 'voucher_number_missing_in_response',
          });
          continue;
        }

        existing.add(descKey);
        results.push({
          origin: item.origin,
          ok: true,
          created: `${vseries}${number}`,
          date: voucher.TransactionDate,
          description: voucher.Description,
          rows: voucher.VoucherRows,
        });
        audit('cf.fortnox.voucher_correction_created', {
          origin: item.origin,
          created: `${vseries}${number}`,
        });
      } catch (err) {
        results.push({
          origin: item.origin,
          ok: false,
          error: err?.message || String(err),
          description: voucher.Description,
        });
        audit('cf.fortnox.voucher_correction_error', {
          origin: item.origin,
          error: err?.message || String(err),
        });
      }
    }

    return {
      ok: results.every((r) => r.ok),
      dryRun: false,
      count: payloads.length,
      created: results.filter((r) => r.ok && !r.skipped).length,
      skipped: results.filter((r) => r.skipped).length,
      failed: results.filter((r) => !r.ok).length,
      results,
      startedAt,
      finishedAt: nowIso(),
    };
  }

  return { run, validateSpec, buildPayload, readGateOverride, PAYMENT_ACCOUNTS };
}

module.exports = {
  createCfoVoucherCorrection,
  validateSpec,
  validateEntry,
  buildPayload,
  PAYMENT_ACCOUNTS,
};
