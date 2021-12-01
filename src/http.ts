import { createServer, Server, Socket } from "net";
import { stringify } from "querystring";
import { urlToHttpOptions } from "url";
import { Handler } from "./httpHandler";
import { HttpRequest } from './types/request';


class HttpServer {

    public server: Server;
    public handler: Handler | undefined;

    constructor() {
        this.server = createServer((socket: Socket) => {
            this.handler = new Handler(socket);
            socket.on('data', (data: Buffer) => {
                const bufferToString = data.toString();
                // console.log(bufferToString);
                const bufferList: string[] = bufferToString.split('\n');
                const requestLine: string[] = bufferList[0].split(' ');
                const requestLineSplit: string[] = requestLine[1].split('/?');
                // console.log("RP: ", requestLineSplit);
                // const params: string[] = requestLineSplit.copyWithin(-1, 2);
                let params: string[] = requestLineSplit.map((str: string, index: number) => {
                    if (index > 0) {
                        const value: string = str.split('=')[1];
                        // console.log("Value: ", value);
                        return value;
                    } else {
                        return '';
                    }
                });
                params = params.filter((str: string, index: number) => {
                    if (str.length > 0 && str !== '') return str;
                });
                // console.log("Params: ", params);
                let httpRequest: HttpRequest = {
                    method: requestLineSplit[0],
                    params: params,
                    url: requestLine[1].split('?')[0],
                    protocol: requestLine[2].split('\r')[0],
                    host: bufferList[1].substring(6, bufferList[1].length-2),
                    port: Number.parseInt(bufferList[1].substring(6, bufferList[1].length-2).split(':')[1]),
                    userAgent: ''
                };
                // console.log(httpRequest.url);
                this.handler?.handleRequest(httpRequest);
                socket.end();
            })
        });
    }
}

const httpServer: HttpServer = new HttpServer();

let app = {};

httpServer.server.listen(8080, () => {
    console.log("Listening on PORT: ", 8080);
})

// console.log("Connection: ", httpServer.server.);