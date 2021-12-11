import { WebSocket } from "ws";
// import * as GameTypes from '../types/game';
import { ITable, IPlayer, IDealer, IAction } from '../types/game';

class Game { 
    public table: ITable;
    public cards: string[];
    // private player1: PlayerInGame;
    // private player2: PlayerInGame;
    // private dealer: Dealer;
    // private tables: GameTypes.Table[] = [];
    // private players: GameTypes.Player[] = [];

    constructor() {
        // console.log("GAME INIT")
        this.table = this.createTable();
        this.cards = this.rollDecks();

    }

    public addPlayer = (): IPlayer => {
        let player: IPlayer = {
            currentHandValue: 0,
            name: '',
            balance: 1000,
            currentBet: 0,
            currentHand: [],
            isActive: false,
            hasWon: undefined,
            hasBusted: undefined,
            isReady: false,
            hasJoined: false,
            hasBlackjack: undefined,
            hasPushed: undefined,
            ws: undefined
        };
        
        return player;
    }

    public createTable(): ITable  {
        // let playerOne: IPlayer = this.addPlayer();
        // let playerTwo: IPlayer = this.addPlayer();
        // let dealer: IDealer = this.addDealer();
        let table: ITable = {
            playerOne: this.addPlayer(),
            playerTwo: this.addPlayer(),
            dealer: this.addDealer(),
            isGameActive: false,
            isPlayerOneTurn: false,
            isPlayerTwoTurn: false,
            isDealerTurn: false,
            isGameOver: false,
            isDealing: false,
            messages: [],
            readyToDeal: false
        };
        return table;
    }

    public addDealer = (): IDealer => {
        let dealer: IDealer = {
            cards: [],
            isActive: false,
            hasBlackjack: false,
            hasBusted: false,
            currentHandValue: 0
        };
        return dealer;
    }

    public joinGame(name: string, ws: WebSocket): ITable | undefined {
        // console.log("Websocket: ", ws);
        if (!this.table.playerOne.hasJoined) {
            this.table.playerOne.name = name;
            this.table.playerOne.hasJoined = true;
            this.table.playerOne.ws = ws;
            // let stringifiedTable: string = JSON.stringify(this.table);
            this.sendToAllPlayers(this.table, 1);
            // this.table.playerOne.ws?.send(this.table);
            // this.table.playerTwo.ws?.send(this.table);
        } else if (!this.table.playerTwo.hasJoined) {
            this.table.playerTwo.name = name;
            this.table.playerTwo.hasJoined = true;
            this.table.playerTwo.ws = ws;
            // let stringifiedTable: string = JSON.stringify(this.table);
            // this.sendToAllPlayers(this.table, 2, ws);
            return this.table;
        } else {
            this.sendToSocket(ws, "Sorry, the table is full");
        }
        
    }

    private sendToAllPlayers(response: any, playerNumber: number, ws?: WebSocket): void {
        if (this.table.playerOne.ws) {
            // console.log("This Table: ", this.table);
            let localtable: ITable = this.table;
            // localtable.playerOne.ws = undefined;
            // localtable.playerTwo.ws = undefined;
            this.table.playerOne.ws?.send(JSON.stringify(localtable));
        }
        if (ws) {
            // ws.send
        } else if (this.table.playerTwo.ws) {
            // console.log("This Table: ", this.table);
            let localtable: ITable = this.table;
            // localtable.playerOne.ws = undefined;
            // localtable.playerTwo.ws = undefined;
            this.table.playerTwo.ws?.send(JSON.stringify(localtable));
        }
        // this.table.playerOne.ws?.send(JSON.stringify(response));
        // this.table.playerTwo.ws?.send(JSON.stringify(response));
    }

    private sendToSocket(ws: WebSocket, response: any): void {
        ws.send(response);
    }

