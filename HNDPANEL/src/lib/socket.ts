import { io, Socket } from 'socket.io-client';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') ||
  'http://localhost:8000';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
  }
  return socket;
};

export const subscribeToQueueEvents = (
  onQueueUpdated?: (data?: any) => void,
  onTokenCalled?: (data?: any) => void,
  onPatientReady?: (data?: any) => void,
  onRedFlag?: (data?: any) => void
) => {
  const s = getSocket();

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
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
