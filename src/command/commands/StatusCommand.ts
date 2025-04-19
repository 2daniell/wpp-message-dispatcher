import { WAMessage, WASocket } from "baileys";
import { CommandExecutor } from "../CommandExecutor";
import sleep from "../../util/Sleep";

export class StatusCommand implements CommandExecutor {

    private sock: WASocket;

    public constructor(sock: WASocket) {
        this.sock = sock;
    }

    public async execute(message: WAMessage): Promise<void> {
        try {

            await sleep(1000 * 2);

            const jid = message.key.remoteJid!;

            console.log("ENVIANDO")
            await this.sock.sendMessage(jid, {
                text: "✅ Bot online e funcionando!",
            }, { quoted: message })
            console.log("ENVIADO")
        } catch(err) {
            console.error("Erro ao executar comando status:", err);
        }
    }
}