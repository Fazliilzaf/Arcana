const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const XLSX = require('xlsx');

const DEFAULT_CUSTOMER_SETTINGS = Object.freeze({
  auto_merge: true,
  highlight_duplicates: true,
  strict_email: false,
});

function nowIso() {
  return new Date().toISOString();
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeKey(value) {
  return normalizeText(value).toLowerCase();
}

function normalizeBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (value === undefined || value === null) return fallback;
  return Boolean(value);
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function emptyState() {
  const ts = nowIso();
  return {
    version: 1,
    createdAt: ts,
    updatedAt: ts,
    tenants: {},
  };
}

async function readJson(filePath, fallbackValue) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error && error.code === 'ENOENT') return fallbackValue;
    throw error;
  }
}

async function writeJsonAtomic(filePath, data) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  const tmpPath = `${filePath}.${process.pid}.${crypto.randomUUID()}.tmp`;
  await fs.writeFile(tmpPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  await fs.rename(tmpPath, filePath);
}

function normalizeCount(value, fallback = 0) {
  const normalized = Number(value);
  if (!Number.isFinite(normalized)) return fallback;
  return Math.max(0, Math.round(normalized));
}

function normalizeStringArray(values, mapper = normalizeText) {
  const next = [];
  const seen = new Set();
  asArray(values).forEach((value) => {
    const normalized = mapper(value);
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    next.push(normalizeText(value));
  });
  return next;
}

function normalizeLookup(values, valueMapper = normalizeText) {
  const input = values && typeof values === 'object' ? values : {};
  return Object.fromEntries(
    Object.entries(input)
      .map(([key, value]) => [normalizeKey(key), valueMapper(value)])
      .filter(([key, value]) => key && value)
  );
}

function normalizeDirectory(values) {
  const input = values && typeof values === 'object' ? values : {};
  return Object.fromEntries(
    Object.entries(input)
      .map(([key, value]) => {
        const normalizedKey = normalizeKey(key);
        if (!normalizedKey || !value || typeof value !== 'object') return null;
        return [
          normalizedKey,
          {
            name: normalizeText(value.name) || normalizedKey,
            vip: normalizeBoolean(value.vip, false),
            emailCoverage: normalizeCount(value.emailCoverage, 0),
            duplicateCandidate: normalizeBoolean(value.duplicateCandidate, false),
            profileCount: Math.max(1, normalizeCount(value.profileCount, 1)),
            customerValue: normalizeCount(value.customerValue, 0),
            totalConversations: normalizeCount(value.totalConversations, 0),
            totalMessages: normalizeCount(value.totalMessages, 0),
          },
        ];
      })
      .filter(Boolean)
  );
}

function normalizeDetails(values) {
  const input = values && typeof values === 'object' ? values : {};
  return Object.fromEntries(
    Object.entries(input)
      .map(([key, value]) => {
        const normalizedKey = normalizeKey(key);
        if (!normalizedKey || !value || typeof value !== 'object') return null;
        return [
          normalizedKey,
          {
            emails: normalizeStringArray(value.emails, (entry) => normalizeText(entry).toLowerCase()),
            phone: normalizeText(value.phone),
            mailboxes: normalizeStringArray(value.mailboxes, normalizeKey),
          },
        ];
      })
      .filter(Boolean)
  );
}

function normalizeProfileCounts(values) {
  const input = values && typeof values === 'object' ? values : {};
  return Object.fromEntries(
    Object.entries(input)
      .map(([key, value]) => [normalizeKey(key), Math.max(1, normalizeCount(value, 1))])
      .filter(([key]) => key)
  );
}

function normalizeCustomerSettings(values) {
  const input = values && typeof values === 'object' ? values : {};
  return {
    auto_merge: normalizeBoolean(input.auto_merge, DEFAULT_CUSTOMER_SETTINGS.auto_merge),
    highlight_duplicates: normalizeBoolean(
      input.highlight_duplicates,
      DEFAULT_CUSTOMER_SETTINGS.highlight_duplicates
    ),
    strict_email: normalizeBoolean(input.strict_email, DEFAULT_CUSTOMER_SETTINGS.strict_email),
  };
}

function normalizeEmail(value) {
  return normalizeText(value).toLowerCase();
}

function normalizeSuggestionId(value) {
  const raw = normalizeText(value);
  if (!raw) return '';
  const parts = raw
    .split('::')
    .map((entry) => normalizeKey(entry))
    .filter(Boolean);
  if (!parts.length) return '';
  if (parts.length === 1) return parts[0];
  return parts.sort().join('::');
}

function stripDiacritics(value) {
  return normalizeText(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '');
}

function normalizeNameSignature(value) {
  return stripDiacritics(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function getNameTokens(value) {
  return normalizeNameSignature(value)
    .split(/\s+/g)
    .filter(Boolean);
}

function normalizePhone(value) {
  return normalizeText(value).replace(/[^\d+]+/g, '');
}

function normalizeMailboxLabel(value) {
  return normalizeText(value).toLowerCase();
}

function getEmailLocalPart(value) {
  const normalized = normalizeEmail(value);
  if (!normalized.includes('@')) return '';
  return normalized.split('@')[0].split('+')[0] || '';
}

function normalizeHeader(value) {
  return normalizeText(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function deriveMailboxLabel(value) {
  const localPart = normalizeText(value).split('@')[0] || '';
  if (!localPart) return '';
  return localPart.charAt(0).toUpperCase() + localPart.slice(1);
}

function splitMultiValue(value) {
  if (Array.isArray(value)) return value;
  const text = normalizeText(value);
  if (!text) return [];
  return text
    .split(/[\n;,|]+/g)
    .map((entry) => normalizeText(entry))
    .filter(Boolean);
}

function parseCsvLine(line) {
  const input = String(line || '');
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];
    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }
    if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
      continue;
    }
    current += char;
  }

  result.push(current);
  return result.map((value) => normalizeText(value));
}

