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
        this.addTable();
    }

    // private runTable(tableId: number): any {
    //     if (this.tables[tableId].gameStatus === 'ACTIVE') {
    //         this.tables[tableId].timer = 0;
    //     } else if (this.tables[tableId].gameStatus === 'OVER') {
    //         this.tables[tableId].gameStatus = 'RESET';
    //         this.tables[tableId].timer = 15000;
    //         this.tables[tableId].players.forEach((player: GameTypes.Player) => {
    //                 const wsResponse: GameTypes.GameResponse = {
    //                     action: 'RESET_GAME',
    //                     roomId: tableId.toString(),
    //                     message: 'GAME_OVER',
    //                     table: this.tables[tableId]
    //                 };
    //                 player.ws?.send(JSON.stringify(wsResponse));
    //             });
    //     } else {
    //         let id: NodeJS.Timer = setInterval(() => {
    //             if (this.tables[tableId].timer === 0) {
    //                 clearInterval(id);
    //                 this.tables[tableId].gameStatus = 'ACTIVE';
    //                 this.deal(tableId);
    //                 this.tables[tableId].players.forEach((player: GameTypes.Player) => {
    //                     const wsResponse: GameTypes.GameResponse = {
    //                         action: 'NEW_GAME',
    //                         roomId: tableId.toString(),
    //                         message: 'Starting Next Game',
    //                         table: this.tables[tableId]
    //                     };
    //                     player.ws?.send(JSON.stringify(wsResponse));
    //                 });
    //             } else {
    //                 this.tables[tableId].timer -= 1000;
    //                 this.tables[tableId].players.forEach((player: GameTypes.Player) => {
                        // const wsResponse: GameTypes.BetweenGames = {
                        //     action: 'PREPARING_NEW_GAME',
                        //     roomId: tableId.toString(),
                        //     message: 'Loading Next Game',
                        //     table: this.tables[tableId],
                        //     timer: this.tables[tableId].timer
                        // };
    //                     player.ws?.send(JSON.stringify(wsResponse));
    //                 });
    //             }
    //         }, 1000);
    //     }
    // }

    public deal(tableId: number): void {
        this.tables[tableId].currentHand.players.map((player: GameTypes.PlayerInGame) => {
            player.inGame = true;
            return player;
        });

        const numberPlayers: number = this.tables[tableId].players.length;
        // console.log("Number Players: ", numberPlayers);
        if (numberPlayers === 0) {
            this.tables[tableId].gameStatus = 'RESET';
            this.tables[tableId].timer = 15000;
            // this.runTable(tableId);
            return;
        } else {
            if (this.tables[tableId].cards.length < (numberPlayers + 1) * 5)  {
                this.tables[tableId].cards = this.rollDecks();
                this.tables[tableId].cardsUsed = [];
            }

            for (let j = 0; j < 2; j++) {
                for (let i = 0; i < numberPlayers; i++) {
                    this.tables[tableId].currentHand.players[i].cards.push(this.tables[tableId].cards.shift() ?? '');
                }
                this.tables[tableId].currentHand.dealer.push(this.tables[tableId].cards.shift() ?? '');
            }
        }
        this.tables[tableId].currentHand.players.map((player: GameTypes.PlayerInGame) => {
            player.inGame = true;
            return player;
        });
        const wsResponse: GameTypes.BetweenGames = {
            action: 'PREPARING_NEW_GAME',
            roomId: tableId.toString(),
            message: 'Loading Next Game',
            table: this.tables[tableId],
            timer: this.tables[tableId].timer
        };

        this.tables[tableId].players.forEach((player: GameTypes.Player) => {
            player.ws?.send(JSON.stringify(wsResponse));
        });
        
    }

    public rollDecks(): string[] {
        const cardValues = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'A', 'J', 'Q', 'K'];
        const cardTypes = ['H', 'C', 'S', 'D'];
        let cards: string[] = [];
        cardValues.forEach((val: string | number) => {
            cardTypes.forEach((typ: string) => {
                cards.push(`${val}${typ}`);
            });
        })
        cards = cards.concat(cards, cards, cards);
        cards = cards
            .map((value) => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value)
        console.log("Cards: ", cards);
        console.log("Cards L: ", cards.length);
        return cards;
    }

    public addUserWs(tableId: number, playerId: number, ws: WebSocket): void {
        console.log("PLayer ID: ", playerId);
        this.tables[tableId].players[playerId].ws = ws;
    }

    private userBet(tableId: number, playerId: number, betSize: number) : boolean {
        const isAcceptableBet: boolean = this.tables[tableId].players[playerId].balance >= betSize;
        if (isAcceptableBet) {
            this.tables[tableId].currentHand.players[playerId].bet.push(betSize.toString());
            this.tables[tableId].players[playerId].balance -= betSize;
            return true;
        } else {
            return false;
        }
        
    }

    public userBetAction(tableId: number, playerId: number, betSize: number): void {
        const betAccepted: boolean = this.userBet(tableId, playerId, betSize);
        const wsResponse: GameTypes.GameResponse = {
            action: 'USER_BET',
            roomId: tableId.toString(),
            message: betAccepted ? `Player ${playerId} bet ${betSize}` : 'You don\'t have enough money',
            table: this.tables[tableId]
        }
        if (betAccepted) {
            this.tables[tableId].players.forEach((player: GameTypes.Player) => {
                player.ws?.send(JSON.stringify(wsResponse));
            })
        } else {
            this.tables[tableId].players[playerId].ws?.send(JSON.stringify(wsResponse));
        }
    }

    private userHit(tableId: number, playerId: number): void {
        this.tables[tableId].currentHand.players[playerId].actions.push('HIT');
        this.tables[tableId].currentHand.players[playerId].cards.push(this.tables[tableId].cards.shift() ?? '');
    }

    public userHitAction(tableId: number, playerId: number) :  void  {
        this.userHit(tableId, playerId);
        const wsResponse: GameTypes.GameResponse = {
            action: 'USER_HIT',
            roomId: tableId.toString(),
            message: `Player ${playerId} hit`,
            table: this.tables[tableId]
        }

        this.tables[tableId].players.forEach((player: GameTypes.Player) => {
            player.ws?.send(JSON.stringify(wsResponse));
        })

    }

    private userStand(tableId: number, playerId: number): void {
        this.tables[tableId].currentHand.players[playerId].actions.push('STAND');
    }

    public userStandAction(tableId: number, playerId: number): void {
        this.userStand(tableId, playerId);
        const wsResponse: GameTypes.GameResponse = {
            action: 'USER_STAND',
            roomId: tableId.toString(),
            message: `Player ${playerId} stood`,
            table: this.tables[tableId]
        }

        this.tables[tableId].players.forEach((player: GameTypes.Player) => {
            player.ws?.send(JSON.stringify(wsResponse));
        })

    }

    private addTable(): void  {
        const tableLength: number = this.tables.length;
        const table: GameTypes.Table = {
            id: tableLength,
            players: [],
            timer: 15000,
            gameStatus: 'RESET',
            currentHand: {players: [], dealer: [], status: 0},
            hands: [],
            cards: this.rollDecks(),
            cardsUsed: []
        };
        this.tables.push(table);
        // this.runTable(this.tables.length -1);
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

    public addPlayer = (id: string, name: string): GameTypes.Player => {
        let playerId: number = this.players.length;
        let player: GameTypes.Player = {
            id: playerId.toString(),
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
        let playerHand: GameTypes.PlayerInGame = {
            playerId: id,
            inGame: false,
            cards: [],
            bet: [],
            actions: [], 
        };
        this.tables[tableId].currentHand.players.push(playerHand);

        this.tables[tableId].players.forEach((player: GameTypes.Player) => {
            player.ws?.send(JSON.stringify(wsResponse));
        })

        return player;
    }

    public getTables() {
        return this.tables;
    }


}

export default new Game();