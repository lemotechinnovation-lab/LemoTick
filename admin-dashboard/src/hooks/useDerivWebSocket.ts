import { useEffect, useRef, useState } from 'react'

interface TickData {
    time: string
    price: number
    open: number
    high: number
    low: number
    close: number
}

interface DerivWebSocketHook {
    data: TickData[]
    isConnected: boolean
    error: string | null
    currentPrice: number | null
    priceChange: number | null
    priceChangePercent: number | null
}

export function useDerivWebSocket(symbol: string, granularity: number = 60): DerivWebSocketHook {
    const [data, setData] = useState<TickData[]>([])
    const [isConnected, setIsConnected] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [currentPrice, setCurrentPrice] = useState<number | null>(null)
    const [priceChange, setPriceChange] = useState<number | null>(null)
    const [priceChangePercent, setPriceChangePercent] = useState<number | null>(null)
    const previousPriceRef = useRef<number | null>(null)
    const wsRef = useRef<WebSocket | null>(null)
    const reconnectTimeoutRef = useRef<number | undefined>(undefined)

    useEffect(() => {
        let isMounted = true

        const connect = () => {
            try {
                // Connect to Deriv WebSocket API
                const appId = import.meta.env.VITE_DERIV_APP_ID || '1089'
                const ws = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${appId}`)
                wsRef.current = ws

                ws.onopen = () => {
                    if (!isMounted) return
                    console.log('Deriv WebSocket connected')
                    setIsConnected(true)
                    setError(null)

                    // Subscribe to ticks for the symbol
                    ws.send(JSON.stringify({
                        ticks: symbol,
                        subscribe: 1
                    }))

                    // Also request candles history - request more candles for better chart
                    const endTime = Math.floor(Date.now() / 1000) // Current timestamp in seconds
                    ws.send(JSON.stringify({
                        ticks_history: symbol,
                        adjust_start_time: 1,
                        count: 500, // Increased from 100 to 500 for more data points
                        end: endTime,
                        start: 1,
                        style: 'candles',
                        granularity: granularity // Use the provided granularity
                    }))
                }

                ws.onmessage = (event) => {
                    if (!isMounted) return

                    try {
                        const response = JSON.parse(event.data)

                        // Handle tick subscription updates
                        if (response.tick) {
                            const tick = response.tick
                            const newPrice = tick.quote

                            // Calculate price change
                            if (previousPriceRef.current !== null) {
                                const change = newPrice - previousPriceRef.current
                                const changePercent = (change / previousPriceRef.current) * 100
                                setPriceChange(change)
                                setPriceChangePercent(changePercent)
                            }

                            setCurrentPrice(newPrice)
                            previousPriceRef.current = newPrice

                            // Update the last candle or add new one
                            setData(prevData => {
                                const newData = [...prevData]
                                const timestamp = new Date(tick.epoch * 1000)
                                const timeStr = timestamp.toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })

                                if (newData.length > 0) {
                                    const lastCandle = newData[newData.length - 1]
                                    // Update last candle
                                    lastCandle.close = tick.quote
                                    lastCandle.high = Math.max(lastCandle.high, tick.quote)
                                    lastCandle.low = Math.min(lastCandle.low, tick.quote)
                                    lastCandle.price = tick.quote
                                } else {
                                    // First tick - create initial candle
                                    newData.push({
                                        time: timeStr,
                                        price: tick.quote,
                                        open: tick.quote,
                                        high: tick.quote,
                                        low: tick.quote,
                                        close: tick.quote
                                    })
                                }

                                // Keep last 500 candles
                                return newData.slice(-500)
                            })
                        }

                        // Handle historical candles
                        if (response.candles) {
                            const candles = response.candles.map((candle: any) => {
                                const timestamp = new Date(candle.epoch * 1000)
                                return {
                                    time: timestamp.toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }),
                                    price: candle.close,
                                    open: candle.open,
                                    high: candle.high,
                                    low: candle.low,
                                    close: candle.close
                                }
                            })
                            console.log('Received candles:', candles.length, 'Sample:', candles.slice(0, 3))
                            setData(candles)
                            if (candles.length > 0) {
                                const lastPrice = candles[candles.length - 1].close
                                setCurrentPrice(lastPrice)
                                previousPriceRef.current = lastPrice
                            }
                        }

                        // Handle errors
                        if (response.error) {
                            console.error('Deriv API Error:', response.error)

                            // Handle market closed error
                            if (response.error.code === 'MarketIsClosed') {
                                setError('Market is currently closed')
                            } else {
                                setError(response.error.message)
                            }
                        }
                    } catch (err) {
                        console.error('Error parsing WebSocket message:', err)
                    }
                }

                ws.onerror = (event) => {
                    if (!isMounted) return
                    console.error('WebSocket error:', event)
                    setError('Connection error')
                    setIsConnected(false)
                }

                ws.onclose = () => {
                    if (!isMounted) return
                    console.log('Deriv WebSocket disconnected')
                    setIsConnected(false)

                    // Attempt to reconnect after 3 seconds
                    reconnectTimeoutRef.current = window.setTimeout(() => {
                        if (isMounted) {
                            console.log('Attempting to reconnect...')
                            connect()
                        }
                    }, 3000)
                }
            } catch (err) {
                console.error('Error creating WebSocket:', err)
                setError('Failed to connect')
            }
        }

        connect()

        return () => {
            isMounted = false
            if (reconnectTimeoutRef.current) {
                window.clearTimeout(reconnectTimeoutRef.current)
            }
            if (wsRef.current) {
                wsRef.current.close()
            }
        }
    }, [symbol, granularity])

    return { data, isConnected, error, currentPrice, priceChange, priceChangePercent }
}