function buildImportedRow(input = {}, rowNumber = 1, options = {}) {
  const record = input && typeof input === 'object' ? input : {};
  const emails = [];
  const mailboxes = [];
  const defaultMailboxId = normalizeEmail(options.defaultMailboxId);

  const pushEmails = (value) => {
    splitMultiValue(value).forEach((entry) => {
      const normalized = normalizeEmail(entry);
      if (normalized) emails.push(normalized);
    });
  };

  const pushMailboxes = (value) => {
    splitMultiValue(value).forEach((entry) => {
      const normalized = normalizeText(entry);
      if (normalized) mailboxes.push(normalized);
    });
  };

  pushEmails(record.email);
  pushEmails(record.primaryEmail);
  pushEmails(record.primary_email);
  pushEmails(record.secondaryEmail);
  pushEmails(record.secondary_email);
  pushEmails(record.emails);
  pushMailboxes(record.mailbox);
  pushMailboxes(record.mailboxes);
  pushMailboxes(record.mailboxLabel);
  pushMailboxes(record.mailboxLabels);

  Object.entries(record).forEach(([key, value]) => {
    const header = normalizeHeader(key);
    if (!header) return;
    if (
      header.startsWith('email') ||
      header.endsWith('_email') ||
      header.includes('epost') ||
      header.includes('e_post')
    ) {
      pushEmails(value);
      return;
    }
    if (header.startsWith('mailbox') || header.endsWith('_mailbox')) {
      pushMailboxes(value);
    }
  });

  if (mailboxes.length === 0 && defaultMailboxId) {
    const defaultMailboxLabel = deriveMailboxLabel(defaultMailboxId);
    if (defaultMailboxLabel) {
      mailboxes.push(defaultMailboxLabel);
    }
  }

  const normalizedEmails = normalizeStringArray(emails, normalizeEmail).map(normalizeEmail);
  const normalizedMailboxes = normalizeStringArray(mailboxes, normalizeKey);
  const name =
    normalizeText(record.name) ||
    normalizeText(record.customerName) ||
    normalizeText(record.customer_name) ||
    normalizeText(record.fullName) ||
    normalizeText(record.full_name);
  const vipCandidate =
    record.vip ??
    record.isVip ??
    record.is_vip ??
    record.priority ??
    record.segment;

  return {
    rowNumber,
    name,
    emails: normalizedEmails,
    phone:
      normalizeText(record.phone) ||
      normalizeText(record.phoneNumber) ||
      normalizeText(record.phone_number) ||
      normalizeText(record.telefon),
    mailboxes: normalizedMailboxes,
    vip:
      normalizeBoolean(vipCandidate, false) ||
      ['vip', 'high_value', 'priority'].includes(normalizeKey(vipCandidate)),
    customerValue: normalizeCount(
      record.customerValue ?? record.customer_value ?? record.value ?? record.ltv,
      0
    ),
    totalConversations: normalizeCount(
      record.totalConversations ?? record.total_conversations ?? record.conversations,
      0
    ),
    totalMessages: normalizeCount(
      record.totalMessages ?? record.total_messages ?? record.messages,
      0
    ),
  };
}

function parseJsonImportRows(text, options = {}) {
  const parsed = JSON.parse(text);
  const records = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed?.customers)
      ? parsed.customers
      : Array.isArray(parsed?.records)
        ? parsed.records
        : [];
  return records.map((record, index) => buildImportedRow(record, index + 1, options));
}

function parseCsvImportRows(text, options = {}) {
  const lines = String(text || '')
    .split(/\r?\n/g)
    .map((line) => line.trimEnd())
    .filter((line) => line.trim().length > 0);
  if (lines.length < 2) {
    throw new Error('CSV-importen måste innehålla rubrikrad och minst en datarad.');
  }

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  return lines.slice(1).map((line, rowIndex) => {
    const cells = parseCsvLine(line);
    const record = {};
    headers.forEach((header, index) => {
      if (!header) return;
      record[header] = cells[index] || '';
    });
    return buildImportedRow(record, rowIndex + 2, options);
  });
}

function parseStructuredImportRows(rows, options = {}) {
  return asArray(rows).map((row, index) => {
    const record = row && typeof row === 'object' ? row : {};
    const source = record.record && typeof record.record === 'object' ? record.record : record;
    const rowNumber = Math.max(1, Number(record.rowNumber || source.rowNumber || index + 1) || index + 1);
    return buildImportedRow(source, rowNumber, options);
  });
}

function parseSpreadsheetImportRows(binaryBase64, options = {}) {
  const source = normalizeText(binaryBase64);
  if (!source) {
    throw new Error('Importkällan är tom.');
  }

  let workbook = null;
  try {
    workbook = XLSX.read(Buffer.from(source, 'base64'), {
      type: 'buffer',
      cellDates: false,
      raw: false,
    });
  } catch (error) {
    throw new Error('Kalkylbladsfilen kunde inte läsas.');
  }

  const firstSheetName = asArray(workbook?.SheetNames).find((sheetName) => workbook?.Sheets?.[sheetName]);
  if (!firstSheetName) {
    throw new Error('Kalkylbladsfilen innehåller inga blad.');
  }

  const sheet = workbook.Sheets[firstSheetName];
  const records = XLSX.utils.sheet_to_json(sheet, {
    defval: '',
    raw: false,
  });
  return asArray(records).map((record, index) => buildImportedRow(record, index + 2, options));
}

function inferCustomerImportFormat(fileName = '', fallback = 'csv') {
  const normalizedFileName = normalizeText(fileName).toLowerCase();
  if (normalizedFileName.endsWith('.xlsx') || normalizedFileName.endsWith('.xls')) {
    return 'xlsx';
  }
  if (normalizedFileName.endsWith('.json')) {
    return 'json';
  }
  return fallback;
}

function parseCustomerImportRows({
  text,
  rows = null,
  binaryBase64 = '',
  fileName,
  defaultMailboxId = '',
}) {
  if (Array.isArray(rows)) {
    return {
      format: inferCustomerImportFormat(fileName, 'json'),
      rows: parseStructuredImportRows(rows, { defaultMailboxId }),
    };
  }

  const normalizedFileName = normalizeText(fileName).toLowerCase();
  if (normalizedFileName.endsWith('.xlsx') || normalizedFileName.endsWith('.xls')) {
    return {
      format: 'xlsx',
      rows: parseSpreadsheetImportRows(binaryBase64, { defaultMailboxId }),
    };
  }

  const sourceText = String(text || '').trim();
  if (!sourceText) {
    throw new Error('Importkällan är tom.');
  }

  const looksLikeJson =
    normalizedFileName.endsWith('.json') || sourceText.startsWith('{') || sourceText.startsWith('[');
  if (looksLikeJson) {
    return {
      format: 'json',
      rows: parseJsonImportRows(sourceText, { defaultMailboxId }),
    };
  }
  return {
    format: 'csv',
    rows: parseCsvImportRows(sourceText, { defaultMailboxId }),
  };
}

