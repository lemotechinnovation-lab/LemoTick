import ConnectionManager, { BinaryAPIRequest, BinaryAPIResponse } from './ConnectionManager'

interface TicksHistoryRequest extends BinaryAPIRequest {
    ticks_history: string
    granularity?: number
    start?: string | number
    end?: string | number | 'latest'
    count?: number
    style?: string
    subscribe?: number | boolean
    adjust_start_time?: number
}

interface TicksHistoryResponse extends BinaryAPIResponse {
    history?: {
        prices: number[]
        times: number[]
    }
    candles?: Array<{
        close: number
        high: number
        low: number
        open: number
        epoch: number
    }>
    echo_req?: TicksHistoryRequest
}

interface TickStreamResponse extends BinaryAPIResponse {
    tick?: {
        quote: number
        epoch: number
        id?: string
    }
    ohlc?: {
        close: number
        high: number
        low: number
        open: number
        open_time: number
        id?: string
    }
}

class Stream {
    private _callbacks: Array<(data: any) => void> = []
    private _noSubscriberCallback?: () => void

    get subscriberCount() {
        return this._callbacks.length
    }

    onStream(callback: (data: any) => void) {
        this._callbacks.push(callback)
    }

    offStream(callback: (data: any) => void) {
        this._callbacks = this._callbacks.filter(cb => cb !== callback)
        if (this._callbacks.length === 0 && this._noSubscriberCallback) {
            this._noSubscriberCallback()
        }
    }

    emitTick(data: any) {
        this._callbacks.forEach(cb => cb(data))
    }

    onNoSubscriber(callback: () => void) {
        this._noSubscriberCallback = callback
    }

    destroy() {
        this._callbacks = []
        this._noSubscriberCallback = undefined
    }
}

class StreamManager {
    private MAX_CACHE_TICKS = 5000
    private _connection: ConnectionManager
    private _streams: Record<string, Stream> = {}
    private _streamIds: Record<string, string | undefined> = {}
    private _tickHistoryCache: Record<string, TicksHistoryResponse> = {}
    private _tickHistoryPromises: Record<string, Promise<TicksHistoryResponse>> = {}
    private _beingForgotten: Record<string, boolean> = {}

    constructor(connection: ConnectionManager) {
        this._connection = connection

        this._connection.on('tick', this._onTick.bind(this))
        this._connection.on('ohlc', this._onTick.bind(this))
        this._connection.onClosed(this._onConnectionClosed.bind(this))
    }

    private _onTick(data: TickStreamResponse) {
        const key = this._getKey(data.echo_req as TicksHistoryRequest)

        if (this._streams[key] && this._tickHistoryCache[key]) {
            this._streamIds[key] = data.tick?.id || data.ohlc?.id
            this._cacheTick(key, data)
            this._streams[key].emitTick(data)
        } else if (this._beingForgotten[key] === undefined) {
            this._streamIds[key] = data.tick?.id || data.ohlc?.id
            this._forgetStream(key)
        }
    }

    private _onConnectionClosed() {
        this._streamIds = {}
        for (const key of Object.keys(this._streams)) {
            if (this._streams[key].subscriberCount !== 0) {
                this._forgetStream(key)
            }
        }
    }

    private _onReceiveTickHistory(data: TicksHistoryResponse) {
        const key = this._getKey(data.echo_req as TicksHistoryRequest)
        this._tickHistoryCache[key] = this._cloneTickHistoryResponse(data)
        delete this._tickHistoryPromises[key]
    }

