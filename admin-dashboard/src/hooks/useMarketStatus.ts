import { useEffect, useState } from 'react'

interface MarketStatus {
    symbol: string
    isOpen: boolean
    isChecking: boolean
}

export function useMarketStatus(symbols: string[]) {
    const [marketStatuses, setMarketStatuses] = useState<Record<string, MarketStatus>>({})
    const [isInitialCheckComplete, setIsInitialCheckComplete] = useState(false)

    useEffect(() => {
        if (symbols.length === 0) return

        // Initialize all markets as checking
        const initialStatuses: Record<string, MarketStatus> = {}
        symbols.forEach(symbol => {
            initialStatuses[symbol] = {
                symbol,
                isOpen: false,
                isChecking: true
            }
        })
        setMarketStatuses(initialStatuses)

        // Check market status for each symbol
        const checkMarkets = async () => {
            const appId = import.meta.env.VITE_DERIV_APP_ID || '1089'
            const ws = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${appId}`)

            ws.onopen = () => {
                // Request active symbols to check which markets are open
                ws.send(JSON.stringify({
                    active_symbols: 'brief',
                    product_type: 'basic'
                }))
            }

            ws.onmessage = (event) => {
                try {
                    const response = JSON.parse(event.data)

                    if (response.active_symbols) {
                        const openMarkets = new Set(
                            response.active_symbols
                                .filter((market: any) => market.exchange_is_open === 1)
                                .map((market: any) => market.symbol)
                        )

                        // Update statuses based on response
                        const updatedStatuses: Record<string, MarketStatus> = {}
                        symbols.forEach(symbol => {
                            updatedStatuses[symbol] = {
                                symbol,
                                isOpen: openMarkets.has(symbol),
                                isChecking: false
                            }
                        })

                        setMarketStatuses(updatedStatuses)
                        setIsInitialCheckComplete(true)
                        ws.close()
                    }
                } catch (err) {
                    console.error('Error checking market status:', err)
                }
            }

            ws.onerror = () => {
                // If check fails, assume all markets might be available
                const fallbackStatuses: Record<string, MarketStatus> = {}
                symbols.forEach(symbol => {
                    // Volatility indices and crypto are always open
                    const isAlwaysOpen = symbol.startsWith('R_') ||
                        symbol.startsWith('1HZ') ||
                        symbol.includes('BOOM') ||
                        symbol.includes('CRASH') ||
                        symbol.includes('STEP') ||
                        symbol.includes('RDBREAK') ||
                        symbol.includes('BINANCE:')

                    fallbackStatuses[symbol] = {
                        symbol,
                        isOpen: isAlwaysOpen,
                        isChecking: false
                    }
                })
                setMarketStatuses(fallbackStatuses)
                setIsInitialCheckComplete(true)
            }

            // Timeout after 5 seconds
            setTimeout(() => {
                if (!isInitialCheckComplete) {
                    ws.close()
                    setIsInitialCheckComplete(true)
                }
            }, 5000)
        }

        checkMarkets()
    }, [symbols.join(',')]) // Only re-run if symbols change

    return { marketStatuses, isInitialCheckComplete }
}
