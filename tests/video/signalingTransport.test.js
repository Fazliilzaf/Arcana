'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const WebSocket = require('ws');

const { createSignalingService } = require('../../src/video/signalingServer');
const { createSignalingTransport } = require('../../src/video/signalingTransport');

function connect(port, token) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://localhost:${port}/api/v1/video/signal?token=${token}`);
    const received = [];
    ws.on('message', (data) => received.push(JSON.parse(data.toString())));
    ws.on('open', () => resolve({ ws, received }));
    ws.on('error', reject);
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

test('signaling transport reläar offer/answer mellan patient och personal', async () => {
  const signaling = createSignalingService();
  const server = http.createServer((req, res) => res.end('ok'));
  createSignalingTransport({ httpServer: server, signalingService: signaling, logger: { warn() {} } });

  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;

  try {
    const room = signaling.createRoom({
      encounterId: 'enc-1',
      patientName: 'Adam',
      serviceLabel: 'Videouppföljning',
    });

    const host = await connect(port, room.hostToken);
    const patient = await connect(port, room.patientToken);
    await wait(120);

    patient.ws.send(JSON.stringify({ type: 'offer', payload: { sdp: 'sdp-a' } }));
    await wait(120);
    assert.ok(host.received.some((m) => m.type === 'offer' && m.payload.sdp === 'sdp-a'));

    host.ws.send(JSON.stringify({ type: 'answer', payload: { sdp: 'sdp-b' } }));
    await wait(120);
    assert.ok(patient.received.some((m) => m.type === 'answer' && m.payload.sdp === 'sdp-b'));

    host.ws.close();
    patient.ws.close();
  } finally {
    server.close();
  }
});

test('signaling transport nekar ogiltig token', async () => {
  const signaling = createSignalingService();
  const server = http.createServer((req, res) => res.end('ok'));
  createSignalingTransport({ httpServer: server, signalingService: signaling, logger: { warn() {} } });

  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;

  try {
    const outcome = await new Promise((resolve) => {
      const ws = new WebSocket(`ws://localhost:${port}/api/v1/video/signal?token=wrong`);
      ws.on('error', () => resolve('rejected'));
      ws.on('open', () => resolve('opened'));
    });
    assert.equal(outcome, 'rejected');
  } finally {
    server.close();
  }
});
