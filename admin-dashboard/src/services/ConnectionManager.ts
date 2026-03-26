import EventEmitter from 'event-emitter-es6'
import RobustWebSocket from 'robust-websocket'

interface PendingPromise<T, E> {
    resolve: (value: T) => void
    reject: (error: E) => void
    promise: Promise<T>
}

export interface BinaryAPIRequest {
    [key: string]: any
}

export interface BinaryAPIResponse {
    [key: string]: any
    msg_type?: string
    error?: {
        code: string
        message: string
    }
}

class ConnectionManager extends EventEmitter {
    private _bufferedRequests: PendingPromise<BinaryAPIResponse, Error>[] = []
    private _connectionOpened?: PendingPromise<void, void>
    private _counterReqId = 1
    private _pendingRequests: Record<string, PendingPromise<BinaryAPIResponse, Error> | undefined> = {}
    private _pingTimer?: ReturnType<typeof setInterval>
    private _url: string
    private _websocket!: RobustWebSocket

    static get EVENT_CONNECTION_CLOSE() {
        return 'CONNECTION_CLOSE'
    }

    static get EVENT_CONNECTION_REOPEN() {
        return 'CONNECTION_REOPEN'
    }

    constructor({ appId, endpoint, language }: { appId: number | string; endpoint: string; language: string }) {
        super({ emitDelay: 0 })
        this._url = `${endpoint}?l=${language}&app_id=${appId}`
        this._initialize()
    }

    private _initialize() {
        this._websocket = new RobustWebSocket(this._url, null, {
            shouldReconnect(event: any) {
                if (event.code === 1006 && event.type === 'close') {
                    return 0
                }
                if (event.code === 1008 || event.code === 1011 || event.type === 'close') return
                if (event.type === 'online') {
                    return 0
                }
                return 3000
            },
        })

        const onConnectionStatusChanged = () => {
            if (this._websocket.readyState === WebSocket.OPEN) {
                this._onWsOpen()
            } else {
                this._onWsClosed()
            }
        }

        this._websocket.addEventListener('open', onConnectionStatusChanged)
        this._websocket.addEventListener('close', onConnectionStatusChanged)
        this._websocket.addEventListener('message', this._onmessage.bind(this))
    }

    onOpened(callback: () => void) {
        this.on(ConnectionManager.EVENT_CONNECTION_REOPEN, callback)
    }

    onClosed(callback: () => void) {
        this.on(ConnectionManager.EVENT_CONNECTION_CLOSE, callback)
    }

    private _onWsOpen() {
        if (this._connectionOpened) {
            this._connectionOpened.resolve()
            this._connectionOpened = undefined
        }
        this.emit(ConnectionManager.EVENT_CONNECTION_REOPEN)
        this._sendBufferedRequests()

        if (!this._pingTimer) {
            this._pingTimer = setInterval(this._pingCheck.bind(this), 15000)
        }
    }

    private _pingCheck() {
        if (this._websocket.readyState === WebSocket.OPEN) {
            this.send({ ping: 1 }, 5000).catch(() => {
                if (this._websocket.readyState === WebSocket.OPEN) {
                    console.error('Server unresponsive. Creating new connection...')
                    this._websocket.close()
                    this._initialize()
                }
            })
        }
    }

    private _onWsClosed() {
        if (this._pingTimer) {
            clearInterval(this._pingTimer)
            this._pingTimer = undefined
        }
        this.emit(ConnectionManager.EVENT_CONNECTION_CLOSE)
    }

    private _sendBufferedRequests() {
        while (this._bufferedRequests.length > 0) {
            const req = this._bufferedRequests.shift()
            if (req) {
                this.send(req as any)
            }
        }
    }

    private _onmessage(message: MessageEvent) {
        const data: BinaryAPIResponse = JSON.parse(message.data)

        if (data.error) {
            console.error('Deriv API Error:', data.error)
            console.error('Request that caused error:', data.echo_req)
        }

        if (data.msg_type) {
            this.emit(data.msg_type, data)
        }

        const reqId = data.req_id
        if (reqId && this._pendingRequests[reqId]) {
            const pending = this._pendingRequests[reqId]!
            delete this._pendingRequests[reqId]

            if (data.error) {
                pending.reject(new Error(data.error.message))
            } else {
                pending.resolve(data)
            }
        }
    }

    send(request: BinaryAPIRequest, timeout?: number): Promise<BinaryAPIResponse> {
        const reqId = String(this._counterReqId++)
        const reqWithId = { ...request, req_id: reqId }

        let timeoutHandle: ReturnType<typeof setTimeout> | undefined
        let pending: PendingPromise<BinaryAPIResponse, Error>

        const promise = new Promise<BinaryAPIResponse>((resolve, reject) => {
            pending = {
                resolve,
                reject,
                promise: null as any, // Will be set after promise is created
            }

            if (timeout) {
                timeoutHandle = setTimeout(() => {
                    delete this._pendingRequests[reqId]
                    reject(new Error('Request timeout'))
                }, timeout)
            }

            this._pendingRequests[reqId] = pending

            if (this._websocket.readyState === WebSocket.OPEN) {
                this._websocket.send(JSON.stringify(reqWithId))
            } else {
                this._bufferedRequests.push(pending)
            }
        })

        // Set the promise reference after it's created
        pending!.promise = promise

        promise.finally(() => {
            if (timeoutHandle) {
                clearTimeout(timeoutHandle)
            }
        })

        return promise
    }

    close() {
        if (this._websocket) {
            this._websocket.close()
        }
    }
}

export default ConnectionManager