    public readyUp(playerNumber: number): void {
        // console.log("PLayer Number: ", playerNumber);
        const isPlayerOne: boolean = playerNumber === 1;
        const isPlayerTwo: boolean = playerNumber === 2;
        const playerOneInGame: boolean = this.table.playerOne.hasJoined;
        const playerTwoInGame: boolean = this.table.playerTwo.hasJoined;
        const bothPlayersInGame: boolean = playerOneInGame && playerTwoInGame;

        const playerOneHasBet: boolean = this.table.playerOne.currentBet > 0;
        const playerTwoHasBet: boolean = this.table.playerTwo.currentBet > 0;
        const bothPlayersHaveBet: boolean = playerOneHasBet && playerTwoHasBet;

        if (isPlayerOne) {
            // console.log("IS Player One: ", isPlayerOne);
            this.table.playerOne.isReady = true;
        } else if (isPlayerTwo) {
            if (playerTwoHasBet) {
                this.table.playerOne.isReady = true;
            } else {
                this.table.messages.push('Player Two must place bet');
            }
        } else {
            // console.log("Error: Neither Player Selected");
        }

        if (bothPlayersInGame) {
            if (bothPlayersHaveBet) {
                this.table.readyToDeal = true;
            } else {
                if (!playerOneHasBet) this.table.messages.push('Player One Must Bet');
                if (!playerTwoHasBet) this.table.messages.push('Player Two Must Bet');
            }
        } else {
            if (isPlayerOne) {
                this.table.readyToDeal = true;
                this.table.playerOne.isActive;
            } else if (isPlayerTwo) {
                this.table.readyToDeal = true;
            }
        }

        this.sendToAllPlayers(this.table, playerNumber);
    }

    public deal(): void {

        if (this.table.isGameOver) {
            this.table.playerOne.currentHand = [];
            this.table.playerTwo.currentHand = [];
            this.table.dealer.cards = [];
            this.table.playerOne.currentHandValue = 0;
            this.table.playerTwo.currentHandValue = 0;
            this.table.dealer.currentHandValue = 0;
            this.table.playerOne.hasBlackjack = undefined;
            this.table.playerOne.hasWon = undefined;
            this.table.playerOne.hasPushed = undefined;
            this.table.playerOne.hasBusted = undefined;
            this.table.playerTwo.hasBlackjack = undefined;
            this.table.playerTwo.hasWon = undefined;
            this.table.playerTwo.hasPushed = undefined;
            this.table.playerTwo.hasBusted = undefined;
            this.table.dealer.hasBlackjack = false;
            this.table.dealer.hasBusted = false;
            this.table.playerOne.isActive = true;
        }

        const playerOneActive: boolean = this.table.playerOne.isReady;
        const playerTwoActive: boolean = this.table.playerTwo.isReady;
        const moreThan20Cards: boolean = this.cards.length > 20;
        if (!moreThan20Cards) this.cards = this.rollDecks();

        // Card One
        if (playerOneActive) this.table.playerOne.currentHand.push(this.cards.shift() ?? '');
        if (playerTwoActive) this.table.playerOne.currentHand.push(this.cards.shift() ?? '');
        this.table.dealer.cards.push(this.cards.shift() ?? '');

        // Card Two
        if (playerOneActive) this.table.playerOne.currentHand.push(this.cards.shift() ?? '');
        if (playerTwoActive) this.table.playerOne.currentHand.push(this.cards.shift() ?? '');
        this.table.dealer.cards.push(this.cards.shift() ?? '');
        // console.log("P1: ", this.table.playerOne.currentHand)
        // console.log("P2: ", this.table.playerTwo.currentHand)
        // console.log("DE: ", this.table.dealer.cards)
        this.updateCardValues();
        this.table.isGameActive = true;
        if (playerOneActive) {
            this.table.playerOne.isActive = true;
        } else if (playerTwoActive) {
            this.table.playerTwo.isActive = true;
        }
        this.sendToAllPlayers(this.table, 0);
    }

    private updateCardValues(): void {
        this.updatePlayerOneValues();
        this.updatePlayerTwoValues();
        this.updateDealerValues();
    }

    private updatePlayerOneValues(): void {
        let updatedValue: number = 0;
        for (let i = 0; i < this.table.playerOne.currentHand.length; i++) {
            let currentCard: string = this.table.playerOne.currentHand[i];
            // console.log("Current Card V: ", currentCard);
            if (['Q', 'K', 'J'].includes(currentCard[0])) {
                // console.log("FACE");
                updatedValue += 10;
            } else if (currentCard[0] === 'A') {
                // console.log("ACE");
                updatedValue += 11;
            } else if (currentCard.length === 3) {
                updatedValue += 10;
            } else {
                // // console.log("NUM");
                updatedValue += parseInt(currentCard[0]);
            }
            // // console.log("Value IN LOOP: ", this.table.playerOne.currentHandValue)
        }
        this.table.playerOne.currentHandValue = updatedValue;
        // // console.log("Value: ", this.table.playerOne.currentHandValue)
        if (this.table.playerOne.currentHandValue < 21) {
            // console.log("");
        } else if (this.table.playerOne.currentHandValue === 21) {
            if (this.table.playerOne.currentHand.length === 2) {
                this.table.playerOne.hasBlackjack = true;
                this.table.playerOne.isActive = false;
            } else {
                this.table.playerOne.isActive = false;
            }
        } else if (this.table.playerOne.currentHandValue > 21) {
            for (let i = 0; i < this.table.playerOne.currentHand.length; i++) {
                const currentCard: string = this.table.playerOne.currentHand[i];
                // console.log("Current Card: ", currentCard);
                if (currentCard[0] === 'A') {
                    this.table.playerOne.currentHandValue -= 10;
                    break;
                }
            }
        } else {

        }

        if (this.table.playerOne.currentHandValue > 21) {
            this.table.playerOne.hasBusted = true;
        }

        // if (this.table.playerTwo.name.length === 0 || !this.table.playerOne.isActive) {
        //     this.runDealer();
        // }
    }

