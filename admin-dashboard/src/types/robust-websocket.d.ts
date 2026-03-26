declare module 'robust-websocket' {
    interface RobustWebSocketOptions {
        shouldReconnect?: (event: any, ws: any) => number | void
    }

    class RobustWebSocket extends WebSocket {
        constructor(url: string, protocols: string | string[] | null, options?: RobustWebSocketOptions)
    }

    export default RobustWebSocket
}
