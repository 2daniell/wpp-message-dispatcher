export interface Listener<T> {
    handle(event: T): Promise<void>
}