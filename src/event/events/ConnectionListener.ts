import { ConnectionState, DisconnectReason } from "baileys";
import { Bot } from "../../bot/Bot";
import { Listener } from "../Listener";
import { Boom } from "@hapi/boom";

export class ConnectionListener implements Listener<any> {

    private bot: Bot;

    public constructor(bot: Bot) {
      this.bot = bot;
    }

    public async handle(update: Partial<ConnectionState>): Promise<void> {
        
        const { connection, lastDisconnect } = update;

        if (connection === "close") {
            const shouldReconnect =
                (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;

            if (shouldReconnect) {
                this.bot.start();
            } else {
                console.log("Conexão fechada. Você esta deslogado!");
            }
        } else if (connection === "open") {
            console.log("✅ Bot conectado e pronto!");
        } else if (connection === "connecting") {
            console.log("Conectando...");
        }

    }

}