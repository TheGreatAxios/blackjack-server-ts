import { table } from "console";
import { createWriteStream } from "fs";
import { Duplex, Stream } from "stream";
import { RawData, WebSocket } from "ws";
import * as GameTypes from '../types/game';

class Game {
    private tables: GameTypes.Table[] = [];
    private players: GameTypes.Player[] = [];

    constructor() {
        console.log("GAME INIT")
        this.runTable();
        this.addTable();
    }

    private runTable(): void {
        this.tables.map((table: GameTypes.Table, index: number) => {
            const isActive: boolean = table.gameStatus === 'ACTIVE';
            const isOver: boolean = table.gameStatus === 'OVER';
            const timerRunning: boolean = table.gameStatus === 'RESET';
            if (isActive) {
                table.timer = 0;
            } else if (isOver) {
                table.gameStatus = 'RESET';
                table.timer = 15000;
                table.players.forEach((player: GameTypes.Player) => {
                    const wsResponse: GameTypes.GameResponse = {
                        action: 'RESET_GAME',
                        roomId: index.toString(),
                        message: 'GAME_OVER',
                        table: table
                    };
                    player.ws?.send(JSON.stringify(wsResponse));
                });
            } else {
                table.timer -= 1000;
                if (table.timer === 0) {
                    table.players.forEach((player: GameTypes.Player) => {
                        const wsResponse: GameTypes.BetweenGames = {
                            action: 'PREPARING_NEW_GAME',
                            roomId: index.toString(),
                            message: 'Loading Next Game',
                            table: table,
                            timer: table.timer
                        };
                        player.ws?.send(JSON.stringify(wsResponse));
                    });
                } else {
                    table.players.forEach((player: GameTypes.Player) => {
                        const wsResponse: GameTypes.GameResponse = {
                            action: 'NEW_GAME',
                            roomId: index.toString(),
                            message: 'Starting Next Game',
                            table: table
                        };
                        player.ws?.send(JSON.stringify(wsResponse));
                    });
                }
                
            }
        })
    }

    public addUserWs(tableId: number, playerId: number, ws: WebSocket): void {
        console.log("PLayer ID: ", playerId);
        this.tables[tableId].players[playerId].ws = ws;
    }

    private addTable(): void  {
        const tableLength: number = this.tables.length;
        const table: GameTypes.Table = {
            id: tableLength + 1,
            players: [],
            timer: 100,
            gameStatus: 'RESET',
            currentHand: undefined,
            hands: [],
            cards: []
        };
        this.tables.push(table);
    }

    private tableAvailable = () : number => {
        let tableId: number = -1;
        if (this.tables.length > 0) {
            this.tables.forEach((table: GameTypes.Table, index: number) => {
                if (table.players.length < 6) {
                    tableId =  index;
                }
            });
        }
        return tableId;
    }

    public addPlayer = (id: string, name: string): void => {
        let player: GameTypes.Player = {
            id: id,
            name: name,
            balance: 1000,
            cards: [],
            isActive: false,
            ws: undefined
        };
        const tableOpen: number = this.tableAvailable();
        console.log("Table Open: ", tableOpen);
        if (tableOpen === -1) {
            this.addTable();
        }

        this.players.push(player);
        let tableId: number = tableOpen === -1 ? this.tables.length -1 : tableOpen;
        this.tables[tableId].players.push(player)
        console.log(this.tables[tableId])
        const wsResponse: GameTypes.GameResponse = {
            action: 'USER_ADDED',
            roomId: tableId.toString(),
            message: 'New User',
            table: this.tables[tableId]
        };

        this.tables[tableId].players.forEach((player: GameTypes.Player) => {
            player.ws?.send(JSON.stringify(wsResponse));
        })

    }


}

export default new Game();