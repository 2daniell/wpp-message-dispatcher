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
            await this.eventHandler.trigger("message", [messages, type]);
        }) 
    
    }

}