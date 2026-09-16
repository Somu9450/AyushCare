import { io, Socket } from 'socket.io-client';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, '') ||
  'http://localhost:8000';

let socket: Socket | null = null;
let hasLoggedConnectWarning = false;

export const getSocket = (): Socket => {
  if (typeof window === 'undefined') {
    return {} as Socket;
  }

  if (!socket) {
    try {
      socket = io(SOCKET_URL, {
        path: '/socket.io',
        autoConnect: true,
        withCredentials: true,
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 5000,
        timeout: 10000,
      });

      socket.on('connect', () => {
        hasLoggedConnectWarning = false;
      });

      socket.on('connect_error', (err) => {
        if (!hasLoggedConnectWarning) {
          console.warn(
            `[Socket.io] Connection warning (${SOCKET_URL}): ${err.message}. Retrying via polling/websocket fallback.`
          );
          hasLoggedConnectWarning = true;
        }
      });

      socket.on('reconnect_failed', () => {
        console.warn(
          `[Socket.io] Reconnection attempts exhausted (${SOCKET_URL}). Check backend server status.`
        );
      });

      socket.on('error', (err) => {
        console.warn('[Socket.io] Diagnostic error:', err);
      });
    } catch (err) {
      console.warn('[Socket.io] Initialization exception:', err);
    }
  }

  return socket!;
};

export const subscribeToQueueEvents = (
  onQueueUpdated?: (data?: any) => void,
  onTokenCalled?: (data?: any) => void,
  onPatientReady?: (data?: any) => void,
  onRedFlag?: (data?: any) => void
) => {
  const s = getSocket();
  if (!s || typeof s.on !== 'function') return () => {};

  if (onQueueUpdated) s.on('queue:updated', onQueueUpdated);
  if (onTokenCalled) s.on('token:called', onTokenCalled);
  if (onPatientReady) s.on('patient:ready', onPatientReady);
  if (onRedFlag) s.on('triage:red-flag', onRedFlag);

  return () => {
    if (onQueueUpdated) s.off('queue:updated', onQueueUpdated);
    if (onTokenCalled) s.off('token:called', onTokenCalled);
    if (onPatientReady) s.off('patient:ready', onPatientReady);
    if (onRedFlag) s.off('triage:red-flag', onRedFlag);
  };
};

export const disconnectSocket = () => {
  if (socket && typeof socket.disconnect === 'function') {
    socket.disconnect();
    socket = null;
    hasLoggedConnectWarning = false;
  }
};