    private updatePlayerTwoValues(): void {
        for (let i = 0; i < this.table.playerTwo.currentHand.length; i++) {
            const currentCard: string = this.table.playerTwo.currentHand[i];
            if (['Q', 'K', 'J'].includes(currentCard[0])) {
                this.table.playerTwo.currentHandValue += 10;
            } else if (currentCard[0] === 'A') {
                this.table.playerTwo.currentHandValue += 11;
            } else if (currentCard.length === 3) {
                this.table.playerTwo.currentHandValue += 10;
            } else {
                this.table.playerTwo.currentHandValue += parseInt(currentCard[0]);
            }
        }

        if (this.table.playerTwo.currentHandValue === 21) {
            if (this.table.playerTwo.currentHand.length === 2) {
                this.table.playerOne.hasBlackjack = true;
                this.table.playerTwo.isActive = false;
            } else {
                this.table.playerTwo.isActive = false;
            }
        } else if (this.table.playerOne.currentHandValue > 21) {
            for (let i = 0; i < this.table.playerTwo.currentHand.length; i++) {
                const currentCard: string = this.table.playerTwo.currentHand[i];
                if (currentCard[0] === 'A') {
                    this.table.playerTwo.currentHandValue -= 10;
                    break;
                }
            }
        } else {

        }
        if (this.table.playerOne.currentHandValue > 21) {
            this.table.playerOne.hasBusted = true;
        }
    }

    private updateDealerValues(): void {
        let updatedValue: number = 0;
        for (let i = 0; i < this.table.dealer.cards.length; i++) {
            const currentCard: string = this.table.dealer.cards[i];
            if (['Q', 'K', 'J'].includes(currentCard[0])) {
                updatedValue += 10;
            } else if (currentCard[0] === 'A') {
                updatedValue += 11;
            } else if (currentCard.length === 3) {
                updatedValue += 10;
            }  else {
                updatedValue += parseInt(currentCard[0]);
            }
        }
        this.table.dealer.currentHandValue = updatedValue;

        if (this.table.dealer.currentHandValue === 21) {
            if (this.table.dealer.cards.length === 2) {
                this.table.dealer.hasBlackjack = true;
                this.table.dealer.isActive = false;
                this.runWinners();
            } else {
                this.table.dealer.isActive = false;
            }
        } else if (this.table.dealer.currentHandValue > 21) {
            for (let i = 0; i < this.table.dealer.cards.length; i++) {
                const currentCard: string = this.table.dealer.cards[i];
                // console.log("Current Card: ", currentCard);
                if (currentCard) {
                    if (currentCard[0] === 'A') {
                    this.table.dealer.currentHandValue -= 10;
                    break;
                  }
                }
            }
        } else if (this.table.dealer.currentHandValue >= 17) {
            this.table.dealer.isActive = false;
        } else {
            
        }

        if (this.table.dealer.currentHandValue > 21) {
            this.table.dealer.hasBusted = true;
        }
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
        // console.log("Cards: ", cards);
        // console.log("Cards L: ", cards.length);
        return cards;
    }

    public hit(playerNumber: number): void {
        if (playerNumber === 1) {
            this.table.playerOne.currentHand.push(this.cards.shift() ?? '');
            this.updateCardValues();
        } else if (playerNumber === 2) {
            this.table.playerTwo.currentHand.push(this.cards.shift() ?? '');
            this.updateCardValues();
        }

        this.sendToAllPlayers(this.table, playerNumber);
    }

    public stand(playerNumber: number): void {
        if (playerNumber === 1) {
            this.table.playerOne.isActive = false;
            this.table.playerTwo.isActive = true;
        } else if (playerNumber === 2) {
            this.table.playerTwo.isActive = false;
            this.table.dealer.isActive = true;
        }

        // this.sendToAllPlayers(this.table);

        if (playerNumber === 1 && this.table.playerTwo.name.length === 0) {
            this.runDealer();
        } else if (playerNumber === 2) {
            this.runDealer();
        }
    }

