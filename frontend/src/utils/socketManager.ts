import { Manager } from "socket.io-client";

const socketManager = new Manager(import.meta.env.VITE_API_URL, {
  extraHeaders: {},
});
export default socketManager;
