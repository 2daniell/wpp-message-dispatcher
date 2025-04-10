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
            this.bot.getSock().sendMessage(message.key.remoteJid!, { text: "❌ Não foi possível encontrar uma mensagem mencionada!" }, { quoted: message });
            return;
        }

        await this.bot.getSock().sendMessage(message.key.remoteJid!, { text: "✅ Iniciando processo de envio!\n*Aguarde até que o processamento seja concluído*" }, { quoted: message });

        await sleep(1000 * 3);

        const totalGroups = this.bot.getGroups().length;

        let counter = 0;

        console.log(`Total de grupos: ${totalGroups}`);

        const batchDelay = 2 * 60 * 1000;
        const batchSize = 100;
        const totalBatches = Math.ceil(totalGroups / batchSize);

        for (let batch = 0; batch < totalBatches; batch++) {
            const startGroup = batch * batchSize;
            const endGroup = Math.min((batch + 1) * batchSize, totalGroups);
            console.log(`Enviando batch ${batch + 1} de ${totalBatches}...`);

            for (let i = startGroup; i < endGroup; i++) {

                const randomDelay = Math.random() * (4 - 1) + 1;
                const group = this.bot.getGroups()[i];
                
                try {
                    await this.bot.getSock().sendMessage(group.id!, { forward: { key: key, message: msg } });
                    console.log(`Mensagem enviada para: ${group.subject}`);
                } catch (error) {
                    console.error(`Erro ao enviar para o grupo: ${group.subject}`, error);
                }
                
                counter++;
                console.log(`Grupos restantes: ${totalGroups - counter}`);
                await sleep(randomDelay * 1000);
                
            }

            if (batch < totalBatches - 1) {
                console.log(`Aguardando ${batchDelay / 1000 / 60} minutos antes de começar o próximo batch...`);
                await sleep(batchDelay);
            }
        }

        await sleep(1000 * 5);
        console.log("Envio finalizado com sucesso!");
        this.bot.getSock().sendMessage(message.key.remoteJid!, { text: "✅ Envio concluído com sucesso!" }, { quoted: message });
    }
}
