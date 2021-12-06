import { HttpServer } from "./http/http";
// import { createServer } from 'tls';
// import { WebSocket } from "./ws/ws";
import fs from 'fs';
import { fstat } from 'fs';
import { createServer } from 'https';
import { Event, RawData, WebSocket, WebSocketServer } from 'ws';
import game from "./game/game";
import { AddUserResponse, AddUserWs, GameRequest, GameResponse, Player, Table } from "./types/game";
const httpServer: HttpServer = new HttpServer();
// const server = createServer({
//     cert: fs.readFileSync('./ca.crt'),
//     key: fs.readFileSync('./ca.key'),
// })

// server.listen(8080);

// const wss = new WebSocketServer({ server: server });
const wss = new WebSocketServer({ host: 'localhost', port: 8080 });

wss.on('connection', (socket: WebSocket) => {

    // socket.on('open', () => {
    //     console.log("Open");
    //     socket.send("HTTP/1.1 200 OK\n\n\n");
    // })
    socket.on('error', (err: Error) => {
        console.log("error:");
        console.log(err.toString());
    })
    socket.on('message', (data: RawData) => {
        console.log("DATA: ", data);
        const request: GameRequest = JSON.parse(data.toString());
        console.log("Request: ", request.action);
        if (request.action === 'NEW_USER') {
            const addedSuccessfully: Player = game.addPlayer('1', 'SRC');
            let t: Table | undefined;
            const tables: Table[] = game.getTables();
            tables.forEach((table: Table) =>{
                table.players.forEach((player: Player) => {
                    if (player.id === addedSuccessfully.id) {
                        t = table;
                    }
                });
            });

            if (addedSuccessfully) {
                const wsResponse: AddUserResponse = {
                    action: "USER_ADD_LOCAL",
                    roomId: "",
                    message: "Added Successfully",
                    table: t,
                    player: addedSuccessfully,
                }
                socket.send(JSON.stringify(wsResponse));
            }
        } else if (request.action === 'CONNECT') {
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

