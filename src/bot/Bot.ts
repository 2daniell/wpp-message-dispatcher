import makeWASocket, { DisconnectReason, GroupMetadata, WASocket } from "baileys";
import path from 'path'
import { BotHandler } from "../core/BotHandler";
import Pino from 'pino'
import { useSQLiteAuth } from "../auth/SQLiteAuth";
import { BotStatus } from "./BotStatus";

export class Bot {

    public static ALLOWED_GROUP: string = "Compartilha NT"

    private instanceName: string;
    private status: BotStatus;
    private sock?: WASocket
    private handler?: BotHandler
    private groups: GroupMetadata[] = [];

    public constructor(instanceName: string) {
        this.instanceName = instanceName;
    }

    public async start() {

        this.status = BotStatus.STARTING

        const { state, saveCreds } = await useSQLiteAuth(this.instanceName)

        const logger = Pino({
            level: "silent"
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

    public getStatus(): BotStatus {
        return this.status;
    }

    public setStatus(status: BotStatus): void {
        this.status = status;
    }

}