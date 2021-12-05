import { Socket } from "net";
import EventEmitter from "events";
import { HttpServer } from "../http/http";

export class WebSocket extends EventEmitter {
    private server: HttpServer;

    constructor(server: HttpServer) {
        super();
        this.server = server;
        this.init(this);
    }

    private init(websocket: WebSocket) {
        this.server.server.emit("DATA HERE");
    }
}