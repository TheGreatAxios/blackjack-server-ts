import { HttpServer } from "./http/http";
// import { WebSocket } from "./ws/ws";
import { RawData, WebSocket, WebSocketServer } from 'ws';
import game from "./game/game";
import { AddUserWs, GameRequest } from "./types/game";
const httpServer: HttpServer = new HttpServer();

const wss = new WebSocketServer({ host: 'localhost', port: 8080 });

wss.on('connection', (socket: WebSocket) => {
    
    socket.on('message', (data: RawData) => {
        const request: GameRequest = JSON.parse(data.toString());
        console.log("Request: ", request.action);
        if (request.action === 'CONNECT') {
            const connectRequest: AddUserWs = JSON.parse(data.toString());
            console.log("Connect R: ", connectRequest);
            game.addUserWs(parseInt(connectRequest.roomId), parseInt(connectRequest.data.playerId), socket);
        }
    })
    console.log("WS Connection Creation");
})

httpServer.server.listen(8080, () => {
    console.log("Listening on PORT: ", 8080);
})