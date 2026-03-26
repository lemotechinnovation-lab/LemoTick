declare module 'event-emitter-es6' {
    class EventEmitter {
        constructor(options?: { emitDelay?: number })
        on(event: string, listener: (...args: any[]) => void): void
        emit(event: string, ...args: any[]): void
        off(event: string, listener: (...args: any[]) => void): void
    }
    export default EventEmitter
}
