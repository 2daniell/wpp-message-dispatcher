import { WAMessage, WAMessageContent } from "baileys";
import { CommandExecutor } from "../CommandExecutor";
import { Bot } from "../../bot/Bot";
import sleep from "../../util/Sleep";

export class DispatchCommand implements CommandExecutor {

    private bot: Bot;

    public constructor(bot: Bot) {
        this.bot = bot;
    }

    public async execute(message: WAMessage): Promise<void> {

        const quotedMessage = message.message.extendedTextMessage?.contextInfo?.quotedMessage;

        const key = quotedMessage as WAMessage;
        const msg = quotedMessage as WAMessageContent;

        if (!quotedMessage) {
            this.bot.getSock().sendMessage(message.key.remoteJid!, { text: "❌ Não foi possivel encontrar uma mensagem mencionada!" }, { quoted: message})
            return
        }

        await this.bot.getSock().sendMessage(message.key.remoteJid!, { text: "✅ Iniciando processo de envio!" }, { quoted: message})

        await sleep(1000 * 3)

        const totalMessages = this.bot.getGroups().length
        let pauseDuration = 0;

    
        if (totalMessages < 200) {
            pauseDuration = 600 / totalMessages * 1000;
        } else if (totalMessages >= 200 && totalMessages < 600) {
            pauseDuration = 1200 / totalMessages * 1000;
        } else if (totalMessages  >= 600) {
            pauseDuration = 1800 / totalMessages * 1000;
        }

        for (const group of this.bot.getGroups()) {
            await this.bot.getSock().sendMessage(group.id!, { forward: {
                key: key,
                message: msg
            }})

            console.log(`Mensagem enviada para: ${group.subject}`)
            await sleep(pauseDuration);
        }

        await sleep(1000 * 5);
        this.bot.getSock().sendMessage(message.key.remoteJid!, { text: "✅ Envio concuido com sucesso!" }, { quoted: message})
    }
}
