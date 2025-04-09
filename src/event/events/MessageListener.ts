import { MessageUpsertType, WAMessage, WASocket } from "baileys";
import { Listener } from "../Listener";
import { Bot } from "../../bot/Bot";

export class MessageListener implements Listener<any[]> {

    private bot: Bot;

    public constructor(bot: Bot) {
        this.bot = bot;
    }

    public async handle([messages, type]: [WAMessage[], MessageUpsertType]): Promise<void> {
        if (type !== "notify") return;

        for (const message of messages) {

            if (message.key.fromMe) continue;

            const jid = message.key.remoteJid;

            const isGroup = jid?.endsWith("@g.us");
            if (!isGroup) continue;

            const groupMetadata = await this.bot.getSock().groupMetadata(jid!);
            const groupName = groupMetadata.subject;

            if (groupName.trim() !== Bot.ALLOWED_GROUP) continue

            const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            const botJid = this.bot.getSock().user?.id;

            if (!mentions?.includes(botJid!)) continue;

            this.bot.getHandler().getCMDProcessor().addCommandQueue(message);
            
        }
    }

}