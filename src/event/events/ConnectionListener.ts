import { ConnectionState, DisconnectReason } from "baileys";
import { Bot } from "../../bot/Bot";
import { Listener } from "../Listener";
import { Boom } from "@hapi/boom";
import sleep from "../../util/Sleep";
import { BotStatus } from "../../bot/BotStatus";

export class ConnectionListener implements Listener<any> {

    private bot: Bot;

    public constructor(bot: Bot) {
      this.bot = bot;
    }

    public async handle(update: Partial<ConnectionState>): Promise<void> {
        
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            if (this.bot.qrCallback) {
                this.bot.qrCallback(qr)
            }
        }

        if (connection === "close") {
            const shouldReconnect =
                (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;

            if (shouldReconnect) {
                this.bot.start();
            } else {
                this.bot.setStatus(BotStatus.FAIL)
                console.log("Conexão fechada. Você esta deslogado!");
            }

        } else if (connection === "open") {
            
            if (this.bot.readyCallback) {
                this.bot.readyCallback();
            }
            
            this.bot.setStatus(BotStatus.STARTING)
            await sleep(1000 * 60 * 5)

            const botNumber = this.bot.getSock().user.id.split(":")[0]

            const blockedGroupNames = [
                "ELETROMECÂNICO ATS",
                "ATS 💦",
                "Pelada Ats",
                "FOTOS ATS",
                "COMUNICAÇÃO ATS",
                "Grupo ATS sucupira 🤝🏻",
                "ATS - DIRETORIA",
                "NT Redação 📲 📰",
                "Jornalistas em ação no Tocantins",
                "FLAMENGO ATÉ O FIM  🌟❤🖤",
                "Grande Grupo de Amigos Cleiton/Pedro",
                "REGIÃO  SUL",
                "REGIÃO NORTE",
                "SETOR NORTE/🔷🇧🇷LA CSRB",
                "RIFAS SALDÃO DAS CARRETILHAS",
                "Longo Alcance Tocantins",
                "ASCOM 4º BPM /7ª CIPM/ 8ª CIPM",
                "Grupo Principios de NA.",
                "Ricardo Ayres Dep Federal",
                "Divulgação Ricardo Ayres",
                "Reforma casa🏠",
                "Fut RESENHA TRT10 - 5ª",
                "Palmas Brothers",
                "Secom e Assessorias",
                "Lista de links de grupos",
                "Informes Dorinha",
                "OS REMANESCENTES",
                "Familia Fernandes 😍💗😍",
                "GD Cleiton Cardoso",
                "Pelada Esquenta Banco ⚽️",
                "Grupão RP 🔷",
                "Amigos do Vereador Pedro Cardoso- Líderes",
                "🗞📷 JORNALISMO 📺📻 UFT",
                "Mit Deutsch Spaß haben",
                "RP - CSA Tocantins",
                "Titulares do Sistema Ouvidoria do Estado do Tocantins",
                "Amigos do Cleiton/Pedro Cardoso 02",
                "Aprovação de Vídeos",
                "Família Fernandes Tocantins 🤗💕",
                "CGE/OGE - Ouvidorias setoriais",
                "CTCI - AESBE",
                "Segundo Turno - Líderes",
                "Grupo de Cortes - ATS"
            ];

            const groupsMap = await this.bot.getSock().groupFetchAllParticipating();
            
            const groups = Object.values(groupsMap).filter(group =>
            group.announce !== true &&
            group.size > 1 &&
            group.isCommunityAnnounce !== true &&
            group.subject.trim() !== Bot.ALLOWED_GROUP &&
            (
                botNumber !== '6384585728' || 
                !blockedGroupNames.includes(group.subject.trim())
            ));

            this.bot.setGroups(groups);
            
            console.log("Grupos encontrados: " + this.bot.getGroups().length);
            console.log("✅ Bot conectado e pronto!");

            this.bot.setStatus(BotStatus.READY)

        }

    }

}