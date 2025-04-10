import { WASocket } from "baileys";
import { CommandProcessor } from "../command/CommandProcessor";
import { EventProcessor } from "../event/EventProcessor";
import { Bot } from "../bot/Bot";
import { MessageListener } from "../event/events/MessageListener";
import { ConnectionListener } from "../event/events/ConnectionListener"
import { StatusCommand } from "../command/commands/StatusCommand";
import { DispatchCommand } from "../command/commands/DispatchCommand";

export class BotHandler {

    private bot: Bot;
    private commandProcessor: CommandProcessor;
    private eventProcessor: EventProcessor;

    public constructor(bot: Bot) {
        this.bot = bot

        this.commandProcessor = new CommandProcessor(this.bot.getSock());
        CommandProcessor.register("status", new StatusCommand(this.bot.getSock()));
        CommandProcessor.register("disparar", new DispatchCommand(bot));

        this.eventProcessor = new EventProcessor(this.bot.getSock());
        this.eventProcessor.register("message", new MessageListener(bot))
        this.eventProcessor.register("connection", new ConnectionListener(bot));
    }

    public getCMDProcessor(): CommandProcessor {
        return this.commandProcessor;
    }

}