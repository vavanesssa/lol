import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_API;
const socket = io( SERVER_URL, { autoConnect: false } );

export default socket;
