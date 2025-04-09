import makeWASocket, { DisconnectReason, GroupMetadata, WASocket } from "baileys";
import path from 'path'
import { BotHandler } from "../core/BotHandler";
import Pino from 'pino'
import { useSQLiteAuth } from "../auth/SQLiteAuth";

export class Bot {

    public static ALLOWED_GROUP: string = "Testingbot A" //"Compartilha NT"

    private instanceName: string;
    private sock?: WASocket
    private handler?: BotHandler
    private groups: GroupMetadata[] = [];

    public constructor(instanceName: string) {
        this.instanceName = instanceName;
    }

    public async start() {

        const { state, saveCreds } = await useSQLiteAuth(this.instanceName)

        const logger = Pino({
            level: 'error'
          });

        this.sock = makeWASocket({
            auth: state,
            printQRInTerminal: true,
            logger: logger,
            browser: ['Windows', 'Chrome', '110.0.5481.100'],
        })

        this.sock.ev.on('creds.update', saveCreds);
          
        this.handler = new BotHandler(this);
    }

    public getSock(): WASocket {
        return this.sock;
    }
    
    public getHandler(): BotHandler {
        return this.handler;
    }

    public getGroups(): GroupMetadata[] {
        return this.groups;
    }

    public setGroups(groups: GroupMetadata[]): void {
        this.groups = groups;
    }


}