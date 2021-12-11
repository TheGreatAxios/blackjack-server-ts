import { HttpServer } from "./http/http";
// import { createServer } from 'tls';
// import { WebSocket } from "./ws/ws";
import fs from 'fs';
import { fstat } from 'fs';
import { createServer } from 'https';
import { Event, RawData, WebSocket, WebSocketServer } from 'ws';
import game from "./game/game";
import { AddUserResponse, AddUserWs, GameRequest, GameResponse, ITable, UserBetAction, UserHitRequest } from "./types/game";
const httpServer: HttpServer = new HttpServer();
// const server = createServer({
//     cert: fs.readFileSync('./ca.crt'),
//     key: fs.readFileSync('./ca.key'),
// })

// server.listen(8080);

// const wss = new WebSocketServer({ server: server });
const wss = new WebSocketServer({ host: 'localhost', port: 8080 });

wss.on('connection', (socket: WebSocket) => {

    socket.on('error', (err: Error) => {
        console.log("error:");
        console.log(err.toString());
    })
    socket.on('message', (data: RawData) => {
        // console.log("DATA: ", data);
        const request: GameRequest = JSON.parse(data.toString());
        console.log("Request: ", request);
        if (request.action === 'JOIN') {
            let table: ITable | undefined = game.joinGame(request.name, socket);
            if (table) socket.send(JSON.stringify(table));
        } else if (request.action === 'READY_UP') {
            game.readyUp(request.playerNumber!);
        } else if (request.action === 'DEAL') {
            game.deal();
        } else if (request.action === 'HIT') {
            game.hit(request.playerNumber!);
        } else if (request.action === 'STAND') {
            game.stand(request.playerNumber!);
        } else if (request.action === 'BET') {
            game.bet(request.playerNumber!, request.bet!);
        }
        // if (request.action === 'NEW_USER') {
        //     const addedSuccessfully: Player = game.addPlayer('1', 'SRC');
        //     let t: Table | undefined;
        //     const tables: Table[] = game.getTables();
        //     tables.forEach((table: Table) =>{
        //         table.players.forEach((player: Player) => {
        //             if (player.id === addedSuccessfully.id) {
        //                 t = table;
        //             }
        //         });
        //     });

        //     if (addedSuccessfully) {
        //         const wsResponse: AddUserResponse = {
        //             action: "USER_ADD_LOCAL",
        //             roomId: "",
        //             message: "Added Successfully",
        //             table: t,
        //             player: addedSuccessfully,
        //         }
        //         socket.send(JSON.stringify(wsResponse));
        //     }
        // } else if (request.action === 'CONNECT') {
        //     const connectRequest: AddUserWs = JSON.parse(data.toString());
        //     console.log("Connect R: ", connectRequest);
        //     game.addUserWs(parseInt(connectRequest.roomId), parseInt(connectRequest.data.playerId), socket);
        // } else if (request.action === 'USER_HIT') {
        //     const userHitRequest: UserHitRequest = JSON.parse(data.toString());
        //     game.userHitAction(parseInt(userHitRequest.roomId), parseInt(userHitRequest.playerId));
        // } else if (request.action === 'USER_BET') {
        //     const userBetRequest: UserBetAction = JSON.parse(data.toString());
        //     game.userBetAction(parseInt(userBetRequest.roomId), parseInt(userBetRequest.playerId), userBetRequest.betAmount);
        // } else if (request.action === 'START_GAME') {
        //     game.deal(parseInt(request.roomId));
        // }
    })
    console.log("WS Connection Creation");
})

httpServer.server.listen(8080, () => {
    console.log("Listening on PORT: ", 8080);
})

