const test = require('node:test');
const assert = require('node:assert/strict');

const { buildCanonicalMailThreadDocument } = require('../../src/ops/ccoMailThreadHydrator');

test('buildCanonicalMailThreadDocument separerar primary body, signature, quoted och system blocks', () => {
  const threadDocument = buildCanonicalMailThreadDocument(
    [
      {
        messageId: 'msg-phase3-1',
        conversationId: 'conv-phase3-1',
        mailDocument: {
          messageId: 'msg-phase3-1',
          conversationId: 'conv-phase3-1',
          mailboxId: 'contact@hairtpclinic.com',
          subject: 'Sv: Ombokning',
          direction: 'inbound',
          sentAt: '2026-04-08T10:00:00.000Z',
          previewText: 'Kort preview',
          primaryBodyText:
            "Du får inte ofta e-post från patient@example.com. Hej Exona,\nKan vi boka om till fredag?\n\nMed vänlig hälsning\nVincent\n\nFrån: Contact <contact@hairtpclinic.com>\nDatum: 2026-04-07\nTill: Vincent <vincent@example.com>\nÄmne: Sv: Ombokning",
          primaryBodyHtml:
            '<div>Hej Exona,<br>Kan vi boka om till fredag?</div><div>Med vänlig hälsning<br>Vincent</div>',
          attachments: [],
          inlineAssets: [],
          assetRegistry: {},
          sourceDepth: 'mime',
          mimeAvailable: true,
          mimeBacked: true,
          mime: {
            version: 'phase_b',
            kind: 'mail_mime_metadata',
            source: 'graph_message_mime',
            fetchState: 'fetched',
            available: true,
            mimeBacked: true,
            contentType: 'message/rfc822',
            triggerReasons: ['rich_layout_html'],
            sizeBytes: 2048,
            signals: {
              hasMimeVersion: true,
              hasMultipart: true,
              hasTextHtmlPart: true,
              hasTextPlainPart: true,
              hasInlineCidReferences: false,
              hasInlineDisposition: false,
              hasAttachmentDisposition: false,
            },
            parsed: {
              preferredBodyKind: 'html',
              body: {
                preferredHtml:
                  '<div>Hej Exona,<br>Kan vi boka om till fredag?</div><div>Med vänlig hälsning<br>Vincent</div>',
                preferredText:
                  'Hej Exona,\nKan vi boka om till fredag?\n\nMed vänlig hälsning\nVincent',
                htmlPartId: '1.1',
                textPartId: '1.2',
              },
              assets: {
                inlineAssets: [],
                attachments: [],
                htmlCidReferences: [],
              },
              diagnostics: {
                partCount: 2,
                htmlPartCount: 1,
                textPartCount: 1,
                inlineAssetCount: 0,
                attachmentCount: 0,
              },
            },
          },
        },
      },
    ],
    {
      sourceStore: 'mailbox_truth_store',
      conversationId: 'conv-phase3-1',
      customerEmail: 'vincent@example.com',
    }
  );

  assert.equal(threadDocument.version, 'phase_3');
  assert.equal(threadDocument.kind, 'mail_thread_document');
  assert.equal(threadDocument.messageCount, 1);
  assert.equal(threadDocument.hasQuotedContent, true);
  assert.equal(threadDocument.hasSignatureBlocks, true);
  assert.equal(threadDocument.hasSystemBlocks, true);
  assert.equal(threadDocument.hasMimeBackedMessages, true);
  assert.equal(threadDocument.messages.length, 1);
  assert.equal(threadDocument.messages[0].contentSections.mode, 'html_structured');
  assert.equal(threadDocument.messages[0].contentSections.source, 'mime_backed');
  assert.equal(threadDocument.messages[0].contentSections.mimePreferredBodyKind, 'html');
  assert.equal(threadDocument.messages[0].sourceDepth, 'mime');
  assert.equal(threadDocument.messages[0].mimeBacked, true);
  assert.match(threadDocument.messages[0].primaryBody.text, /Kan vi boka om till fredag/i);
  assert.doesNotMatch(threadDocument.messages[0].primaryBody.text, /Du får inte ofta e-post/i);
  assert.match(threadDocument.messages[0].primaryBody.html, /Hej Exona/i);
  assert.match(threadDocument.messages[0].signatureBlock.text, /Med vänlig hälsning/i);
  assert.match(threadDocument.messages[0].signatureBlock.html, /<div>Med vänlig hälsning/i);
  assert.equal(threadDocument.messages[0].signatureBlock.truth.confidence, 'high');
  assert.equal(threadDocument.messages[0].signatureBlock.truth.visibleInReadSurface, true);
  assert.equal(threadDocument.messages[0].contentSections.diagnostics.signatureConfidence, 'high');
  assert.equal(
    threadDocument.messages[0].contentSections.diagnostics.signatureVisibleInReadSurface,
    true
  );
  assert.match(threadDocument.messages[0].quotedBlocks[0].text, /Från:\s*Contact/i);
  assert.match(threadDocument.messages[0].systemBlocks[0].text, /Du får inte ofta e-post/i);
  assert.match(threadDocument.messages[0].presentation.conversationText, /Vincent/i);
  assert.equal(threadDocument.messages[0].assets.mimeInlineAssetCount, 0);
});