function cloneCustomerState(customerState = {}) {
  return JSON.parse(JSON.stringify(normalizeCustomerState(customerState)));
}

function buildCustomerKey(baseValue, customerState) {
  const directory = customerState.directory || {};
  const fallback = normalizeKey(baseValue) || 'imported_customer';
  let nextKey = fallback;
  let index = 2;
  while (directory[nextKey]) {
    nextKey = `${fallback}_${index}`;
    index += 1;
  }
  return nextKey;
}

function getActiveCustomerKeys(customerState) {
  const mergedInto = customerState.mergedInto || {};
  return Object.keys(customerState.directory || {}).filter((key) => !mergedInto[key]);
}

function resolveCustomerKey(customerState, customerKey) {
  const mergedInto = customerState.mergedInto || {};
  let currentKey = normalizeKey(customerKey);
  const seen = new Set();
  while (mergedInto[currentKey] && !seen.has(currentKey)) {
    seen.add(currentKey);
    currentKey = normalizeKey(mergedInto[currentKey]);
  }
  return currentKey;
}

function findMatchingCustomerKeys(customerState, importedRow, { strictEmail = false } = {}) {
  const matches = new Set();
  const activeKeys = getActiveCustomerKeys(customerState);
  const importedRecord = {
    key: `row_${importedRow.rowNumber}`,
    name: importedRow.name,
    emails: importedRow.emails,
    phone: importedRow.phone,
    mailboxes: importedRow.mailboxes,
    profileCount: Math.max(1, importedRow.emails.length || 1),
  };

  if (importedRow.emails.length) {
    activeKeys.forEach((customerKey) => {
      const existingRecord = createIdentityRecord(customerState, customerKey);
      if (
        importedRow.emails.some((email) =>
          existingRecord.emails.some((candidate) => normalizeEmail(candidate) === normalizeEmail(email))
        )
      ) {
        matches.add(resolveCustomerKey(customerState, customerKey));
      }
    });
  }

  if (!strictEmail && !matches.size) {
    activeKeys.forEach((customerKey) => {
      const existingRecord = createIdentityRecord(customerState, customerKey);
      const evidence = evaluateCustomerIdentityLink(existingRecord, importedRecord);
      if (evidence.confidence >= 68) {
        matches.add(resolveCustomerKey(customerState, customerKey));
      }
    });
  }

  return Array.from(matches).filter(Boolean);
}

function mergeCustomerProfiles(customerState, primaryKey, secondaryKeys, options = {}) {
  customerState.mergedInto = customerState.mergedInto || {};
  customerState.primaryEmailByKey = customerState.primaryEmailByKey || {};
  const directory = customerState.directory || {};
  const details = customerState.details || {};
  const profileCounts = customerState.profileCounts || {};
  const primary = directory[primaryKey];
  const primaryDetail = details[primaryKey];
  if (!primary || !primaryDetail) return;
  const keepEmails = normalizeBoolean(options.keepAllEmails, true);
  const keepPhones = normalizeBoolean(options.keepAllPhones, true);

  secondaryKeys.forEach((secondaryKey) => {
    if (!secondaryKey || secondaryKey === primaryKey) return;
    const resolvedSecondary = resolveCustomerKey(customerState, secondaryKey);
    if (!resolvedSecondary || resolvedSecondary === primaryKey) return;
    const secondary = directory[resolvedSecondary];
    const secondaryDetail = details[resolvedSecondary];
    if (!secondary || !secondaryDetail) return;

    if (keepEmails) {
      primaryDetail.emails = normalizeStringArray(
        [...asArray(primaryDetail.emails), ...asArray(secondaryDetail.emails)],
        normalizeEmail
      ).map(normalizeEmail);
    }
    primaryDetail.mailboxes = normalizeStringArray(
      [...asArray(primaryDetail.mailboxes), ...asArray(secondaryDetail.mailboxes)],
      normalizeKey
    );
    if (keepPhones && !normalizeText(primaryDetail.phone) && normalizeText(secondaryDetail.phone)) {
      primaryDetail.phone = normalizeText(secondaryDetail.phone);
    }

    primary.name = normalizeText(primary.name) || normalizeText(secondary.name) || primaryKey;
    primary.vip = Boolean(primary.vip || secondary.vip);
    primary.emailCoverage = Math.max(
      normalizeCount(primary.emailCoverage, 0),
      normalizeCount(secondary.emailCoverage, 0),
      primaryDetail.emails.length
    );
    primary.profileCount = Math.max(
      1,
      normalizeCount(primary.profileCount, 1) + normalizeCount(secondary.profileCount, 1)
    );
    primary.customerValue =
      normalizeCount(primary.customerValue, 0) + normalizeCount(secondary.customerValue, 0);
    primary.totalConversations =
      normalizeCount(primary.totalConversations, 0) +
      normalizeCount(secondary.totalConversations, 0);
    primary.totalMessages =
      normalizeCount(primary.totalMessages, 0) + normalizeCount(secondary.totalMessages, 0);
    primary.duplicateCandidate = primaryDetail.emails.length > 1;

    customerState.mergedInto[resolvedSecondary] = primaryKey;
    profileCounts[primaryKey] = primary.profileCount;
    delete customerState.primaryEmailByKey[resolvedSecondary];
  });

  if (!customerState.primaryEmailByKey[primaryKey] && primaryDetail.emails[0]) {
    customerState.primaryEmailByKey[primaryKey] = primaryDetail.emails[0];
  }
}

