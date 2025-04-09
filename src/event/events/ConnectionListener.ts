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

            const groupsMap = await this.bot.getSock().groupFetchAllParticipating();
            
            const groups = Object.values(groupsMap).filter(group =>
            group.announce !== true &&
            group.size > 1 &&
            group.isCommunityAnnounce !== true &&
            group.subject.trim() !== Bot.ALLOWED_GROUP && group.subject.trim().startsWith("Testingbot")
            );

            this.bot.setGroups(groups);

            console.log("Grupos encontrados: " + this.bot.getGroups().length);

        } else if (connection === "connecting") {
            console.log("Conectando...");
        }

    }

}