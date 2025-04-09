import { WASocket } from "baileys";
import { CommandProcessor } from "../command/CommandProcessor";
import { EventProcessor } from "../event/EventProcessor";
import { Logger } from "../util/Logger";

export class BotHandler {

    private sock: WASocket
    private logger: Logger;
    private commandProcessor: CommandProcessor;
    private eventProcessor: EventProcessor;

    public constructor(sock: WASocket, logger: Logger) {
        this.sock = sock;
    }

}