test('buildCanonicalMailThreadDocument foredrar sektionerad canonical conversationHtml for MIME-backed mail', () => {
  const threadDocument = buildCanonicalMailThreadDocument(
    [
      {
        messageId: 'msg-phasec-1',
        conversationId: 'conv-phasec-1',
        mailDocument: {
          messageId: 'msg-phasec-1',
          conversationId: 'conv-phasec-1',
          mailboxId: 'contact@hairtpclinic.com',
          subject: 'Sv: Bokning',
          direction: 'inbound',
          sentAt: '2026-04-08T12:00:00.000Z',
          previewText: 'Preview',
          primaryBodyText:
            'Hej Egzona,\nKan vi boka om till fredag?\n\nMed vänlig hälsning\nVincent\n\nFrån: Contact <contact@hairtpclinic.com>',
          primaryBodyHtml:
            '<div>Hej Egzona,<br>Kan vi boka om till fredag?</div><div>Med vänlig hälsning<br>Vincent</div><blockquote><div>Från: Contact &lt;contact@hairtpclinic.com&gt;</div></blockquote>',
          attachments: [],
          inlineAssets: [],
          assetRegistry: {},
          sourceDepth: 'mime',
          fidelity: {
            mimePreferredBodyKind: 'html',
          },
          mime: {
            available: true,
            mimeBacked: true,
            parsed: {
              preferredBodyKind: 'html',
            },
          },
        },
      },
    ],
    {
      sourceStore: 'mailbox_truth_store',
      conversationId: 'conv-phasec-1',
      customerEmail: 'vincent@example.com',
    }
  );

  assert.match(threadDocument.messages[0].presentation.conversationHtml, /Kan vi boka om till fredag/i);
  assert.doesNotMatch(
    threadDocument.messages[0].presentation.conversationHtml,
    /Från:\s*Contact/i
  );
  assert.equal(threadDocument.messages[0].contentSections.source, 'mime_backed');
});

test('buildCanonicalMailThreadDocument bär canonical assetfamiljer vidare i mailThreadMessage assets', () => {
  const threadDocument = buildCanonicalMailThreadDocument(
    [
      {
        messageId: 'msg-asset-1',
        conversationId: 'conv-asset-1',
        mailDocument: {
          messageId: 'msg-asset-1',
          conversationId: 'conv-asset-1',
          mailboxId: 'contact@hairtpclinic.com',
          subject: 'Bilagor och externa länkar',
          direction: 'inbound',
          sentAt: '2026-04-08T13:00:00.000Z',
          previewText: 'Se filerna',
          primaryBodyText: 'Se filerna i mailet.',
          primaryBodyHtml: '<div>Se filerna i mailet.</div>',
          attachments: [
            {
              assetId: 'att-asset-1',
              attachmentId: 'att-asset-1',
              disposition: 'attachment',
              family: 'attachment',
            },
          ],
          inlineAssets: [
            {
              assetId: 'inline-asset-1',
              disposition: 'inline',
              family: 'inline',
            },
            {
              assetId: 'external-asset-1',
              disposition: 'inline',
              family: 'external',
            },
          ],
          assetSummary: {
            assetCount: 3,
            familyCounts: {
              attachment: 1,
              inline: 1,
              external: 1,
            },
          },
          mime: {
            parsed: {
              assets: {
                inlineAssets: [{}, {}],
                attachments: [{}],
              },
            },
          },
        },
      },
    ],
    {
      sourceStore: 'mailbox_truth_store',
      conversationId: 'conv-asset-1',
      customerEmail: 'vincent@example.com',
    }
  );

  assert.equal(threadDocument.messages[0].assets.assetCount, 3);
  assert.deepEqual(threadDocument.messages[0].assets.familyCounts, {
    attachment: 1,
    inline: 1,
    external: 1,
  });
  assert.deepEqual(threadDocument.messages[0].assets.attachmentIds, ['att-asset-1']);
  assert.deepEqual(threadDocument.messages[0].assets.inlineAssetIds, [
    'inline-asset-1',
    'external-asset-1',
  ]);
  assert.equal(threadDocument.messages[0].assets.mimeInlineAssetCount, 2);
  assert.equal(threadDocument.messages[0].assets.mimeAttachmentCount, 1);
});
