import { ConnectionState, DisconnectReason } from "baileys";
import { Bot } from "../../bot/Bot";
import { Listener } from "../Listener";
import { Boom } from "@hapi/boom";
import sleep from "../../util/Sleep";
import { BotStatus } from "../../bot/BotStatus";

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
            
            await sleep(1000 * 60 * 5)

            const groupsMap = await this.bot.getSock().groupFetchAllParticipating();
            
            const groups = Object.values(groupsMap).filter(group =>
            group.announce !== true &&
            group.size > 1 &&
            group.isCommunityAnnounce !== true &&
            group.subject.trim() !== Bot.ALLOWED_GROUP);

            this.bot.setGroups(groups);
            
            console.log("Grupos encontrados: " + this.bot.getGroups().length);
            console.log("✅ Bot conectado e pronto!");

            this.bot.setStatus(BotStatus.READY)

        } else if (connection === "connecting") {
            console.log("Conectando...");
            console.log("Aguarde até que o processamento esteja concluido, esse processo demora 5 minutos!");
        }

    }

}