    private _cacheTick(key: string, response: TickStreamResponse) {
        const cache = this._tickHistoryCache[key]
        if (!cache) return

        if (response.ohlc) {
            const { ohlc } = response
            const candles = cache.candles || []
            const candle = {
                close: ohlc.close,
                high: ohlc.high,
                low: ohlc.low,
                open: ohlc.open,
                epoch: ohlc.open_time,
            }

            const lastCandle = candles[candles.length - 1]
            if (lastCandle && lastCandle.epoch === candle.epoch) {
                candles[candles.length - 1] = candle
            } else {
                candles.push(candle)
                if (candles.length > this.MAX_CACHE_TICKS) {
                    candles.shift()
                }
            }
            cache.candles = candles
        } else if (response.tick) {
            const { tick } = response
            const history = cache.history || { prices: [], times: [] }

            history.prices.push(tick.quote)
            history.times.push(tick.epoch)

            if (history.prices.length > this.MAX_CACHE_TICKS) {
                history.prices.shift()
                history.times.shift()
            }
            cache.history = history
        }
    }

    private _forgetStream(key: string) {
        const stream = this._streams[key]
        if (stream) {
            stream.destroy()
            delete this._streams[key]
        }

        if (this._streamIds[key]) {
            const id = this._streamIds[key]
            this._beingForgotten[key] = true
            this._connection.send({ forget: id }).then(() => {
                delete this._beingForgotten[key]
                delete this._streamIds[key]
            })
        }

        if (this._tickHistoryCache[key]) {
            delete this._tickHistoryCache[key]
        }
    }

    private _createNewStream(request: TicksHistoryRequest) {
        const key = this._getKey(request)
        const stream = new Stream()
        this._streams[key] = stream

        // Transform the request to match Deriv API v3 requirements
        const transformedRequest = { ...request }

        // Convert "latest" to actual Unix timestamp
        if (transformedRequest.end === 'latest') {
            transformedRequest.end = Math.floor(Date.now() / 1000)
        }

        // Ensure subscribe is an integer (1 or 0), not boolean
        if (typeof transformedRequest.subscribe === 'boolean') {
            transformedRequest.subscribe = transformedRequest.subscribe ? 1 : 0
        }

        console.log('StreamManager sending request:', JSON.stringify(transformedRequest, null, 2))

        const subscribePromise = this._connection.send(transformedRequest)
        this._tickHistoryPromises[key] = subscribePromise as Promise<TicksHistoryResponse>

        subscribePromise
            .then(response => {
                console.log('StreamManager received response:', JSON.stringify(response, null, 2))
                this._onReceiveTickHistory(response as TicksHistoryResponse)
                if (response.error) {
                    this._forgetStream(key)
                }
            })
            .catch((error) => {
                console.error('StreamManager error:', error)
                this._forgetStream(key)
            })

        stream.onNoSubscriber(() => this._forgetStream(key))

        return stream
    }

    async subscribe(req: BinaryAPIRequest, callback: (response: TicksHistoryResponse) => void) {
        const request = req as TicksHistoryRequest
        const key = this._getKey(request)
        let stream = this._streams[key]

        if (!stream) {
            stream = this._createNewStream(request)
        }

        let tickHistoryResponse = this._tickHistoryCache[key]
        if (!tickHistoryResponse) {
            tickHistoryResponse = await this._tickHistoryPromises[key]
        }

        if (tickHistoryResponse.error) {
            callback(tickHistoryResponse)
        } else {
            callback(this._cloneTickHistoryResponse(tickHistoryResponse))
        }

        stream.onStream(callback)
    }

    forget(request: BinaryAPIRequest, callback: (response: TicksHistoryResponse) => void) {
        const key = this._getKey(request as TicksHistoryRequest)
        const stream = this._streams[key]
        if (stream) {
            stream.offStream(callback)
        }
    }

    private _getKey({ ticks_history: symbol, granularity }: TicksHistoryRequest) {
        return `${symbol}-${granularity || 0}`
    }

    private _cloneTickHistoryResponse(data: TicksHistoryResponse): TicksHistoryResponse {
        const { history, candles, ...others } = data

        if (history) {
            return {
                ...others,
                history: {
                    prices: [...history.prices],
                    times: [...history.times],
                },
            }
        } else if (candles) {
            return {
                ...others,
                candles: [...candles],
            }
        }

        return data
    }
}

export default StreamManager
