import {
    BalanceUpdate,
    PortfolioUpdate,
    TickUpdate,
    TradeNotification,
    tradingService,
} from '@/services/tradingService'
import { HubConnectionState } from '@microsoft/signalr'
import { useCallback, useEffect, useState } from 'react'

export function useTradingUpdates() {
    const [connectionState, setConnectionState] = useState<HubConnectionState>(
        tradingService.getConnectionState()
    )
    const [latestTick, setLatestTick] = useState<TickUpdate | null>(null)
    const [latestTrade, setLatestTrade] = useState<TradeNotification | null>(null)
    const [portfolioUpdate, setPortfolioUpdate] = useState<PortfolioUpdate | null>(null)
    const [balance, setBalance] = useState<BalanceUpdate | null>(null)

    useEffect(() => {
        // Start connection
        tradingService.start()

        // Update connection state periodically
        const interval = setInterval(() => {
            setConnectionState(tradingService.getConnectionState())
        }, 1000)

        return () => {
            clearInterval(interval)
        }
    }, [])

    useEffect(() => {
        // Subscribe to tick updates
        const unsubTick = tradingService.onTickUpdate((tick) => {
            setLatestTick(tick)
        })

        // Subscribe to trade opened
        const unsubTradeOpened = tradingService.onTradeOpened((trade) => {
            setLatestTrade(trade)
        })

        // Subscribe to trade closed
        const unsubTradeClosed = tradingService.onTradeClosed((trade) => {
            setLatestTrade(trade)
        })

        // Subscribe to portfolio updates
        const unsubPortfolio = tradingService.onPortfolioUpdate((portfolio) => {
            setPortfolioUpdate(portfolio)
        })

        // Subscribe to balance updates
        const unsubBalance = tradingService.onBalanceUpdate((balanceUpdate) => {
            setBalance(balanceUpdate)
        })

        return () => {
            unsubTick()
            unsubTradeOpened()
            unsubTradeClosed()
            unsubPortfolio()
            unsubBalance()
        }
    }, [])

    const subscribeToPortfolio = useCallback((portfolioId: string) => {
        tradingService.subscribeToPortfolio(portfolioId)
    }, [])

    const unsubscribeFromPortfolio = useCallback((portfolioId: string) => {
        tradingService.unsubscribeFromPortfolio(portfolioId)
    }, [])

    const subscribeToAllTrades = useCallback(() => {
        tradingService.subscribeToAllTrades()
    }, [])

    return {
        connectionState,
        isConnected: connectionState === HubConnectionState.Connected,
        latestTick,
        latestTrade,
        portfolioUpdate,
        balance,
        subscribeToPortfolio,
        unsubscribeFromPortfolio,
        subscribeToAllTrades,
    }
}

// Hook for specific callbacks
export function useTradingCallbacks({
    onTickUpdate,
    onTradeOpened,
    onTradeClosed,
    onPortfolioUpdate,
    onBalanceUpdate,
}: {
    onTickUpdate?: (tick: TickUpdate) => void
    onTradeOpened?: (trade: TradeNotification) => void
    onTradeClosed?: (trade: TradeNotification) => void
    onPortfolioUpdate?: (portfolio: PortfolioUpdate) => void
    onBalanceUpdate?: (balance: BalanceUpdate) => void
}) {
    useEffect(() => {
        const unsubscribers: Array<() => void> = []

        if (onTickUpdate) {
            unsubscribers.push(tradingService.onTickUpdate(onTickUpdate))
        }

        if (onTradeOpened) {
            unsubscribers.push(tradingService.onTradeOpened(onTradeOpened))
        }

        if (onTradeClosed) {
            unsubscribers.push(tradingService.onTradeClosed(onTradeClosed))
        }

        if (onPortfolioUpdate) {
            unsubscribers.push(tradingService.onPortfolioUpdate(onPortfolioUpdate))
        }

        if (onBalanceUpdate) {
            unsubscribers.push(tradingService.onBalanceUpdate(onBalanceUpdate))
        }

        return () => {
            unsubscribers.forEach((unsub) => unsub())
        }
    }, [onTickUpdate, onTradeOpened, onTradeClosed, onPortfolioUpdate, onBalanceUpdate])
}

