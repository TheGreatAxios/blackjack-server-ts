import { STATUS_CODES } from "http";
import { Socket } from "net";
import { HttpRequest } from "../types/request";
import Game from '../game/game';
import { WebSocket } from 'ws';

type RouteType = {
    [key: string]: any;
};

enum Routes {
    DEFAULT = '/',
    NEW_PLAYER = '/player/new'
}

export class Handler {
    private socket: Socket;
    private routes: RouteType = {};
    private game: typeof Game = Game;

    constructor(socket: Socket) {
        this.socket = socket;
    }

    public handleRequest = (request: HttpRequest): void => {
        if (request.url === Routes.DEFAULT) {
            this.homeRoute(request);
        } else if (request.url === Routes.NEW_PLAYER) {
            this.addPlayerRoute(request);
        }
    }

    private homeRoute = (req: HttpRequest): void => {
        this.writeToSocket('Server Ready', 200);
    }

    private addPlayerRoute = (req: HttpRequest): void => {
        // this.game.addPlayer('1', 'theGreatAxios');
        this.writeToSocket("Success", 200);
    }

    private writeToSocket(data: Object, statusCode: number): void {
        const status: string = STATUS_CODES[statusCode] ?? 'Server Error';
        // this.socket.write(`HTTP/1.1 101 Switching Protocols\r\n`);
        
        if (statusCode === 200) {
            this.socket.write(`${JSON.stringify(data)}\n\n`);
            this.socket.end();
        }
    }
}
