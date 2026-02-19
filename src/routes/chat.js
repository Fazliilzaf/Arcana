const { buildClinicMessages } = require('../clinic/buildMessages');
const { maybeSummarizeConversation } = require('../memory/summarize');
const { runChatWithTools } = require('../openai/runChatWithTools');
const { redactForStorage } = require('../privacy/redact');

function buildPriceFallbackReply({ brand, message }) {
  const normalizedBrand = typeof brand === 'string' ? brand.trim().toLowerCase() : '';
  if (normalizedBrand !== 'hair-tp-clinic') return '';

  const q = String(message ?? '').toLowerCase();
  const isPriceIntent = /(pris|priser|kostnad|kostar|kosta|kr|sek|graft|dhi)/i.test(q);
  if (!isPriceIntent) return '';

  const normalizedQuery = q.replace(/(\d)\s+(\d{3})/g, '$1$2');

  const FUE = {
    1000: '42 000 kr/behandling',
    1500: '46 000 kr/behandling',
    2000: '50 000 kr/behandling',
    2500: '54 000 kr/behandling',
    3000: '58 000 kr/behandling',
    3500: '62 000 kr/behandling',
    4000: '66 000 kr/behandling',
  };

  const DHI = {
    1000: '52 000 kr/behandling',
    1500: '56 000 kr/behandling',
    2000: '60 000 kr/behandling',
    2500: '64 000 kr/behandling',
    3000: '68 000 kr/behandling',
  };

  const PRP = {
    standard: '4 300 kr/behandling',
    xl: '4 800 kr/behandling',
    mini: '2 500 kr/behandling',
    efterHartransplantation: '2 500 kr/behandling',
    skagg: '4 300 kr/behandling',
    ansikte: '4 300 kr/behandling',
    hals: '4 300 kr/behandling',
    dekolletage: '4 300 kr/behandling',
    hander: '4 300 kr/behandling',
    microneedlingDermapenMedPrp: '5 800 kr/behandling',
    laggTillOmrade: '1 500 kr/område',
  };

  const graftMatch = normalizedQuery.match(/\b(1000|1500|2000|2500|3000|3500|4000)\b/);
  const graftCount = graftMatch ? Number.parseInt(graftMatch[1], 10) : null;
  const wantsDHI = /\bdhi\b/.test(normalizedQuery);
  const wantsFUE = /\bfue\b/.test(normalizedQuery);

  function withFooter(lines) {
    return [
      ...lines,
      '',
      'Källa: https://hairtpclinic.se/hartransplantation-pris/',
      'Boka konsultation: https://hairtpclinic.se/boka/',
    ].join('\n');
  }

  if (/(prp|plasma)/i.test(q)) {
    if (/(mini)/i.test(q)) {
      return withFooter([`PRP Hår Mini: ${PRP.mini}.`]);
    }
    if (/(xl)/i.test(q)) {
      return withFooter([`PRP Hår XL: ${PRP.xl}.`]);
    }
    if (/(standard)/i.test(q)) {
      return withFooter([`PRP Hår Standard: ${PRP.standard}.`]);
    }

    return withFooter([
      'PRP-priser:',
      `- Hår Standard: ${PRP.standard}`,
      `- Hår XL: ${PRP.xl}`,
      `- Hår Mini: ${PRP.mini}`,
      `- Efter hårtransplantation: ${PRP.efterHartransplantation}`,
      `- Skägg / Ansikte / Hals / Dekolletage / Händer: ${PRP.skagg}`,
      `- Microneedling/Dermapen + PRP för huden: ${PRP.microneedlingDermapenMedPrp}`,
      `- Lägg till ett område: ${PRP.laggTillOmrade}`,
    ]);
  }

  if (/(microneedling|dermapen)/i.test(q)) {
    return withFooter([
      `Microneedling/Dermapen + PRP för huden: ${PRP.microneedlingDermapenMedPrp}.`,
      `Lägg till ett område: ${PRP.laggTillOmrade}.`,
    ]);
  }

  if (graftCount && wantsDHI && DHI[graftCount]) {
    return withFooter([
      `Priset för ${graftCount} grafts med DHI är ${DHI[graftCount]}.`,
      'Antal grafts avgörs vid konsultation.',
    ]);
  }

  if (graftCount && wantsFUE && FUE[graftCount]) {
    return withFooter([
      `Priset för ${graftCount} grafts med FUE är ${FUE[graftCount]}.`,
      'Antal grafts avgörs vid konsultation.',
    ]);
  }

  if (graftCount && !wantsDHI && !wantsFUE) {
    const lines = [`Pris för ${graftCount} grafts:`];
    if (FUE[graftCount]) lines.push(`- FUE: ${FUE[graftCount]}`);
    if (DHI[graftCount]) lines.push(`- DHI: ${DHI[graftCount]}`);
    lines.push('Antal grafts avgörs vid konsultation.');
    return withFooter(lines);
  }

  if (wantsDHI) {
    return withFooter([
      'Prislista DHI:',
      `- 1000 grafts: ${DHI[1000]}`,
      `- 1500 grafts: ${DHI[1500]}`,
      `- 2000 grafts: ${DHI[2000]}`,
      `- 2500 grafts: ${DHI[2500]}`,
      `- 3000 grafts: ${DHI[3000]}`,
      'Antal grafts avgörs vid konsultation.',
    ]);
  }

  if (wantsFUE) {
    return withFooter([
      'Prislista FUE:',
      `- 1000 grafts: ${FUE[1000]}`,
      `- 1500 grafts: ${FUE[1500]}`,
      `- 2000 grafts: ${FUE[2000]}`,
      `- 2500 grafts: ${FUE[2500]}`,
      `- 3000 grafts: ${FUE[3000]}`,
      `- 3500 grafts: ${FUE[3500]}`,
      `- 4000 grafts: ${FUE[4000]}`,
      'Antal grafts avgörs vid konsultation.',
    ]);
  }

  return withFooter([
    'Prislista hårtransplantation:',
    `- FUE 1000/1500/2000/2500/3000/3500/4000 grafts: ${FUE[1000]}, ${FUE[1500]}, ${FUE[2000]}, ${FUE[2500]}, ${FUE[3000]}, ${FUE[3500]}, ${FUE[4000]}`,
    `- DHI 1000/1500/2000/2500/3000 grafts: ${DHI[1000]}, ${DHI[1500]}, ${DHI[2000]}, ${DHI[2500]}, ${DHI[3000]}`,
    'Antal grafts avgörs vid konsultation.',
  ]);
}