function splitCustomerProfile(customerState, customerKey, emailToSplit) {
  const normalizedKey = resolveCustomerKey(customerState, customerKey);
  const normalizedEmail = normalizeEmail(emailToSplit);
  if (!normalizedKey || !normalizedEmail) return '';

  const directory = customerState.directory || {};
  const details = customerState.details || {};
  const profileCounts = customerState.profileCounts || {};
  const record = directory[normalizedKey];
  const detail = details[normalizedKey];
  if (!record || !detail) return '';

  const emails = normalizeStringArray(detail.emails, normalizeEmail).map(normalizeEmail);
  const splitAlias = emails.find((entry) => normalizeEmail(entry) === normalizedEmail);
  if (!splitAlias || emails.length < 2) return '';

  const remainingEmails = emails.filter((entry) => normalizeEmail(entry) !== normalizedEmail);
  const splitShare = Math.max(1, Math.round(normalizeCount(record.totalConversations, 1) / emails.length));
  const splitMessages = Math.max(1, Math.round(normalizeCount(record.totalMessages, 1) / emails.length));
  const splitLtv = Math.max(0, Math.round(normalizeCount(record.customerValue, 0) / emails.length));
  const rootName = splitAlias.split('@')[0] || record.name;
  const normalizedName = rootName
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

  detail.emails = remainingEmails;
  const currentPrimary = normalizeEmail(customerState.primaryEmailByKey[normalizedKey]);
  customerState.primaryEmailByKey[normalizedKey] =
    currentPrimary && remainingEmails.some((entry) => normalizeEmail(entry) === currentPrimary)
      ? currentPrimary
      : remainingEmails[0] || '';

  record.profileCount = Math.max(1, normalizeCount(record.profileCount, emails.length) - 1);
  record.emailCoverage = remainingEmails.length;
  record.totalConversations = Math.max(1, normalizeCount(record.totalConversations, 1) - splitShare);
  record.totalMessages = Math.max(1, normalizeCount(record.totalMessages, 1) - splitMessages);
  record.customerValue = Math.max(0, normalizeCount(record.customerValue, 0) - splitLtv);
  record.duplicateCandidate = remainingEmails.length > 1;
  profileCounts[normalizedKey] = record.profileCount;

  const newKeyBase = normalizeKey(normalizedName) || `${normalizedKey}_split`;
  let newKey = newKeyBase;
  let index = 2;
  while (directory[newKey]) {
    newKey = `${newKeyBase}_${index}`;
    index += 1;
  }

  directory[newKey] = {
    name: normalizedName || splitAlias,
    vip: false,
    emailCoverage: 1,
    duplicateCandidate: false,
    profileCount: 1,
    customerValue: splitLtv,
    totalConversations: splitShare,
    totalMessages: splitMessages,
  };
  details[newKey] = {
    emails: [splitAlias],
    phone: '',
    mailboxes: normalizeStringArray(detail.mailboxes, normalizeMailboxLabel).slice(0, 1),
  };
  customerState.primaryEmailByKey[newKey] = splitAlias;
  profileCounts[newKey] = 1;
  return newKey;
}

function setCustomerPrimaryEmail(customerState, customerKey, email) {
  const resolvedKey = resolveCustomerKey(customerState, customerKey);
  const normalizedEmail = normalizeEmail(email);
  if (!resolvedKey || !normalizedEmail) return false;
  const detail = customerState.details?.[resolvedKey];
  if (!detail) return false;
  const existingEmail = asArray(detail.emails).find(
    (entry) => normalizeEmail(entry) === normalizedEmail
  );
  if (!existingEmail) return false;
  customerState.primaryEmailByKey = customerState.primaryEmailByKey || {};
  customerState.primaryEmailByKey[resolvedKey] = existingEmail;
  return true;
}

function dismissCustomerSuggestion(customerState, suggestionId) {
  const normalizedId = normalizeSuggestionId(suggestionId);
  if (!normalizedId) return false;
  customerState.dismissedSuggestionIds = normalizeStringArray(
    [...asArray(customerState.dismissedSuggestionIds), normalizedId],
    normalizeSuggestionId
  );
  customerState.acceptedSuggestionIds = normalizeStringArray(
    asArray(customerState.acceptedSuggestionIds).filter(
      (entry) => normalizeSuggestionId(entry) !== normalizedId
    ),
    normalizeSuggestionId
  );
  return true;
}

function acceptCustomerSuggestion(customerState, suggestionId) {
  const normalizedId = normalizeSuggestionId(suggestionId);
  if (!normalizedId) return false;
  customerState.acceptedSuggestionIds = normalizeStringArray(
    [...asArray(customerState.acceptedSuggestionIds), normalizedId],
    normalizeSuggestionId
  );
  customerState.dismissedSuggestionIds = normalizeStringArray(
    asArray(customerState.dismissedSuggestionIds).filter(
      (entry) => normalizeSuggestionId(entry) !== normalizedId
    ),
    normalizeSuggestionId
  );
  return true;
}

