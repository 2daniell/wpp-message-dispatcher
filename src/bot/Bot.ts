import makeWASocket, { useMultiFileAuthState, WASocket } from "baileys";
import { Logger } from "../util/Logger";
import path from 'path'
import { BotHandler } from "../core/BotHandler";

export class Bot {

    private instanceName: string;
    private sessionPath: string;
    private sock?: WASocket
    private handler?: BotHandler
    private logger: Logger

    public constructor(instanceName: string, basePath: string) {
        this.instanceName = instanceName;
        this.sessionPath = path.join(basePath, 'sessions', instanceName)
        this.logger = new Logger(instanceName, basePath)
    }

    public async start() {

        const { state, saveCreds } = await useMultiFileAuthState(this.sessionPath);

        this.sock = makeWASocket({
            auth: state,
            printQRInTerminal: true,
            browser: ['Windows', 'Chrome', '110.0.5481.100']
        })

        this.handler = new BotHandler(this.sock, this.logger);
    }



}