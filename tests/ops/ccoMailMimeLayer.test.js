const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildCanonicalMailMimeMetadata,
  getMailMimeTriggerReasons,
} = require('../../src/ops/ccoMailMimeLayer');

test('getMailMimeTriggerReasons markerar structured high-risk html', () => {
  const reasons = getMailMimeTriggerReasons({
    hasAttachments: true,
    bodyHtml:
      '<table><tr><td><img src="cid:logo@cid" alt="Logo" /></td></tr></table><div style="padding:12px">Footer</div>',
  });

  assert.deepEqual(reasons, [
    'tabular_html',
    'html_images',
    'inline_cid_reference',
    'rich_layout_html',
    'attachment_backed_html',
  ]);
});

test('buildCanonicalMailMimeMetadata bygger phase_b-metadata med canonical body och assets fran raw MIME', () => {
  const mime = buildCanonicalMailMimeMetadata({
    rawMime: [
      'MIME-Version: 1.0',
      'Content-Type: multipart/related; boundary="abc"',
      '',
      '--abc',
      'Content-Type: text/html; charset=utf-8',
      '',
      '<html><body><img src="cid:logo@cid"><table><tr><td>Hair TP Clinic</td></tr></table></body></html>',
      '--abc',
      'Content-Type: image/png; name="logo.png"',
      'Content-Disposition: inline; filename="logo.png"',
      'Content-ID: <logo@cid>',
      'Content-Transfer-Encoding: base64',
      '',
      'QUJDRA==',
      '--abc--',
    ].join('\r\n'),
    contentType: 'message/rfc822',
    fetchState: 'fetched',
    triggerReasons: ['inline_cid_reference', 'rich_layout_html'],
  });

  assert.equal(mime.version, 'phase_b');
  assert.equal(mime.available, true);
  assert.equal(mime.mimeBacked, true);
  assert.equal(mime.contentType, 'message/rfc822');
  assert.equal(mime.fetchState, 'fetched');
  assert.deepEqual(mime.triggerReasons, ['inline_cid_reference', 'rich_layout_html']);
  assert.equal(mime.signals.hasMimeVersion, true);
  assert.equal(mime.signals.hasMultipart, true);
  assert.equal(mime.signals.hasTextHtmlPart, true);
  assert.equal(mime.signals.hasInlineCidReferences, true);
  assert.equal(mime.signals.hasInlineDisposition, true);
  assert.equal(mime.parsed.preferredBodyKind, 'html');
  assert.match(String(mime.parsed.body.preferredHtml || ''), /Hair TP Clinic/);
  assert.equal(mime.parsed.assets.inlineAssets.length, 1);
  assert.equal(mime.parsed.assets.attachments.length, 0);
  assert.equal(mime.parsed.assets.inlineAssets[0].referencedInPreferredHtml, true);
  assert.equal(mime.parsed.diagnostics.inlineAssetCount, 1);
});