function applyImportedRowToCustomerState(customerState, importedRow, options = {}) {
  const strictEmail = normalizeBoolean(options.strictEmail, false);
  const directory = customerState.directory || {};
  const details = customerState.details || {};
  const profileCounts = customerState.profileCounts || {};

  if (!importedRow.name && !importedRow.emails.length) {
    return {
      action: 'invalid',
      rowNumber: importedRow.rowNumber,
      message: 'Raden saknar namn och e-postadress.',
      targetKey: '',
      matchedKeys: [],
      input: {
        rowNumber: importedRow.rowNumber,
        name: importedRow.name,
        emails: [...importedRow.emails],
        phone: importedRow.phone,
        mailboxes: [...importedRow.mailboxes],
        vip: Boolean(importedRow.vip),
        customerValue: normalizeCount(importedRow.customerValue, 0),
        totalConversations: normalizeCount(importedRow.totalConversations, 0),
        totalMessages: normalizeCount(importedRow.totalMessages, 0),
      },
    };
  }

  const matchedKeys = findMatchingCustomerKeys(customerState, importedRow, { strictEmail });
  let action = 'create';
  let targetKey = '';

  if (matchedKeys.length) {
    targetKey = matchedKeys[0];
    action = matchedKeys.length > 1 ? 'merge' : 'update';
    if (matchedKeys.length > 1) {
      mergeCustomerProfiles(customerState, targetKey, matchedKeys.slice(1));
    }
  } else {
    const keyBase = importedRow.name || importedRow.emails[0] || `row_${importedRow.rowNumber}`;
    targetKey = buildCustomerKey(keyBase, customerState);
    directory[targetKey] = {
      name: importedRow.name || importedRow.emails[0] || targetKey,
      vip: Boolean(importedRow.vip),
      emailCoverage: importedRow.emails.length,
      duplicateCandidate: importedRow.emails.length > 1,
      profileCount: Math.max(1, importedRow.emails.length || 1),
      customerValue: normalizeCount(importedRow.customerValue, 0),
      totalConversations: normalizeCount(importedRow.totalConversations, 0),
      totalMessages: normalizeCount(importedRow.totalMessages, 0),
    };
    details[targetKey] = {
      emails: [...importedRow.emails],
      phone: importedRow.phone,
      mailboxes: [...importedRow.mailboxes],
    };
    profileCounts[targetKey] = directory[targetKey].profileCount;
    if (importedRow.emails[0]) {
      customerState.primaryEmailByKey[targetKey] = importedRow.emails[0];
    }
  }

  const record = directory[targetKey];
  const detail = details[targetKey];
  record.name = normalizeText(importedRow.name) || record.name || targetKey;
  record.vip = Boolean(record.vip || importedRow.vip);
  record.customerValue = Math.max(
    normalizeCount(record.customerValue, 0),
    normalizeCount(importedRow.customerValue, 0)
  );
  record.totalConversations = Math.max(
    normalizeCount(record.totalConversations, 0),
    normalizeCount(importedRow.totalConversations, 0)
  );
  record.totalMessages = Math.max(
    normalizeCount(record.totalMessages, 0),
    normalizeCount(importedRow.totalMessages, 0)
  );
  detail.emails = normalizeStringArray(
    [...asArray(detail.emails), ...asArray(importedRow.emails)],
    normalizeEmail
  ).map(normalizeEmail);
  detail.mailboxes = normalizeStringArray(
    [...asArray(detail.mailboxes), ...asArray(importedRow.mailboxes)],
    normalizeKey
  );
  if (!normalizeText(detail.phone) && normalizeText(importedRow.phone)) {
    detail.phone = importedRow.phone;
  }
  record.emailCoverage = Math.max(
    normalizeCount(record.emailCoverage, 0),
    detail.emails.length
  );
  record.profileCount = Math.max(
    1,
    normalizeCount(record.profileCount, 1),
    detail.emails.length || 1
  );
  record.duplicateCandidate = detail.emails.length > 1;
  profileCounts[targetKey] = record.profileCount;
  if (!customerState.primaryEmailByKey[targetKey] && detail.emails[0]) {
    customerState.primaryEmailByKey[targetKey] = detail.emails[0];
  }

  const importName = importedRow.name || detail.emails[0] || targetKey;
  const message =
    action === 'create'
      ? `Skapar ${importName}.`
      : action === 'merge'
        ? `Slår ihop ${matchedKeys.length} profiler till ${record.name}.`
        : `Uppdaterar ${record.name}.`;

  return {
    action,
    rowNumber: importedRow.rowNumber,
    message,
    targetKey,
    matchedKeys,
    input: {
      rowNumber: importedRow.rowNumber,
      name: importedRow.name,
      emails: [...importedRow.emails],
      phone: importedRow.phone,
      mailboxes: [...importedRow.mailboxes],
      vip: Boolean(importedRow.vip),
      customerValue: normalizeCount(importedRow.customerValue, 0),
      totalConversations: normalizeCount(importedRow.totalConversations, 0),
      totalMessages: normalizeCount(importedRow.totalMessages, 0),
    },
    record: {
      name: record.name,
      emails: [...detail.emails],
      mailboxes: [...detail.mailboxes],
      vip: Boolean(record.vip),
      phone: normalizeText(detail.phone),
      customerValue: normalizeCount(record.customerValue, 0),
      totalConversations: normalizeCount(record.totalConversations, 0),
      totalMessages: normalizeCount(record.totalMessages, 0),
    },
  };
}

function buildImportSummary(previewRows = [], format = 'json', fileName = '') {
  const summary = {
    format,
    fileName: normalizeText(fileName),
    totalRows: previewRows.length,
    validRows: 0,
    created: 0,
    updated: 0,
    merged: 0,
    invalid: 0,
    rows: previewRows,
  };

  previewRows.forEach((row) => {
    if (row.action === 'create') summary.created += 1;
    else if (row.action === 'update') summary.updated += 1;
    else if (row.action === 'merge') summary.merged += 1;
    else summary.invalid += 1;
  });
  summary.validRows = summary.created + summary.updated + summary.merged;
  return summary;
}

function planCustomerImport({
  customerState,
  importText,
  rows,
  binaryBase64 = '',
  fileName,
  defaultMailboxId = '',
}) {
  const baseState = cloneCustomerState(customerState);
  const { format, rows: parsedRows } = parseCustomerImportRows({
    text: importText,
    rows,
    binaryBase64,
    fileName,
    defaultMailboxId,
  });
  const strictEmail = normalizeBoolean(
    baseState.customerSettings?.strict_email,
    DEFAULT_CUSTOMER_SETTINGS.strict_email
  );
  const previewRows = parsedRows.map((row) =>
    applyImportedRowToCustomerState(baseState, row, { strictEmail })
  );
  const importSummary = buildImportSummary(previewRows, format, fileName);
  return {
    customerState: normalizeCustomerState(baseState),
    importSummary,
  };
}

function buildDefaultCustomerState() {
  return {
    mergedInto: {},
    dismissedSuggestionIds: [],
    acceptedSuggestionIds: [],
    directory: {},
    details: {},
    profileCounts: {},
    primaryEmailByKey: {},
    customerSettings: { ...DEFAULT_CUSTOMER_SETTINGS },
    updatedAt: nowIso(),
  };
}

function normalizeCustomerState(input = {}) {
  const defaults = buildDefaultCustomerState();
  return {
    mergedInto: normalizeLookup(input.mergedInto, normalizeKey),
    dismissedSuggestionIds: normalizeStringArray(input.dismissedSuggestionIds, normalizeSuggestionId),
    acceptedSuggestionIds: normalizeStringArray(input.acceptedSuggestionIds, normalizeSuggestionId),
    directory: Object.keys(input.directory || {}).length
      ? normalizeDirectory(input.directory)
      : defaults.directory,
    details: Object.keys(input.details || {}).length ? normalizeDetails(input.details) : defaults.details,
    profileCounts: Object.keys(input.profileCounts || {}).length
      ? normalizeProfileCounts(input.profileCounts)
      : defaults.profileCounts,
    primaryEmailByKey: normalizeLookup(
      input.primaryEmailByKey,
      (value) => normalizeText(value).toLowerCase()
    ),
    customerSettings: normalizeCustomerSettings(input.customerSettings),
    updatedAt: normalizeText(input.updatedAt) || nowIso(),
  };
}

