import { io } from "socket.io-client";

let socket = null;

export const getSocketUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  return apiUrl.replace(/\/api\/?$/, "");
};

export const getSocket = () => {
  const token = sessionStorage.getItem("token");

  if (!socket) {
    const socketUrl = getSocketUrl();
    socket = io(socketUrl, {
      auth: {
        token: token || "",
      },
      transports: ["websocket", "polling"],
      autoConnect: true,
    });
  } else {
    // Update auth token if token changed
    if (socket.auth && socket.auth.token !== token) {
      socket.auth.token = token || "";
      if (socket.connected) {
        socket.disconnect().connect();
      }
    }
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default getSocket;
