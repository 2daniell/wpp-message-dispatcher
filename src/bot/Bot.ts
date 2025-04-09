import makeWASocket, { DisconnectReason, WASocket } from "baileys";
import path from 'path'
import { BotHandler } from "../core/BotHandler";
import { Boom } from '@hapi/boom'
import Pino from 'pino'
import { useSQLiteAuth } from "../auth/SQLiteAuth";

export class Bot {

    public static ALLOWED_GROUP: string = "Compartilha NT"

    private instanceName: string;
    private sock?: WASocket
    private handler?: BotHandler

    public constructor(instanceName: string) {
        this.instanceName = instanceName;
    }

    public async start() {

        const { state, saveCreds } = await useSQLiteAuth(this.instanceName)

        this.sock = makeWASocket({
            auth: state,
            printQRInTerminal: true,
            browser: ['Windows', 'Chrome', '110.0.5481.100'],
        })

        this.sock.ev.on('creds.update', saveCreds);

        this.sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect } = update 
            if(connection === 'close') { 
                if((lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut) { 
                    this.start() 
                } else { 
                    console.log('Connection closed. You are logged out.') 
                } 
            } 
        })
          
        this.handler = new BotHandler(this);
    }

    public getSock(): WASocket {
        return this.sock;
    }
    
    public getHandler(): BotHandler {
        return this.handler;
    }


}