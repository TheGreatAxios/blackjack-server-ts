import { table } from "console";
import { createWriteStream } from "fs";
import { Duplex, Stream } from "stream";

interface Player {
    id: string;
    name: string;
    balance: number;
    cards: number[],
    isActive: false
}

interface Table {
    id: number;
    players: Player[];
    timer: number;
    isActive: boolean;
}

class Game {
    private tables: Table[] = [];
    private players: Player[] = [];
    // public tableStream: Duplex;

    constructor() {
        console.log("GAME INIT")
        // this.tableStream = new Duplex();
        // this.tableStream._write =
        // function (chunk: any, enc: any, cb: any) {
        //   cb();
        // }
        // this.tableStream._read = function readBytes(n) {};
        // this.tableStream.pipe()
    }

    private addTable(): void  {
        const tableLength: number = this.tables.length;
        const table: Table = {
            id: tableLength + 1,
            players: [],
            timer: 100,
            isActive: true
        };
        this.tables.push(table);
        // this.tableStream.write('Data');
        // this.tableStream.on('data', (data) => {
        //     var chunk;
        //     while (null !== (chunk = this.tableStream.read())) {
        //         console.log('read: ', chunk.toString());
        //     }
        // })
    }

    private tableAvailable = () : boolean => {
        if (this.tables.length === 0) {
            return false;
        } else {
            this.tables.forEach((table: Table) => {
                if (table.players.length >= 5) {
                    return false;
                }
            })
        }
        return true;
    }

    public addPlayer = (id: string, name: string): void => {
        let player: Player = {
            id: id,
            name: name,
            balance: 1000,
            cards: [],
            isActive: false
        };
        const tableOpen: boolean = this.tableAvailable();
        if (!tableOpen) {
            this.addTable();
        }

        this.players.push(player);
        this.tables[this.tables.length -1].players.push(player);
        console.log(this.tables);
    }
}

export default new Game();