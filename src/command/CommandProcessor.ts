import { WAMessage, WASocket } from "baileys";
import { Logger } from "../util/Logger";
import { CommandExecutor } from "./CommandExecutor";

export class CommandProcessor {

    private static commands: Map<string, CommandExecutor> = new Map();
    private logger: Logger
    private sock: WASocket;

    public constructor(logger: Logger, sock: WASocket) {
        this.logger = logger;
        this.sock = sock;
    }

    public static register(command: string, executor: CommandExecutor) {
        this.commands.set(command, executor);
    }

    public async process(message: WAMessage) {
        try {

            if (message.key.fromMe) return

            const text = message.message?.conversation
            || message.message?.extendedTextMessage?.text
            || undefined;

            if (!text) return

            const args = text.trim().split(/\s+/);
            const commandName = args[1]?.toLowerCase(); //Modelo: @Bot status

            if (commandName && CommandProcessor.commands.has(commandName)) {

                const executor = CommandProcessor.commands.get(commandName);

                if (executor) {
                    try {
                        await executor.execute(message);
                    } catch(err) {
                        this.logger.error(`Ocorreu um erro ao processar comando(err2) ${err}`)
                    }
                }
            } else {
                await this.sock.sendMessage(message.key.remoteJid!, {
                    text: `❌ Comando não encontrado.`
                })
            }
        } catch(err) {
            this.logger.error(`Ocorreu um erro ao processar comando(err1) ${err}`)
        }
    }

}