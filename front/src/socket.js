import { io } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3001'; // Replace this with your API server URL
const socket = io( SERVER_URL, { autoConnect: false } );

export default socket;
