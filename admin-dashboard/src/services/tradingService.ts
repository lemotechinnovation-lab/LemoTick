import { SIGNALR_HUB_URL } from '@/config/constants'
import * as signalR from '@microsoft/signalr'

export interface TickUpdate {
    symbol: string
    price: number
    timestamp: number
    dateTime: Date
}

export interface TradeNotification {
    investorId: string
    portfolioId: string
    tradeId: string
    symbol: string
    direction: string
    stake: number
    entryPrice?: number
    exitPrice?: number
    profit?: number
    loss?: number
    status: string
    timestamp: Date
}

export interface PortfolioUpdate {
    investorId: string
    portfolioId: string
    currentValue: number
    totalProfit: number
    totalLoss: number
    netProfit: number
    profitPercentage: number
    totalTrades: number
    winningTrades: number
    losingTrades: number
}

export interface BalanceUpdate {
    balance: number
    currency: string
    timestamp: Date
}

class TradingService {
    private connection: signalR.HubConnection | null = null
    private isConnecting = false
    private reconnectAttempts = 0
    private maxReconnectAttempts = 5

    // Event callbacks
    private tickUpdateCallbacks: Array<(tick: TickUpdate) => void> = []
    private tradeOpenedCallbacks: Array<(trade: TradeNotification) => void> = []
    private tradeClosedCallbacks: Array<(trade: TradeNotification) => void> = []
    private portfolioUpdateCallbacks: Array<(portfolio: PortfolioUpdate) => void> = []
    private balanceUpdateCallbacks: Array<(balance: BalanceUpdate) => void> = []

    constructor() {
        this.initializeConnection()
    }

    private initializeConnection() {
        const token = localStorage.getItem('token')

        if (!token) {
            console.warn('No authentication token found for SignalR connection')
            return
        }

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(`${SIGNALR_HUB_URL}/tradingHub`, {
                accessTokenFactory: () => token,
            })
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: (retryContext) => {
                    if (retryContext.previousRetryCount < this.maxReconnectAttempts) {
                        return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000)
                    }
                    return null
                },
            })
            .configureLogging(signalR.LogLevel.Information)
            .build()

        this.setupEventHandlers()
    }

    private setupEventHandlers() {
        if (!this.connection) return

        // Tick updates
        this.connection.on('ReceiveTickUpdate', (tick: TickUpdate) => {
            console.log('[TradingService] Received tick update:', tick)
            this.tickUpdateCallbacks.forEach((callback) => callback(tick))
        })

        // Trade opened
        this.connection.on('ReceiveTradeOpened', (trade: TradeNotification) => {
            console.log('[TradingService] Received trade opened:', trade)
            this.tradeOpenedCallbacks.forEach((callback) => callback(trade))
        })

        // Trade closed
        this.connection.on('ReceiveTradeClosed', (trade: TradeNotification) => {
            console.log('[TradingService] Received trade closed:', trade)
            this.tradeClosedCallbacks.forEach((callback) => callback(trade))
        })

        // Portfolio update
        this.connection.on('ReceivePortfolioUpdate', (portfolio: PortfolioUpdate) => {
            console.log('[TradingService] Received portfolio update:', portfolio)
            this.portfolioUpdateCallbacks.forEach((callback) => callback(portfolio))
        })

        // Balance update
        this.connection.on('ReceiveBalanceUpdate', (balance: BalanceUpdate) => {
            console.log('[TradingService] Received balance update:', balance)
            this.balanceUpdateCallbacks.forEach((callback) => callback(balance))
        })

        // Connection events
        this.connection.onreconnecting((error) => {
            console.warn('[TradingService] Reconnecting...', error)
            this.reconnectAttempts++
        })

        this.connection.onreconnected(() => {
            console.log('[TradingService] Reconnected successfully')
            this.reconnectAttempts = 0
        })

        this.connection.onclose((error) => {
            console.error('[TradingService] Connection closed', error)
            // Attempt to reconnect after a delay
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                setTimeout(() => this.start(), 5000)
            }
        })
    }

    async start() {
        if (!this.connection) {
            this.initializeConnection()
        }

        if (this.isConnecting || this.connection?.state === signalR.HubConnectionState.Connected) {
            return
        }

        this.isConnecting = true

        try {
            await this.connection?.start()
            console.log('[TradingService] Connected to TradingHub')
            this.reconnectAttempts = 0
        } catch (error) {
            console.error('[TradingService] Error connecting to TradingHub:', error)
            // Retry connection after delay
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                this.reconnectAttempts++
                setTimeout(() => this.start(), 5000)
            }
        } finally {
            this.isConnecting = false
        }
    }

    async stop() {
        try {
            await this.connection?.stop()
            console.log('[TradingService] Disconnected from TradingHub')
        } catch (error) {
            console.error('[TradingService] Error disconnecting:', error)
        }
    }

    async subscribeToPortfolio(portfolioId: string) {
        if (this.connection?.state === signalR.HubConnectionState.Connected) {
            try {
                await this.connection.invoke('SubscribeToPortfolio', portfolioId)
                console.log(`[TradingService] Subscribed to portfolio ${portfolioId}`)
            } catch (error) {
                console.error('[TradingService] Error subscribing to portfolio:', error)
            }
        }
    }

    async unsubscribeFromPortfolio(portfolioId: string) {
        if (this.connection?.state === signalR.HubConnectionState.Connected) {
            try {
                await this.connection.invoke('UnsubscribeFromPortfolio', portfolioId)
                console.log(`[TradingService] Unsubscribed from portfolio ${portfolioId}`)
            } catch (error) {
                console.error('[TradingService] Error unsubscribing from portfolio:', error)
            }
        }
    }

    async subscribeToAllTrades() {
        if (this.connection?.state === signalR.HubConnectionState.Connected) {
            try {
                await this.connection.invoke('SubscribeToAllTrades')
                console.log('[TradingService] Subscribed to all trades')
            } catch (error) {
                console.error('[TradingService] Error subscribing to all trades:', error)
            }
        }
    }

    // Event subscription methods
    onTickUpdate(callback: (tick: TickUpdate) => void) {
        this.tickUpdateCallbacks.push(callback)
        return () => {
            this.tickUpdateCallbacks = this.tickUpdateCallbacks.filter((cb) => cb !== callback)
        }
    }

    onTradeOpened(callback: (trade: TradeNotification) => void) {
        this.tradeOpenedCallbacks.push(callback)
        return () => {
            this.tradeOpenedCallbacks = this.tradeOpenedCallbacks.filter((cb) => cb !== callback)
        }
    }

    onTradeClosed(callback: (trade: TradeNotification) => void) {
        this.tradeClosedCallbacks.push(callback)
        return () => {
            this.tradeClosedCallbacks = this.tradeClosedCallbacks.filter((cb) => cb !== callback)
        }
    }

    onPortfolioUpdate(callback: (portfolio: PortfolioUpdate) => void) {
        this.portfolioUpdateCallbacks.push(callback)
        return () => {
            this.portfolioUpdateCallbacks = this.portfolioUpdateCallbacks.filter((cb) => cb !== callback)
        }
    }

    onBalanceUpdate(callback: (balance: BalanceUpdate) => void) {
        this.balanceUpdateCallbacks.push(callback)
        return () => {
            this.balanceUpdateCallbacks = this.balanceUpdateCallbacks.filter((cb) => cb !== callback)
        }
    }

    getConnectionState() {
        return this.connection?.state || signalR.HubConnectionState.Disconnected
    }

    isConnected() {
        return this.connection?.state === signalR.HubConnectionState.Connected
    }
}

// Export singleton instance
export const tradingService = new TradingService()

