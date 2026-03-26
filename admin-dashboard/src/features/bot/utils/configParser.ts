import type { BotConfig } from '../types/botConfig.types'

/**
 * Parse YAML string to structured config object
 * This extracts key configuration values from the YAML
 */
export function parseYamlToConfig(yaml: string): Partial<BotConfig> {
    try {
        const lines = yaml.split('\n')
        const config: Record<string, Record<string, unknown>> = {}

        // Simple YAML parser for our specific structure
        let currentSection = ''

        for (const line of lines) {
            const trimmed = line.trim()

            // Skip comments and empty lines
            if (trimmed.startsWith('#') || !trimmed) continue

            // Main section (no indentation)
            if (!line.startsWith(' ') && trimmed.includes(':')) {
                const [key] = trimmed.split(':')
                currentSection = key.trim()
                config[currentSection] = {}
                continue
            }

            // Parse key-value pairs
            if (trimmed.includes(':')) {
                const [key, ...valueParts] = trimmed.split(':')
                const value = valueParts.join(':').split('#')[0].trim()

                if (!value || value === '{}' || value === '[]') continue

                const cleanKey = key.trim()

                // Determine indentation level
                const indent = line.search(/\S/)

                if (indent === 2 || indent === 4) {
                    // Top-level property in section
                    if (currentSection && config[currentSection]) {
                        config[currentSection][cleanKey] = parseValue(value)
                    }
                }
            }
        }

        return config
    } catch (error) {
        console.error('Error parsing YAML:', error)
        return {}
    }
}

/**
 * Convert structured config object back to YAML string
 * This merges form changes with the original YAML template
 */
export function configToYaml(config: Partial<BotConfig>, originalYaml: string): string {
    try {
        let yaml = originalYaml
        console.log('Converting config to YAML:', config)

        // Replace values in the YAML while preserving structure and comments
        for (const [, sectionData] of Object.entries(config)) {
            if (typeof sectionData === 'object' && sectionData !== null) {
                for (const [key, value] of Object.entries(sectionData)) {
                    // Skip nested objects (like candlestick_strategy)
                    if (typeof value === 'object' && value !== null) {
                        // Handle nested objects
                        for (const [nestedKey, nestedValue] of Object.entries(value)) {
                            yaml = replaceYamlValue(yaml, nestedKey, nestedValue)
                        }
                    } else {
                        // Handle regular key-value pairs
                        yaml = replaceYamlValue(yaml, key, value)
                    }
                }
            }
        }

        console.log('Updated YAML successfully')
        return yaml
    } catch (error) {
        console.error('Error converting config to YAML:', error)
        return originalYaml
    }
}

/**
 * Replace a value in YAML (removes inline comments)
 */
function replaceYamlValue(yaml: string, key: string, value: unknown): string {
    // Match: (spaces)(key)(:)(spaces)(old_value)(everything else on the line)
    const regex = new RegExp(
        `(^[ \\t]+${escapeRegex(key)}:[ \\t]+)([^\\r\\n#]+)([ \\t]*(?:#[^\\r\\n]*)?)$`,
        'gm'
    )

    const replacement = (_match: string, prefix: string, _oldValue: string) => {
        // Format the new value while detecting if the old value had quotes
        const oldValueTrimmed = _oldValue.trim()
        const hadQuotes = oldValueTrimmed.startsWith('"') || oldValueTrimmed.startsWith("'")

        let formattedValue: string

        if (typeof value === 'string') {
            // Preserve quote style if it existed, or add quotes if needed
            if (hadQuotes || /\s/.test(value) || value === '') {
                formattedValue = `"${value}"`
            } else {
                formattedValue = value
            }
        } else if (typeof value === 'boolean') {
            formattedValue = value ? 'true' : 'false'
        } else if (typeof value === 'number') {
            formattedValue = String(value)
        } else {
            formattedValue = String(value)
        }

        // Return: prefix + new_value (NO inline comment)
        return prefix + formattedValue
    }

    const result = yaml.replace(regex, replacement)

    if (result !== yaml) {
        console.log(`✓ Replaced ${key}: ${value}`)
    }

    return result
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Parse string value to appropriate type
 */
function parseValue(value: string): string | number | boolean {
    const cleaned = value.trim()

    // Boolean
    if (cleaned === 'true') return true
    if (cleaned === 'false') return false

    // Number
    if (!isNaN(Number(cleaned)) && cleaned !== '') {
        return Number(cleaned)
    }

    // String (remove quotes if present)
    return cleaned.replace(/^["']|["']$/g, '')
}

/**
 * Get default configuration values
 */
export function getDefaultConfig(): BotConfig {
    return {
        bot: {
            name: 'LemoTick',
            version: '2.0',
            debug: true,
            log_level: 'INFO',
        },
        trading: {
            symbol: 'R_100',
            contract_duration: 3,
            contract_basis: 'stake',
            base_stake: 1.0,
            max_stake: 25.0,
            min_stake: 1.0,
            max_concurrent_trades: 999,
            max_daily_loss: 20.0,
            emergency_stop_loss: 50.0,
            risk_per_trade: 0.03,
            take_profit_pct: 0.0,
            stop_loss_pct: 0.20,
            early_closure_enabled: true,
            min_profit_threshold: 0.50,
            max_loss_threshold: 0.20,
        },
        strategy: {
            candlestick_strategy: {
                enabled: true,
                min_pattern_confidence: 0.55,
                require_trend_confirmation: false,
                require_momentum_confirmation: false,
                quality_threshold: 0.55,
                ticks_per_candle: 5,
                candlestick_close_after_candles: 2,
            },
            fibonacci_enabled: true,
            fibonacci_confidence_boost: 0.15,
            mean_reversion_enabled: false,
            tick_pattern_enabled: false,
        },
        risk_management: {
            risk_per_trade: 0.03,
            max_daily_drawdown: 0.30,
            cooldown_seconds: 0.0,
            max_concurrent_trades: 1,
            force_always_trade: true,
            win_rate_protection_enabled: true,
            min_win_rate_threshold: 0.50,
            circuit_breaker_enabled: false,
            circuit_breaker_losses: 10,
            daily_loss_limit: 99999,
            daily_trade_limit: 99999,
            equity_protection_enabled: true,
            max_equity_drawdown: 0.10,
        },
        indicators: {
            ema_short_period: 6,
            ema_medium_period: 18,
            ema_long_period: 50,
            rsi_period: 14,
            rsi_overbought: 70,
            rsi_oversold: 30,
            macd_fast: 12,
            macd_slow: 26,
            macd_signal: 9,
            atr_period: 14,
            bb_period: 20,
            bb_std_dev: 2.0,
        },
        account_mode: {
            use_live_account: false,
            require_explicit_confirmation: true,
        },
    }
}