function createChatHandler({
  openai,
  model,
  memoryStore,
  resolveBrand,
  getKnowledgeRetriever,
}) {
  return async function chat(req, res) {
    try {
      const body = req.body || {};
      const message =
        typeof body.message === 'string' ? body.message.trim() : '';
      if (!message) {
        return res.status(400).json({ error: 'Meddelande saknas.' });
      }

      const brand =
        typeof resolveBrand === 'function'
          ? resolveBrand(req, typeof body.sourceUrl === 'string' ? body.sourceUrl : '')
          : undefined;

      const incomingConversationId =
        typeof body.conversationId === 'string' ? body.conversationId : '';

      let conversationId = incomingConversationId;
      let conversation = conversationId
        ? await memoryStore.getConversation(conversationId)
        : null;

      if (conversation && conversation.brand && brand && conversation.brand !== brand) {
        conversationId = '';
        conversation = null;
      }

      if (!conversationId) {
        conversationId = await memoryStore.createConversation(brand);
        conversation = await memoryStore.getConversation(conversationId);
      }

      await memoryStore.ensureConversation(conversationId, brand);

      const convoBefore = await memoryStore.getConversation(conversationId);
      const summaryResult = await maybeSummarizeConversation({
        openai,
        model,
        conversation: convoBefore,
        brand,
      });
      if (summaryResult.summarized) {
        await memoryStore.setSummary(conversationId, summaryResult.summary);
        await memoryStore.replaceMessages(
          conversationId,
          summaryResult.remainingMessages
        );
      }

      conversation = await memoryStore.getConversation(conversationId);

      const knowledgeRetriever =
        typeof getKnowledgeRetriever === 'function'
          ? await getKnowledgeRetriever(brand)
          : null;
      const knowledge = knowledgeRetriever
        ? await knowledgeRetriever.search(message)
        : [];

      const fallbackPriceReply = buildPriceFallbackReply({ brand, message });
      if (fallbackPriceReply) {
        await memoryStore.appendMessage(
          conversationId,
          'user',
          redactForStorage(message)
        );
        await memoryStore.appendMessage(
          conversationId,
          'assistant',
          redactForStorage(fallbackPriceReply)
        );
        return res.json({ reply: fallbackPriceReply, conversationId });
      }

      const messages = await buildClinicMessages({
        brand,
        conversation,
        knowledge,
        currentUserMessage: message,
      });

      await memoryStore.appendMessage(
        conversationId,
        'user',
        redactForStorage(message)
      );

      const reply = await runChatWithTools({
        openai,
        model,
        messages,
      });

      await memoryStore.appendMessage(
        conversationId,
        'assistant',
        redactForStorage(reply)
      );

      return res.json({ reply, conversationId });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Något gick fel.' });
    }
  };
}

module.exports = { createChatHandler };
