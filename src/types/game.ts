import { WebSocket } from "ws";

export interface IPlayer {
    name: string;
    balance: number;
    currentBet: number;
    currentHand: string[];
    currentHandValue: number;
    isActive: boolean;
    isReady: boolean;
    hasWon?: boolean;
    hasBusted?: boolean;
    hasJoined: boolean;
    hasBlackjack?: boolean;
    hasPushed?: boolean;
    ws?: WebSocket;
}

export interface ITable {
    playerOne: IPlayer;
    playerTwo: IPlayer;
    dealer: IDealer;
    isGameActive: boolean;
    isPlayerOneTurn: boolean;
    isPlayerTwoTurn: boolean;
    isDealerTurn: boolean;
    isGameOver: boolean;
    isDealing: boolean;
    messages: string[];
    readyToDeal: boolean;
}

export interface IAction {
    user: string; // Player One, Player Two, Dealer
    action: string; // Hit, Stood
}

export interface IDealer {
    cards: string[];
    isActive: boolean;
    hasBlackjack: boolean;
    hasBusted: boolean;
    currentHandValue: number;
}

export interface GameRequest {
    action: string;
    name: string;
    playerNumber?: number;
    bet?: number;
}

export interface GameResponse {
    action: string;
    roomId: string;
    message: string;
    table?: ITable | string;
}

export interface AddUserResponse extends GameResponse {
    player: IPlayer;
}

export interface AddUserRequest extends GameRequest {
    playerId: string;
}

export interface UserHitRequest extends GameRequest {
    playerId: string;
}

export interface UserBetAction extends GameRequest {
    playerId: string;
    betAmount: number;
}

export interface AddUserWs extends GameRequest {
    data: {
        playerId: string;
    };
}

export interface BetweenGames extends GameResponse {
    timer: number;
}