function syncDerivedCustomerState(customerState) {
  const next = normalizeCustomerState(customerState);
  const directory = next.directory || {};
  const details = next.details || {};
  const activeKeys = getActiveCustomerKeys(next);

  activeKeys.forEach((customerKey) => {
    const detail = details[customerKey] || { emails: [], phone: '', mailboxes: [] };
    details[customerKey] = {
      emails: normalizeStringArray(detail.emails, normalizeEmail).map(normalizeEmail),
      phone: normalizeText(detail.phone),
      mailboxes: normalizeStringArray(detail.mailboxes, normalizeMailboxLabel),
    };

    const directoryEntry = directory[customerKey] || {
      name: customerKey,
      vip: false,
      emailCoverage: 0,
      duplicateCandidate: false,
      profileCount: 1,
      customerValue: 0,
      totalConversations: 0,
      totalMessages: 0,
    };
    directory[customerKey] = directoryEntry;
    directoryEntry.name = normalizeText(directoryEntry.name) || details[customerKey].emails[0] || customerKey;
    directoryEntry.emailCoverage = Math.max(
      normalizeCount(directoryEntry.emailCoverage, 0),
      details[customerKey].emails.length
    );
    directoryEntry.profileCount = Math.max(
      1,
      normalizeCount(directoryEntry.profileCount, 1),
      details[customerKey].emails.length || 1
    );
    directoryEntry.duplicateCandidate = Boolean(
      directoryEntry.duplicateCandidate || details[customerKey].emails.length > 1
    );

    const preferredPrimary = normalizeEmail(next.primaryEmailByKey[customerKey]);
    if (
      preferredPrimary &&
      details[customerKey].emails.some((email) => normalizeEmail(email) === preferredPrimary)
    ) {
      next.primaryEmailByKey[customerKey] = preferredPrimary;
    } else if (details[customerKey].emails[0]) {
      next.primaryEmailByKey[customerKey] = details[customerKey].emails[0];
    } else {
      delete next.primaryEmailByKey[customerKey];
    }
    next.profileCounts[customerKey] = directoryEntry.profileCount;
  });

  return next;
}

function createIdentityRecord(customerState, customerKey) {
  const resolvedKey = resolveCustomerKey(customerState, customerKey);
  const directoryEntry = customerState.directory?.[resolvedKey] || {};
  const detailEntry = customerState.details?.[resolvedKey] || {};
  return {
    key: resolvedKey,
    name: normalizeText(directoryEntry.name),
    emails: normalizeStringArray(detailEntry.emails, normalizeEmail).map(normalizeEmail),
    phone: normalizePhone(detailEntry.phone),
    mailboxes: normalizeStringArray(detailEntry.mailboxes, normalizeMailboxLabel),
    profileCount: Math.max(
      1,
      normalizeCount(customerState.profileCounts?.[resolvedKey], normalizeCount(directoryEntry.profileCount, 1))
    ),
  };
}

function evaluateCustomerIdentityLink(primaryRecord, secondaryRecord) {
  const reasons = [];
  let confidence = 0;

  const primaryNameSignature = normalizeNameSignature(primaryRecord.name);
  const secondaryNameSignature = normalizeNameSignature(secondaryRecord.name);
  const primaryNameTokens = getNameTokens(primaryRecord.name);
  const secondaryNameTokens = getNameTokens(secondaryRecord.name);
  const sharedNameTokens = primaryNameTokens.filter((token) => secondaryNameTokens.includes(token));
  const sharedPhone =
    normalizePhone(primaryRecord.phone) &&
    normalizePhone(primaryRecord.phone) === normalizePhone(secondaryRecord.phone);
  const sharedEmails = primaryRecord.emails.filter((email) =>
    secondaryRecord.emails.some((candidate) => normalizeEmail(candidate) === normalizeEmail(email))
  );
  const primaryLocalParts = normalizeStringArray(primaryRecord.emails, getEmailLocalPart).filter(Boolean);
  const secondaryLocalParts = normalizeStringArray(secondaryRecord.emails, getEmailLocalPart).filter(Boolean);
  const sharedLocalParts = primaryLocalParts.filter((part) => secondaryLocalParts.includes(part));
  const sharedMailboxes = primaryRecord.mailboxes.filter((mailbox) =>
    secondaryRecord.mailboxes.some((candidate) => normalizeMailboxLabel(candidate) === normalizeMailboxLabel(mailbox))
  );
  const mailboxCoverage = normalizeStringArray(
    [...primaryRecord.mailboxes, ...secondaryRecord.mailboxes],
    normalizeMailboxLabel
  );
  const exactName = primaryNameSignature && primaryNameSignature === secondaryNameSignature;
  const likelySamePersonAlias =
    sharedLocalParts.length > 0 &&
    (!sharedEmails.length || sharedLocalParts[0] !== sharedEmails[0].split('@')[0].split('+')[0]);

  if (sharedEmails.length) {
    reasons.push(`Delad kundadress: ${sharedEmails[0]}`);
    confidence += 60;
  }
  if (sharedPhone) {
    reasons.push('Samma telefonnummer');
    confidence += 42;
  }
  if (exactName) {
    reasons.push('Samma kundnamn');
    confidence += 26;
  } else if (sharedNameTokens.length >= 2) {
    reasons.push('Liknande namn');
    confidence += 14;
  }
  if (sharedLocalParts.length) {
    reasons.push(`Liknande mejlalias: ${sharedLocalParts[0]}`);
    confidence += 20;
  }
  if (sharedMailboxes.length) {
    reasons.push(`Samma inboxspår: ${sharedMailboxes[0]}`);
    confidence += 10;
  }
  if (mailboxCoverage.length > 1 && (sharedEmails.length || sharedPhone || exactName)) {
    reasons.push('Aktiv över flera inboxar');
    confidence += 8;
  }
  if (exactName && sharedPhone) confidence += 18;
  if (exactName && likelySamePersonAlias) confidence += 20;
  if (sharedEmails.length && mailboxCoverage.length > 1) confidence += 10;
  if (sharedNameTokens.length >= 2 && sharedLocalParts.length) confidence += 8;

  return {
    confidence,
    reasons: normalizeStringArray(reasons, normalizeText).slice(0, 4),
  };
}

