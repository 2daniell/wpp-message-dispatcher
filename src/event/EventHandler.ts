import { Listener } from "./Listener";

export class EventHandler {

    private handlers: Map<string, Listener<any>[]> = new Map();

    public register<T>(eventName: string, handler: Listener<T>): void {
        if (!this.handlers.has(eventName)) {
            this.handlers.set(eventName, []);
        }
        this.handlers.get(eventName)!.push(handler);
    }

    public async trigger<T>(eventName: string, event: T): Promise<void> {
        const handlers = this.handlers.get(eventName) || [];
        for (const handler of handlers) {
            await handler.handle(event);
        }
    }

}