import { Bot } from "../bot/Bot";
import { BotStatus } from "../bot/BotStatus";

export interface BotDTO {
    name: string;
    status: String
}

export const BotStatusText = {
  [BotStatus.READY]: "Ligado",
  [BotStatus.STARTING]: "Iniciando",
  [BotStatus.STOPPED]: "Desligado",
  [BotStatus.FAIL]: "FALHA"
}
  
export function toDTO(bot: Bot): BotDTO {
  return {
    name: bot.getInstanceName(),
    status: BotStatusText[bot.getStatus()].toUpperCase()
  };
}
  