function buildCustomerIdentitySuggestions(customerState) {
  const nextState = syncDerivedCustomerState(customerState);
  const activeKeys = getActiveCustomerKeys(nextState);
  const groups = Object.fromEntries(activeKeys.map((key) => [key, []]));

  activeKeys.forEach((customerKey) => {
    if (nextState.directory[customerKey]) {
      nextState.directory[customerKey].duplicateCandidate = Boolean(
        nextState.details?.[customerKey]?.emails?.length > 1
      );
    }
  });

  for (let index = 0; index < activeKeys.length; index += 1) {
    for (let compareIndex = index + 1; compareIndex < activeKeys.length; compareIndex += 1) {
      const primaryKey = activeKeys[index];
      const secondaryKey = activeKeys[compareIndex];
      const primaryRecord = createIdentityRecord(nextState, primaryKey);
      const secondaryRecord = createIdentityRecord(nextState, secondaryKey);
      const identityEvidence = evaluateCustomerIdentityLink(primaryRecord, secondaryRecord);
      if (!identityEvidence.reasons.length || identityEvidence.confidence < 68) continue;

      const pairId = normalizeSuggestionId(`${primaryKey}::${secondaryKey}`);
      const suggestionPayload = {
        id: pairId,
        pairId,
        confidence: Math.min(98, identityEvidence.confidence),
        reasons: identityEvidence.reasons,
      };
      groups[primaryKey].push({
        ...suggestionPayload,
        primaryKey,
        secondaryKey,
        name: secondaryRecord.name || secondaryKey,
      });
      groups[secondaryKey].push({
        ...suggestionPayload,
        primaryKey: secondaryKey,
        secondaryKey: primaryKey,
        name: primaryRecord.name || primaryKey,
      });
      nextState.directory[primaryKey].duplicateCandidate = true;
      nextState.directory[secondaryKey].duplicateCandidate = true;
    }
  }

  const duplicateCount = Object.values(groups).reduce((count, items) => count + asArray(items).length, 0) / 2;
  return {
    customerState: nextState,
    suggestionGroups: groups,
    duplicateCount: Math.max(0, Math.round(duplicateCount)),
  };
}

function findCustomerKeyByEmails(customerState, emails = []) {
  const normalizedEmails = normalizeStringArray(emails, normalizeEmail).map(normalizeEmail);
  if (!normalizedEmails.length) return '';
  const activeKeys = getActiveCustomerKeys(customerState);
  for (const customerKey of activeKeys) {
    const detail = customerState.details?.[resolveCustomerKey(customerState, customerKey)];
    if (!detail) continue;
    const existingEmails = normalizeStringArray(detail.emails, normalizeEmail).map(normalizeEmail);
    if (
      normalizedEmails.some((email) =>
        existingEmails.some((candidate) => normalizeEmail(candidate) === normalizeEmail(email))
      )
    ) {
      return resolveCustomerKey(customerState, customerKey);
    }
  }
  return '';
}

function mergeHistoryProfilesIntoCustomerState(customerState, historyProfiles = []) {
  const nextState = syncDerivedCustomerState(customerState);
  const directory = nextState.directory || {};
  const details = nextState.details || {};
  const profileCounts = nextState.profileCounts || {};
  nextState.primaryEmailByKey = nextState.primaryEmailByKey || {};

  asArray(historyProfiles).forEach((profile) => {
    const emails = normalizeStringArray(profile.emails, normalizeEmail).map(normalizeEmail);
    if (!emails.length) return;

    const matchedKey = findCustomerKeyByEmails(nextState, emails);
    const targetKey = matchedKey || buildCustomerKey(profile.customerEmail || emails[0], nextState);
    if (!directory[targetKey]) {
      directory[targetKey] = {
        name: normalizeText(profile.name) || emails[0],
        vip: false,
        emailCoverage: 0,
        duplicateCandidate: false,
        profileCount: Math.max(1, emails.length),
        customerValue: 0,
        totalConversations: 0,
        totalMessages: 0,
      };
    }
    if (!details[targetKey]) {
      details[targetKey] = {
        emails: [],
        phone: '',
        mailboxes: [],
      };
    }

    const detail = details[targetKey];
    detail.emails = normalizeStringArray([...asArray(detail.emails), ...emails], normalizeEmail).map(
      normalizeEmail
    );
    detail.mailboxes = normalizeStringArray(
      [
        ...asArray(detail.mailboxes),
        ...asArray(profile.mailboxes).map((mailboxId) =>
          normalizeMailboxLabel(deriveMailboxLabel(mailboxId) || mailboxId)
        ),
      ],
      normalizeMailboxLabel
    );

    const directoryEntry = directory[targetKey];
    const displayName = normalizeText(profile.name);
    if (!normalizeText(directoryEntry.name) || normalizeText(directoryEntry.name) === targetKey) {
      directoryEntry.name = displayName || detail.emails[0] || targetKey;
    }
    directoryEntry.emailCoverage = Math.max(
      normalizeCount(directoryEntry.emailCoverage, 0),
      detail.emails.length
    );
    directoryEntry.profileCount = Math.max(
      1,
      normalizeCount(directoryEntry.profileCount, 1),
      normalizeCount(profile.profileCount, emails.length || 1),
      detail.emails.length || 1
    );
    directoryEntry.totalConversations = Math.max(
      normalizeCount(directoryEntry.totalConversations, 0),
      normalizeCount(profile.totalConversations, 0)
    );
    directoryEntry.totalMessages = Math.max(
      normalizeCount(directoryEntry.totalMessages, 0),
      normalizeCount(profile.totalMessages, 0)
    );
    directoryEntry.duplicateCandidate = detail.emails.length > 1;
    profileCounts[targetKey] = directoryEntry.profileCount;

    if (!nextState.primaryEmailByKey[targetKey] && detail.emails[0]) {
      nextState.primaryEmailByKey[targetKey] = detail.emails[0];
    }
  });

  return syncDerivedCustomerState(nextState);
}

