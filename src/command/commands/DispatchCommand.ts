import { WAMessage, WAMessageContent } from "baileys";
import { Bot } from "../../bot/Bot";
import sleep from "../../util/Sleep";
import { CommandExecutor } from "../../command/CommandExecutor";

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
            this.bot.getSock().sendMessage(message.key.remoteJid!, { text: "❌ Não foi possível encontrar uma mensagem mencionada!" }, { quoted: message });
            return;
        }

        await this.bot.getSock().sendMessage(message.key.remoteJid!, { text: "✅ Iniciando processo de envio!\n*Aguarde até que o processamento seja concluído*" }, { quoted: message });

        await sleep(1000 * 3);

        const totalGroups = this.bot.getGroups().length;


        const maxTime = 30 * 60 * 1000;
        const maxGroups = 600;


        const timePerGroup = (totalGroups <= maxGroups)
            ? maxTime / maxGroups
            : (totalGroups / maxGroups) * maxTime;

        const pauseDuration = Math.max(timePerGroup / 1000, 1000);
        let counter = 0;

        console.log(`Total de grupos: ${totalGroups}`);
        console.log(`Pausa entre mensagens: ${pauseDuration / 1000} segundos`);

        const batchSize = 100;
        const delayBetweenBatches = 5 * 60 * 1000;

        for (let i = 0; i < totalGroups; i += batchSize) {
            const batch = this.bot.getGroups().slice(i, i + batchSize);
            for (const group of batch) {
                try {
                    await this.bot.getSock().sendMessage(group.id!, { forward: { key: key, message: msg } });
                    console.log(`Mensagem enviada para: ${group.subject}`);
                } catch (error) {
                    console.error(`Erro ao enviar para o grupo: ${group.subject}`, error);
                }

                counter++;
                console.log(`Grupos restantes: ${totalGroups - counter}`);

                await sleep(pauseDuration);
            }

            console.log(`Aguardando ${delayBetweenBatches / 1000 / 60} minutos antes de enviar o próximo lote.`);
            await sleep(delayBetweenBatches);
        }

        await sleep(1000 * 5);
        console.log("Envio finalizado com sucesso!");
        this.bot.getSock().sendMessage(message.key.remoteJid!, { text: "✅ Envio concluído com sucesso!" }, { quoted: message });
    }
}
