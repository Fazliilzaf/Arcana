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

  if (/(prp|plasma)/i.test(q)) {
    return [
      'Aktuell information om PRP hittar du här:',
      '- https://hairtpclinic.se/prp-behandling/',
      '',
      'För exakt pris utifrån dina förutsättningar rekommenderar vi konsultation:',
      '- https://hairtpclinic.se/boka/',
    ].join('\n');
  }

  if (/(microneedling|dermapen)/i.test(q)) {
    return [
      'Aktuell information om Microneedling / Dermapen hittar du här:',
      '- https://hairtpclinic.se/microneedling-dermapen/',
      '',
      'För exakt pris utifrån dina förutsättningar rekommenderar vi konsultation:',
      '- https://hairtpclinic.se/boka/',
    ].join('\n');
  }

  return [
    'Aktuell prisinformation för hårtransplantation hittar du här:',
    '- https://hairtpclinic.se/hartransplantation-pris/',
    '',
    'För exakt pris (t.ex. vid DHI eller antal grafts) rekommenderar vi konsultation:',
    '- https://hairtpclinic.se/boka/',
  ].join('\n');
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
