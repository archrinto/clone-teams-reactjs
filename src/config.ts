export default {
    MAIN_API: process.env.REACT_APP_MAIN_API || 'http://localhost:9000/v1',
    SOCKET_IO_SERVER: process.env.REACT_APP_SOCKET_IO_SERVER || 'http://localhost:9000',
    PEER_SERVER_HOST: process.env.REACT_APP_PEER_SERVER_HOST || '/',
    PEER_SERVER_PORT: Number(process.env.REACT_APP_PEER_SERVER_PORT) || 3002,
    TURN_SERVER: process.env.REACT_APP_TURN_SERVER,
    TURN_SERVER_USER: process.env.REACT_APP_TURN_SERVER_USER,
    TURN_SERVER_PASSWORD: process.env.REACT_APP_TURN_SERVER_PASSWORD,
}