import path from "path"
import { Bot } from "./Bot";
import { BotDTO, BotStatusText, toDTO } from "../dto/BotDTO";
import { Database } from "sqlite3";
import { BrowserWindow } from "electron";

export class BotManager {

    private static db: Database;
    private static bots: Map<string, Bot> = new Map();
    private static win: BrowserWindow | null = null;

    public static setWindowRef(w: BrowserWindow) {
        BotManager.win = w;
    }

    public static async start(instanceName: string, onQr?: (qr: string) => void, onReady?: () => void) {
        if (this.bots.has(instanceName)) return;

        const bot = new Bot(instanceName, onQr, onReady)
        this.bots.set(instanceName, bot);
        this.db.run('INSERT OR IGNORE INTO bots (name) VALUES (?)', [instanceName]);
        await bot.start()

        bot.on('statusChanged', (newStatus) => {
            BotManager.win?.webContents.send('update-status', {
              botName: bot.getInstanceName(),
              status: BotStatusText[newStatus].toUpperCase(),
            });
        });
    }

    public static async initDatabase() {
        return new Promise<void>((resolve, reject) => {
            this.db = new Database('./bots.db', (err) => {
                if (err) return reject(err);
    
                this.db.run('CREATE TABLE IF NOT EXISTS bots (name TEXT PRIMARY KEY)', (err2) => {
                    if (err2) return reject(err2);
                    resolve();
                });
            });
        });
    }    

    public static async loadPersistedBots() {
        return new Promise<void>((resolve, reject) => {
            this.db.all('SELECT name FROM bots', (err, rows: { name: string }[]) => {
                if (err) reject(err);
                rows.forEach(row => {
                    BotManager.start(row.name);
                });
                resolve();
            });
        });
    }

    public static getBots(): BotDTO[] {
        return Array.from(this.bots.values()).map(toDTO);
    }

}