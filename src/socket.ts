import { io } from "socket.io-client";

const socketio_url = 'http://localhost:3000';

export const socket = io(socketio_url, {
    autoConnect: false
});