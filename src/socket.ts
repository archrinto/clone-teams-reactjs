import { io } from "socket.io-client";
import config from "./config";

const socketio_url = config.SOCKET_IO_SERVER;

export const socket = io(socketio_url, {
    closeOnBeforeunload: false,
    autoConnect: false
});