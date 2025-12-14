import { io } from "socket.io-client";

const socket = io("https://backend-chatbot-vwcl.onrender.com", {
  transports: ["websocket"],
});

export default socket;
