import { api } from '@/services/api'

// Types
export interface BotStatus {
    isRunning: boolean
    isHealthy: boolean
    startedAt: string | null
    uptime: string | null
    processId: number | null
    errorMessage: string | null
    currentMetrics: BotMetrics | null
}

export interface BotMetrics {
    totalTrades: number
    winningTrades: number
    losingTrades: number
    winRate: number
    totalProfit: number
    totalLoss: number
    currentBalance: number
    activeTrades: number
}

export interface BotCommandResult {
    success: boolean
    message: string
}

export interface BotConfiguration {
    [key: string]: unknown
}

export interface BotConfigurationRaw {
    yaml: string
}

// Bot Management Service
const botService = {
    // Status
    async getStatus(): Promise<BotStatus> {
        return await api.get<BotStatus>('/api/botmanagement/status')
    },

    // Control
    async startBot(): Promise<BotCommandResult> {
        return await api.post<BotCommandResult>('/api/botmanagement/start')
    },

    async stopBot(): Promise<BotCommandResult> {
        return await api.post<BotCommandResult>('/api/botmanagement/stop')
    },

    async restartBot(): Promise<BotCommandResult> {
        return await api.post<BotCommandResult>('/api/botmanagement/restart')
    },

    // Metrics
    async getMetrics(): Promise<BotMetrics> {
        return await api.get<BotMetrics>('/api/botmanagement/metrics')
    },
}

// Bot Configuration Service
const botConfigService = {
    async getConfiguration(): Promise<BotConfiguration> {
        return await api.get<BotConfiguration>('/api/botconfiguration')
    },

    async getConfigurationRaw(): Promise<BotConfigurationRaw> {
        return await api.get<BotConfigurationRaw>('/api/botconfiguration/raw')
    },

    async updateConfiguration(config: BotConfigurationRaw): Promise<BotCommandResult> {
        return await api.put<BotCommandResult>('/api/botconfiguration/raw', config)
    },

    async resetConfiguration(): Promise<BotCommandResult> {
        return await api.post<BotCommandResult>('/api/botconfiguration/reset')
    },
}

export { botConfigService, botService }

