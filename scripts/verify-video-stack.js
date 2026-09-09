'use strict';

/**
 * Verifierar videostacken end-to-end UTAN kamera/mikrofon:
 *
 *   1. /video/healthz svarar och rapporterar att signaleringen är uppe.
 *   2. Rum skapas (personalens POST /video/rooms-flöde).
 *   3. /video/join/:token returnerar rummet + ICE-servrar.
 *   4. Två peers (patient + personal) ansluter via WebSocket och
 *      offer/answer/ice-candidate reläas mellan dem.
 *   5. Ogiltig token nekas.
 *
 * Kör:  node scripts/verify-video-stack.js
 * Exit: 0 = allt grönt, 1 = minst ett fel.
 */

const http = require('node:http');
const WebSocket = require('ws');
const express = require('express');

const { createSignalingService } = require('../src/video/signalingServer');
const { createSignalingTransport } = require('../src/video/signalingTransport');
const { createVideoRouter } = require('../src/routes/video');

const MOCK_AUTH = {
  requireAuth: (req, res, next) => next(),
  requireRole: () => (req, res, next) => next(),
};

function connect(port, token) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://localhost:${port}/api/v1/video/signal?token=${token}`);
    const received = [];
    ws.on('message', (d) => received.push(JSON.parse(d.toString())));
    ws.on('open', () => resolve({ ws, received }));
    ws.on('error', reject);
  });
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const signalingService = createSignalingService();
  const transcriptionService = { startSession: () => ({}), addAudioChunk: () => true, processFullPipeline: () => ({}), getSessionResult: () => ({}) };

  const app = express();
  app.use(express.json());
  app.use('/api/v1', createVideoRouter({ authStore: MOCK_AUTH, signalingService, transcriptionService }));

  const server = http.createServer(app);
  createSignalingTransport({ httpServer: server, signalingService, logger: { warn() {} } });

  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const base = `http://localhost:${port}`;

  const results = [];
  const check = (name, ok, detail = '') => {
    results.push({ name, ok, detail });
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
  };

  try {
    // 1. healthz
    {
      const res = await fetch(`${base}/api/v1/video/healthz`);
      const body = await res.json();
      check('healthz svarar och signaleringen är uppe', res.ok && body.ok && body.signalingUp === true, JSON.stringify(body));
    }

    // 2. rum skapas (personalens flöde)
    const room = signalingService.createRoom({
      encounterId: 'verify-1',
      patientName: 'Testpatient',
      serviceLabel: 'Videouppföljning',
    });
    check('rum skapas med patient- och host-token', Boolean(room.roomId && room.patientToken && room.hostToken));

    // 3. join-endpoint returnerar rum + ICE
    {
      const res = await fetch(`${base}/api/v1/video/join/${room.patientToken}`);
      const body = await res.json();
      check('join returnerar rum + ICE-servrar', res.ok && body.ok && body.roomId === room.roomId && Array.isArray(body.iceServers));
    }

    // 4. signaling relay (offer/answer/ice)
    const host = await connect(port, room.hostToken);
    const patient = await connect(port, room.patientToken);
    await wait(120);

    patient.ws.send(JSON.stringify({ type: 'offer', payload: { sdp: 'sdp-offer' } }));
    await wait(120);
    const hostOffer = host.received.some((m) => m.type === 'offer' && m.payload.sdp === 'sdp-offer');
    check('offer reläas till personal', hostOffer);

    host.ws.send(JSON.stringify({ type: 'answer', payload: { sdp: 'sdp-answer' } }));
    await wait(120);
    const patientAnswer = patient.received.some((m) => m.type === 'answer' && m.payload.sdp === 'sdp-answer');
    check('answer reläas till patient', patientAnswer);

    patient.ws.send(JSON.stringify({ type: 'ice-candidate', payload: { candidate: 'candidate:1 1 udp 1 127.0.0.1 1 typ host', sdpMid: '0', sdpMLineIndex: 0 } }));
    await wait(120);
    const hostIce = host.received.some((m) => m.type === 'ice-candidate');
    check('ice-candidate reläas till personal', hostIce);

    // 5. ogiltig token nekas
    const invalid = await new Promise((resolve) => {
      const ws = new WebSocket(`ws://localhost:${port}/api/v1/video/signal?token=ogiltig`);
      ws.on('error', () => resolve('rejected'));
      ws.on('open', () => resolve('opened'));
    });
    check('ogiltig token nekas', invalid === 'rejected', invalid);

    host.ws.close();
    patient.ws.close();
  } finally {
    server.close();
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} gröna.`);
  if (failed.length) {
    console.log('Fel: ' + failed.map((f) => f.name).join('; '));
    process.exit(1);
  }
  console.log('Videostacken är uppe (signalering + rum + join + relay).');
  process.exit(0);
}

main().catch((err) => {
  console.error('Verifieringen kraschade:', err && err.message);
  process.exit(1);
});