async function createCcoCustomerStore({ filePath, historyStore = null }) {
  if (!normalizeText(filePath)) {
    throw new Error('filePath krävs för ccoCustomerStore.');
  }

  let state = await readJson(filePath, emptyState());
  state = {
    ...emptyState(),
    ...(state && typeof state === 'object' ? state : {}),
    tenants:
      state && typeof state.tenants === 'object' && state.tenants ? state.tenants : {},
  };

  async function save() {
    state.updatedAt = nowIso();
    await writeJsonAtomic(filePath, state);
  }

  async function materializeTenantCustomerState({
    tenantId,
    customerState = null,
  }) {
    const tenantState = ensureTenantState(tenantId);
    const baseState =
      customerState && typeof customerState === 'object'
        ? syncDerivedCustomerState(customerState)
        : syncDerivedCustomerState(tenantState.customerState);

    if (!historyStore || typeof historyStore.listDerivedCustomerProfiles !== 'function') {
      return buildCustomerIdentitySuggestions(baseState).customerState;
    }

    const historyProfiles = await historyStore.listDerivedCustomerProfiles({
      tenantId,
    });
    return buildCustomerIdentitySuggestions(
      mergeHistoryProfilesIntoCustomerState(baseState, historyProfiles)
    ).customerState;
  }

  function ensureTenantState(tenantId) {
    const normalizedTenantId = normalizeText(tenantId);
    if (!normalizedTenantId) {
      throw new Error('tenantId krävs.');
    }
    if (!state.tenants[normalizedTenantId]) {
      state.tenants[normalizedTenantId] = {
        customerState: buildDefaultCustomerState(),
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
    }
    const tenantState = state.tenants[normalizedTenantId];
    tenantState.customerState = normalizeCustomerState(tenantState.customerState);
    return tenantState;
  }

  async function getTenantCustomerState({ tenantId }) {
    const customerState = await materializeTenantCustomerState({ tenantId });
    return JSON.parse(JSON.stringify(customerState));
  }

  async function previewTenantCustomerIdentity({ tenantId, customerState = null }) {
    const baseState = await materializeTenantCustomerState({ tenantId, customerState });
    const payload = buildCustomerIdentitySuggestions(baseState);
    return JSON.parse(JSON.stringify(payload));
  }

  async function saveTenantCustomerState({ tenantId, customerState }) {
    const tenantState = ensureTenantState(tenantId);
    tenantState.customerState = await materializeTenantCustomerState({
      tenantId,
      customerState,
    });
    tenantState.updatedAt = nowIso();
    await save();
    return JSON.parse(JSON.stringify(tenantState.customerState));
  }

  async function previewTenantCustomerImport({
    tenantId,
    importText,
    rows = null,
    binaryBase64 = '',
    fileName,
    defaultMailboxId = '',
  }) {
    const planned = planCustomerImport({
      customerState: await materializeTenantCustomerState({ tenantId }),
      importText,
      rows,
      binaryBase64,
      fileName,
      defaultMailboxId,
    });
    return JSON.parse(JSON.stringify(planned.importSummary));
  }

  async function commitTenantCustomerImport({
    tenantId,
    importText,
    rows = null,
    binaryBase64 = '',
    fileName,
    defaultMailboxId = '',
  }) {
    const tenantState = ensureTenantState(tenantId);
    const planned = planCustomerImport({
      customerState: await materializeTenantCustomerState({ tenantId }),
      importText,
      rows,
      binaryBase64,
      fileName,
      defaultMailboxId,
    });
    if (!planned.importSummary.validRows) {
      return {
        customerState: JSON.parse(JSON.stringify(tenantState.customerState)),
        importSummary: JSON.parse(JSON.stringify(planned.importSummary)),
      };
    }
    tenantState.customerState = buildCustomerIdentitySuggestions(planned.customerState).customerState;
    tenantState.updatedAt = nowIso();
    await save();
    return {
      customerState: JSON.parse(JSON.stringify(tenantState.customerState)),
      importSummary: JSON.parse(JSON.stringify(planned.importSummary)),
    };
  }

  async function mergeTenantCustomerProfiles({
    tenantId,
    customerState = null,
    primaryKey,
    secondaryKeys,
    suggestionId = '',
    options = {},
  }) {
    const tenantState = ensureTenantState(tenantId);
    const nextState = await materializeTenantCustomerState({ tenantId, customerState });
    const resolvedPrimary = resolveCustomerKey(nextState, primaryKey);
    const resolvedSecondaryKeys = asArray(secondaryKeys)
      .map((entry) => resolveCustomerKey(nextState, entry))
      .filter((entry) => entry && entry !== resolvedPrimary);
    if (!resolvedPrimary || !resolvedSecondaryKeys.length) {
      throw new Error('Minst två kundprofiler krävs för att slå ihop.');
    }
    mergeCustomerProfiles(nextState, resolvedPrimary, resolvedSecondaryKeys, options);
    acceptCustomerSuggestion(nextState, suggestionId || `${resolvedPrimary}::${resolvedSecondaryKeys[0]}`);
    const payload = buildCustomerIdentitySuggestions(nextState);
    tenantState.customerState = payload.customerState;
    tenantState.updatedAt = nowIso();
    await save();
    return JSON.parse(JSON.stringify(payload));
  }

  async function splitTenantCustomerProfile({
    tenantId,
    customerState = null,
    customerKey,
    email,
  }) {
    const tenantState = ensureTenantState(tenantId);
    const nextState = await materializeTenantCustomerState({ tenantId, customerState });
    const newKey = splitCustomerProfile(nextState, customerKey, email);
    if (!newKey) {
      throw new Error('Kunde inte dela upp kundprofilen.');
    }
    const payload = buildCustomerIdentitySuggestions(nextState);
    tenantState.customerState = payload.customerState;
    tenantState.updatedAt = nowIso();
    await save();
    return JSON.parse(JSON.stringify({ ...payload, newKey }));
  }

  async function setTenantCustomerPrimaryEmail({
    tenantId,
    customerState = null,
    customerKey,
    email,
  }) {
    const tenantState = ensureTenantState(tenantId);
    const nextState = await materializeTenantCustomerState({ tenantId, customerState });
    if (!setCustomerPrimaryEmail(nextState, customerKey, email)) {
      throw new Error('Kunde inte sätta primär e-post.');
    }
    const payload = buildCustomerIdentitySuggestions(nextState);
    tenantState.customerState = payload.customerState;
    tenantState.updatedAt = nowIso();
    await save();
    return JSON.parse(JSON.stringify(payload));
  }

  async function dismissTenantCustomerSuggestion({
    tenantId,
    customerState = null,
    suggestionId,
  }) {
    const tenantState = ensureTenantState(tenantId);
    const nextState = await materializeTenantCustomerState({ tenantId, customerState });
    if (!dismissCustomerSuggestion(nextState, suggestionId)) {
      throw new Error('Förslaget kunde inte markeras.');
    }
    const payload = buildCustomerIdentitySuggestions(nextState);
    tenantState.customerState = payload.customerState;
    tenantState.updatedAt = nowIso();
    await save();
    return JSON.parse(JSON.stringify(payload));
  }

  return {
    getTenantCustomerState,
    previewTenantCustomerIdentity,
    saveTenantCustomerState,
    previewTenantCustomerImport,
    commitTenantCustomerImport,
    mergeTenantCustomerProfiles,
    splitTenantCustomerProfile,
    setTenantCustomerPrimaryEmail,
    dismissTenantCustomerSuggestion,
  };
}

module.exports = {
  createCcoCustomerStore,
};
