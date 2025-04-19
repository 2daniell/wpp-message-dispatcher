import { WAMessage, WASocket } from "baileys";
import { CommandExecutor } from "./CommandExecutor";
import PQueue from "p-queue";

export class CommandProcessor {

    private commands: Map<string, CommandExecutor> = new Map();
    private commandQueue: PQueue = new PQueue({ concurrency: 1 })
    private sock: WASocket;

    public constructor(sock: WASocket) {
        this.sock = sock;
    }

    public register(command: string, executor: CommandExecutor) {
        this.commands.set(command, executor);
    }

    public async addCommandQueue(message: WAMessage) {
        this.commandQueue.add(async () => await this.processCommand(message))
    }

    private async processCommand(message: WAMessage) {
        try {

            if (message.key.fromMe) return

            const text = message.message?.conversation
            || message.message?.extendedTextMessage?.text
            || undefined;

            if (!text) return

            const args = text.trim().split(/\s+/);
            const commandName = args[1]?.toLowerCase(); //Modelo: @Bot status

            if (commandName && this.commands.has(commandName)) {

                const executor = this.commands.get(commandName);

                if (executor) {
                    try {
                        console.log(`Comando ${commandName.toUpperCase()} adicionado sendo executado!`)
                        await executor.execute(message);
                    } catch(err) {
                        console.log("Erro ao processar comando(5)" + err)
                    }
                }
            } else {
                await this.sock.sendMessage(message.key.remoteJid!, {
                    text: `❌ Comando não encontrado.`
                })
            }
        } catch(err) {
            console.log(err)
        }
    }

}