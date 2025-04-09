import { WAMessage } from "baileys";
import { CommandExecutor } from "../CommandExecutor";
import sleep from "../../util/Sleep";

export class StatusCommand implements CommandExecutor {

    public async execute(message: WAMessage): Promise<void> {
        try {

            await sleep(1000 * 2);
            

        } catch(err) {

        }
    }
}