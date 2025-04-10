import { WASocket } from "baileys";
import { Listener } from "./Listener";
import { EventHandler } from "./EventHandler";

export class EventProcessor {

    private sock: WASocket
    private eventHandler: EventHandler;

    public constructor(sock: WASocket) {
        this.sock = sock;
        this.eventHandler = new EventHandler();

        this.init()
    }

    public register(event: string, listener: Listener<any>) {
        this.eventHandler.register(event, listener);
    }

    private init() {

        this.sock.ev.on("messages.upsert", async ({ messages, type }) => {
            try {
                await this.eventHandler.trigger("message", [messages, type]);
            } catch(err) {
                console.error("Erro (1)")
            }
        })

        this.sock.ev.on("connection.update", async (update) => {
            try {
                await this.eventHandler.trigger("connection", update);
            } catch(err) {
                console.error("Erro (2)")
            }
        });
    
    }

}