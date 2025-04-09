import { WAMessage } from "baileys";

export interface CommandExecutor {
    execute(message: WAMessage): Promise<void>;
}