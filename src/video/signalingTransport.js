'use strict';

/**
 * WebRTC signaling transport.
 *
 * Kopplar signalingService.handleSignalingMessage() till en riktig WebSocket
 * (ws) på /api/v1/video/signal. Varje peer ansluter med en engångstoken
 * (patientToken eller hostToken, samma som /video/join/:token) som
 * query-parameter: ?token=...
 *
 * Meddelandeprotokoll (JSON över text-ramar):
 *   → { type: 'offer' | 'answer' | 'ice-candidate', payload }
 *   → { type: 'join' | 'leave', payload: { role } }
 *   ← { type, from, payload }  (broadcast till de ANDRA i rummet)
 *
 * Säkerhet: token mappas till { roomId, role } via signalingService.joinRoom.
 * Ogiltig token → 401 utan att uppgradera anslutningen.
 */

const crypto = require('node:crypto');
const { WebSocketServer, WebSocket } = require('ws');

const SIGNAL_PATH = '/api/v1/video/signal';

function createSignalingTransport({ httpServer, signalingService, logger = console }) {
  if (!httpServer) return null;

  const wss = new WebSocketServer({ noServer: true });

  // roomId → Set<WebSocket>
  const roomSockets = new Map();
  // WebSocket → { roomId, peerId, role }
  const peerMeta = new WeakMap();

  function broadcastToOthers(roomId, fromSocket, message) {
    const sockets = roomSockets.get(roomId);
    if (!sockets) return;
    let payload;
    try {
      payload = JSON.stringify(message);
    } catch {
      return;
    }
    for (const sock of sockets) {
      if (sock !== fromSocket && sock.readyState === WebSocket.OPEN) {
        sock.send(payload);
      }
    }
  }

  function registerPeer(ws, roomId, role) {
    const peerId = `${role}-${crypto.randomBytes(6).toString('base64url')}`;
    peerMeta.set(ws, { roomId, peerId, role });
    if (!roomSockets.has(roomId)) roomSockets.set(roomId, new Set());
    roomSockets.get(roomId).add(ws);
    signalingService.handleSignalingMessage(roomId, peerId, {
      type: 'join',
      payload: { role },
    });
    return peerId;
  }

  function unregisterPeer(ws) {
    const meta = peerMeta.get(ws);
    if (!meta) return;
    signalingService.handleSignalingMessage(meta.roomId, meta.peerId, { type: 'leave' });
    const sockets = roomSockets.get(meta.roomId);
    if (sockets) {
      sockets.delete(ws);
      if (sockets.size === 0) roomSockets.delete(meta.roomId);
    }
  }

  httpServer.on('upgrade', (request, socket, head) => {
    let url;
    try {
      url = new URL(request.url, 'http://localhost');
    } catch {
      socket.destroy();
      return;
    }
    if (url.pathname !== SIGNAL_PATH) return; // inte vår väg — låt andra hantera den

    const token = (url.searchParams.get('token') || '').trim();
    const join = token ? signalingService.joinRoom(token) : null;
    if (!join) {
      socket.write('HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n');
      socket.destroy();
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      registerPeer(ws, join.room.roomId, join.role);
      wss.emit('connection', ws, request);
    });
  });

  wss.on('connection', (ws) => {
    ws.on('message', (data) => {
      const meta = peerMeta.get(ws);
      if (!meta) return;
      let msg;
      try {
        msg = JSON.parse(data.toString());
      } catch {
        return;
      }
      const result = signalingService.handleSignalingMessage(meta.roomId, meta.peerId, msg);
      if (result && result.broadcast) {
        broadcastToOthers(meta.roomId, ws, result);
      }
    });

    ws.on('close', () => unregisterPeer(ws));
    ws.on('error', (err) => {
      if (logger && typeof logger.warn === 'function') {
        logger.warn('[signaling] peer-fel:', err && err.message);
      }
    });
  });

  return wss;
}

module.exports = { createSignalingTransport, SIGNAL_PATH };
