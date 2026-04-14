const test = require('node:test');
const assert = require('node:assert/strict');

const { buildCanonicalMailContentSections } = require('../../src/ops/ccoMailContentParser');

test('buildCanonicalMailContentSections sectionerar html till primary, signature, quoted och system', () => {
  const sections = buildCanonicalMailContentSections({
    primaryBodyHtml: `
      <div>Du får inte ofta e-post från patient@example.com.</div>
      <div>Hej Exona,</div>
      <div>Kan vi boka om till fredag?</div>
      <div>Med vänlig hälsning</div>
      <table role="presentation"><tr><td><img src="https://example.com/logo.png" alt="Logo" width="94" /></td><td>Vincent<br />vincent@example.com</td></tr></table>
      <div>Från: Contact &lt;contact@hairtpclinic.com&gt;</div>
      <div>Datum: 2026-04-07</div>
      <div>Till: Vincent &lt;vincent@example.com&gt;</div>
      <div>Ämne: Sv: Ombokning</div>
    `,
    sourceText:
      'Du får inte ofta e-post från patient@example.com. Hej Exona, Kan vi boka om till fredag? Med vänlig hälsning Vincent Från: Contact <contact@hairtpclinic.com>',
  });

  assert.equal(sections.mode, 'html_structured');
  assert.equal(sections.diagnostics.htmlSectioned, true);
  assert.match(sections.primaryBody.text, /Kan vi boka om till fredag/i);
  assert.match(sections.primaryBody.html, /Hej Exona/i);
  assert.doesNotMatch(sections.primaryBody.html, /Från:\s*Contact/i);
  assert.ok(sections.signatureBlock);
  assert.match(sections.signatureBlock.text, /Med vänlig hälsning/i);
  assert.match(sections.signatureBlock.html, /<table\b/i);
  assert.equal(sections.signatureBlock.truth.confidence, 'high');
  assert.equal(sections.signatureBlock.truth.visibleInReadSurface, false);
  assert.equal(sections.diagnostics.signatureConfidence, 'high');
  assert.equal(sections.diagnostics.signatureVisibleInReadSurface, false);
  assert.equal(sections.quotedBlocks.length, 1);
  assert.match(sections.quotedBlocks[0].text, /Från:\s*Contact/i);
  assert.match(sections.quotedBlocks[0].html, /Ämne:\s*Sv: Ombokning/i);
  assert.equal(sections.systemBlocks.length, 1);
  assert.match(sections.systemBlocks[0].text, /Du får inte ofta e-post/i);
});

test('buildCanonicalMailContentSections faller tillbaka till textsektionering när html saknas', () => {
  const sections = buildCanonicalMailContentSections({
    primaryBodyHtml: '',
    sourceText:
      'Hej Exona,\nKan vi boka om till fredag?\n\nMed vänlig hälsning\nVincent\n\nFrån: Contact <contact@hairtpclinic.com>',
  });

  assert.equal(sections.mode, 'text_fallback');
  assert.match(sections.primaryBody.text, /Kan vi boka om till fredag/i);
  assert.equal(sections.primaryBody.html, null);
  assert.match(sections.signatureBlock.text, /Med vänlig hälsning/i);
  assert.equal(sections.signatureBlock.truth.confidence, 'high');
  assert.equal(sections.signatureBlock.truth.visibleInReadSurface, true);
  assert.equal(sections.diagnostics.signatureConfidence, 'high');
  assert.equal(sections.diagnostics.signatureVisibleInReadSurface, true);
  assert.match(sections.quotedBlocks[0].text, /Från:\s*Contact/i);
});

test('buildCanonicalMailContentSections håller Hair TP-signaturer synliga i read-surface trots layouttung html', () => {
  const sections = buildCanonicalMailContentSections({
    primaryBodyHtml: `
      <div>Hej Egzona,</div>
      <div>Detta är ett kontrollerat live signaturtest.</div>
      <div>Bästa hälsningar</div>
      <table role="presentation">
        <tr>
          <td><img src="https://arcana.hairtpclinic.se/assets/hair-tp-clinic/hairtpclinic-mark-light.svg" alt="Hair TP Clinic" width="68" /></td>
          <td>
            Hair TP Clinic<br />
            Hårspecialist I Hårtransplantationer &amp; PRP-injektioner<br />
            031-88 11 66<br />
            fazli@hairtpclinic.com<br />
            Vasaplatsen 2, 411 34 Göteborg
          </td>
        </tr>
      </table>
    `,
    sourceText:
      'Hej Egzona. Detta är ett kontrollerat live signaturtest. Bästa hälsningar Fazli Krasniqi Hårspecialist I Hårtransplantationer & PRP-injektioner 031-88 11 66 fazli@hairtpclinic.com Vasaplatsen 2, 411 34 Göteborg',
  });

  assert.ok(sections.signatureBlock);
  assert.equal(sections.signatureBlock.truth.confidence, 'high');
  assert.equal(sections.signatureBlock.truth.visibleInReadSurface, true);
  assert.equal(sections.diagnostics.signatureVisibleInReadSurface, true);
});
