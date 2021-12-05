import { WebSocket } from "ws";

export interface Player {
    id: string;
    name: string;
    balance: number;
    cards: number[];
    isActive: false;
    ws?: WebSocket;
}

export interface Table {
    id: number;
    players: Player[];
    timer: number;
    gameStatus: string; // ACTIVE (When Over -> Over) | OVER (Start Time -> Reset) | RESET (Timer Running)
    currentHand: Hand;
    hands: Hand[];
    cards: string[]; // 4 Decks
    cardsUsed: string[];
}

export interface Hand {
    dealer: string[];
    players: PlayerInGame[];
    status: number; // Player Number Up or -1 for Dealer
}

export interface PlayerInGame {
    playerId: string;
    inGame: boolean;
    cards: string[];
    bet: string[];
    actions: string[]; // HIT | STAND | DOUBLE
}

export interface GameRequest {
    action: string;
    roomId: string;
}

export interface GameResponse {
    action: string;
    roomId: string;
    message: string;
    table?: Table | string;
}

export interface AddUserRequest extends GameRequest {
    playerId: string;
}

export interface AddUserWs extends GameRequest {
    data: {
        playerId: string;
    };
}

export interface BetweenGames extends GameResponse {
    timer: number;
}