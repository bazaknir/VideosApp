export const VIDEOS_CHANGED = "VIDEOS_CHANGED";

let _sockets;
let _lastSocketConnected;

export const sendToSockets = (topic, msg) => {
    _sockets.forEach((socket) => {
        _sockets.get(socket.id).emit(topic, JSON.stringify(msg));
    });
}

export const sendToSocket = (topic, msg) => {
    _lastSocketConnected.emit(topic, JSON.stringify(msg));
}

export const setSockets = (sockets) => {
    _sockets = sockets;
}

export const setLastConnectedSocket = (socket) => {
    _lastSocketConnected = socket;
}