import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3001";

const socket = io(
  SOCKET_URL,
  {
    autoConnect: false,
  }
);

export function connectSocket() {
  if (!socket.connected) {
    socket.connect();
  }

  return socket;
}

export function disconnectSocket() {
  if (socket.connected) {
    socket.disconnect();
  }
}

export default socket;