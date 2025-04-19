import { MessageUpsertType, WAMessage, WASocket } from "baileys";
import { Listener } from "../Listener";
import { Bot } from "../../bot/Bot";
import { BotStatus } from "../../bot/BotStatus";

export class MessageListener implements Listener<any[]> {

    private bot: Bot;

    public constructor(bot: Bot) {
        this.bot = bot;
    }

    public async handle([messages, type]: [WAMessage[], MessageUpsertType]): Promise<void> {
        if (type !== "notify" || this.bot.getStatus() === BotStatus.STARTING) return;

        for (const message of messages) {
            
            if (message.key.fromMe) continue;
            
            const jid = message.key.remoteJid;
            
            const isGroup = jid?.endsWith("@g.us");
            if (!isGroup) continue;

            const groupMetadata = await this.bot.getSock().groupMetadata(jid!);
            const groupName = groupMetadata.subject;

            if (groupName.trim() !== Bot.ALLOWED_GROUP) continue

            const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            const botJid = this.bot.getSock().user.id;

            const botPhoneNumber = botJid?.match(/^(\d{8,15})/)?.[1];

            const mentionedBot = mentions?.some(mention => {
                const mentionPhoneNumber = mention.match(/^(\d{8,15})/)?.[1];
                return mentionPhoneNumber === botPhoneNumber;
            });

            if (!mentionedBot) continue;

            this.bot.getHandler().getCMDProcessor().addCommandQueue(message);
            
        }
    }

}