    public drawCard(): void {
        let newCard: string = this.cards.shift() ?? '';
        let cards: string[] = this.table.dealer.cards;
        cards.push(newCard);
        this.table.dealer.cards = cards;
    }

    public runDealer(): void {
        
        while (this.table.dealer.currentHandValue < 17) {
            this.drawCard();
            this.updateDealerValues();
        }

        this.runWinners();

        this.sendToAllPlayers(this.table, 0);
    }

    private runWinners(): void {
        this.table = this.checkPlayerOneWinner();
        this.table = this.checkPlayerTwoWinner();
        this.table.isGameOver = true;
        this.table.isGameActive = false;
    }

    private checkPlayerOneWinner(): ITable {
        if (this.table.dealer.hasBusted) {
            if (!this.table.playerOne.hasBusted) {
                this.table.playerOne.hasWon = true;
                this.table.playerOne.hasBusted = false;
                this.table.playerOne.hasBlackjack = false;
                this.table.playerOne.hasPushed = false;
                this.table.playerOne.balance += this.table.playerOne.currentBet;
                this.table.playerOne.currentBet = 0;
            }
        } else if (this.table.playerOne.hasBusted) {
            this.table.playerOne.hasWon = false;
            this.table.playerOne.hasBusted = true;
            this.table.playerOne.hasBlackjack = false;
            this.table.playerOne.hasPushed = false;
            this.table.playerOne.balance -= this.table.playerOne.currentBet;
            this.table.playerOne.currentBet = 0;
        } else if (this.table.playerOne.hasBlackjack) {
            this.table.playerOne.hasWon = true;
            this.table.playerOne.hasBusted = false;
            this.table.playerOne.hasBlackjack = true;
            this.table.playerOne.hasPushed = false;
            this.table.playerOne.balance += Math.round((3/2) * this.table.playerOne.currentBet);
            this.table.playerOne.currentBet = 0;
        } else {
            if (this.table.dealer.currentHandValue === this.table.playerOne.currentHandValue) {
                this.table.playerOne.hasWon = false;
                this.table.playerOne.hasBusted = false;
                this.table.playerOne.hasBlackjack = false;
                this.table.playerOne.hasPushed = true;
                this.table.playerOne.currentBet = 0;
            } else if (this.table.dealer.currentHandValue > this.table.playerOne.currentHandValue) {
                this.table.playerOne.hasWon = false;
                this.table.playerOne.hasBusted = false;
                this.table.playerOne.hasBlackjack = false;
                this.table.playerOne.hasPushed = false
                this.table.playerOne.balance -= this.table.playerOne.currentBet;
                this.table.playerOne.currentBet = 0;;
            } else {
                this.table.playerOne.hasWon = true;
                this.table.playerOne.hasBusted = false;
                this.table.playerOne.hasBlackjack = false;
                this.table.playerOne.hasPushed = true;
                this.table.playerOne.balance += this.table.playerOne.currentBet;
                this.table.playerOne.currentBet = 0;
            }
        }
        return this.table;
    }

    private checkPlayerTwoWinner(): ITable {
        if (this.table.dealer.hasBusted) {
            if (!this.table.playerTwo.hasBusted) this.table.playerTwo.hasWon = true;
        } else if (this.table.playerTwo.hasBusted) {
            this.table.playerTwo.hasWon = false;
        } else if (this.table.playerTwo.hasBlackjack) {
            this.table.playerTwo.hasWon = true;
        } else {
            if (this.table.dealer.currentHandValue === this.table.playerTwo.currentHandValue) {
                this.table.playerTwo.hasPushed = true;
            } else if (this.table.dealer.currentHandValue > this.table.playerTwo.currentHandValue) {
                this.table.playerTwo.hasWon = false;
            } else {
                this.table.playerTwo.hasWon = true;
            }
        }
        return this.table;
    }

    public bet(playerNumber: number, bet: number): void {
        const isPlayerOne: boolean = playerNumber === 1;
        const isPlayerTwo: boolean = playerNumber === 2;
        
        if (playerNumber === 1) {
            const hasFunds: boolean = this.table.playerOne.balance - bet > 0;
            if (hasFunds) {
                this.table.playerOne.currentBet += bet;
            }
        }
        console.log(this.table.playerOne)
        this.sendToAllPlayers(this.table, playerNumber);
    }
}

export default new Game();