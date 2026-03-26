import DerivSmartChart from '@/components/trading/DerivSmartChart'
import { Box, Button, Chip, Dialog, DialogContent, DialogTitle, IconButton, Popover, TextField, Typography } from '@mui/material'
import { ChevronDown, List, Plus, Search, Settings, TrendingDown, TrendingUp, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useDerivWebSocket } from '../../../hooks/useDerivWebSocket'
import { useMarketStatus } from '../../../hooks/useMarketStatus'

interface MarketSymbol {
    symbol: string
    name: string
    tvSymbol: string
    category: string
}

export default function TradePage() {
    const [selectedSymbol, setSelectedSymbol] = useState('EUR/USD')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [showMarkets, setShowMarkets] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    const [showTradeTypes, setShowTradeTypes] = useState(false)
    const [showPositions, setShowPositions] = useState(false)
    const [showClosedMarkets, setShowClosedMarkets] = useState(false)
    const [chartType, setChartType] = useState('chart-types')
    const [selectedChartType, setSelectedChartType] = useState<'area' | 'candle' | 'hollow' | 'ohlc'>('area')
    const [timeInterval, setTimeInterval] = useState('1m')

    const [tradeType, setTradeType] = useState('rise-fall')
    const [stake, setStake] = useState('10.00')
    const marketsButtonRef = useRef<HTMLButtonElement>(null)

    const allSymbols: MarketSymbol[] = [
        // Forex - Majors
        { symbol: 'EUR/USD', name: 'Euro vs US Dollar', tvSymbol: 'frxEURUSD', category: 'Forex' },
        { symbol: 'GBP/USD', name: 'British Pound vs US Dollar', tvSymbol: 'frxGBPUSD', category: 'Forex' },
        { symbol: 'USD/JPY', name: 'US Dollar vs Japanese Yen', tvSymbol: 'frxUSDJPY', category: 'Forex' },
        { symbol: 'AUD/USD', name: 'Australian Dollar vs US Dollar', tvSymbol: 'frxAUDUSD', category: 'Forex' },
        { symbol: 'USD/CHF', name: 'US Dollar vs Swiss Franc', tvSymbol: 'frxUSDCHF', category: 'Forex' },
        { symbol: 'USD/CAD', name: 'US Dollar vs Canadian Dollar', tvSymbol: 'frxUSDCAD', category: 'Forex' },
        { symbol: 'NZD/USD', name: 'New Zealand Dollar vs US Dollar', tvSymbol: 'frxNZDUSD', category: 'Forex' },
        { symbol: 'EUR/GBP', name: 'Euro vs British Pound', tvSymbol: 'frxEURGBP', category: 'Forex' },
        { symbol: 'EUR/JPY', name: 'Euro vs Japanese Yen', tvSymbol: 'frxEURJPY', category: 'Forex' },
        { symbol: 'GBP/JPY', name: 'British Pound vs Japanese Yen', tvSymbol: 'frxGBPJPY', category: 'Forex' },
        { symbol: 'USD/ZAR', name: 'US Dollar vs South African Rand', tvSymbol: 'frxUSDZAR', category: 'Forex' },

        // Commodities
        { symbol: 'Gold', name: 'Gold', tvSymbol: 'frxXAUUSD', category: 'Commodities' },
        { symbol: 'Silver', name: 'Silver', tvSymbol: 'frxXAGUSD', category: 'Commodities' },
        { symbol: 'Platinum', name: 'Platinum', tvSymbol: 'frxXPTUSD', category: 'Commodities' },
        { symbol: 'Palladium', name: 'Palladium', tvSymbol: 'frxXPDUSD', category: 'Commodities' },
        { symbol: 'WTI Crude Oil', name: 'WTI Crude Oil', tvSymbol: 'frxUSOIL', category: 'Commodities' },
        { symbol: 'Brent Crude Oil', name: 'Brent Crude Oil', tvSymbol: 'frxUKOIL', category: 'Commodities' },
        { symbol: 'Natural Gas', name: 'Natural Gas', tvSymbol: 'frxNGAS', category: 'Commodities' },

        // Stock Indices
        { symbol: 'S&P 500', name: 'S&P 500', tvSymbol: 'OTC_SPC500', category: 'Indices' },
        { symbol: 'NASDAQ 100', name: 'NASDAQ 100', tvSymbol: 'OTC_NDX100', category: 'Indices' },
        { symbol: 'Dow Jones 30', name: 'Dow Jones 30', tvSymbol: 'OTC_DJI', category: 'Indices' },
        { symbol: 'FTSE 100', name: 'FTSE 100', tvSymbol: 'OTC_FTSE', category: 'Indices' },
        { symbol: 'Germany 40', name: 'Germany 40 (DAX)', tvSymbol: 'OTC_GDAXI', category: 'Indices' },
        { symbol: 'Australia 200', name: 'Australia 200', tvSymbol: 'OTC_ASX200', category: 'Indices' },
        { symbol: 'Hong Kong 50', name: 'Hong Kong 50', tvSymbol: 'OTC_HSI', category: 'Indices' },
        { symbol: 'Japan 225', name: 'Japan 225', tvSymbol: 'OTC_N225', category: 'Indices' },

        // Stocks
        { symbol: 'Apple Inc', name: 'Apple Inc', tvSymbol: 'AAPL', category: 'Stocks' },
        { symbol: 'Tesla Inc', name: 'Tesla Inc', tvSymbol: 'TSLA', category: 'Stocks' },
        { symbol: 'Amazon.com Inc', name: 'Amazon.com Inc', tvSymbol: 'AMZN', category: 'Stocks' },
        { symbol: 'Meta Platforms Inc', name: 'Meta Platforms Inc', tvSymbol: 'META', category: 'Stocks' },
        { symbol: 'Microsoft Corp', name: 'Microsoft Corp', tvSymbol: 'MSFT', category: 'Stocks' },
        { symbol: 'Alphabet Inc', name: 'Alphabet Inc', tvSymbol: 'GOOGL', category: 'Stocks' },
        { symbol: 'NVIDIA Corp', name: 'NVIDIA Corp', tvSymbol: 'NVDA', category: 'Stocks' },
        { symbol: 'Netflix Inc', name: 'Netflix Inc', tvSymbol: 'NFLX', category: 'Stocks' },

        // ETFs
        { symbol: 'SPDR S&P 500 ETF', name: 'SPDR S&P 500 ETF', tvSymbol: 'SPY', category: 'ETFs' },
        { symbol: 'Invesco QQQ Trust', name: 'Invesco QQQ Trust', tvSymbol: 'QQQ', category: 'ETFs' },
        { symbol: 'ARK Innovation ETF', name: 'ARK Innovation ETF', tvSymbol: 'ARKK', category: 'ETFs' },
        { symbol: 'iShares Russell 2000 ETF', name: 'iShares Russell 2000 ETF', tvSymbol: 'IWM', category: 'ETFs' },
        { symbol: 'SPDR Dow Jones Industrial Average ETF', name: 'SPDR Dow Jones Industrial Average ETF', tvSymbol: 'DIA', category: 'ETFs' },

        // Cryptocurrencies
        { symbol: 'Bitcoin vs US Dollar', name: 'Bitcoin vs US Dollar', tvSymbol: 'BTCUSD', category: 'Crypto' },
        { symbol: 'Ethereum vs US Dollar', name: 'Ethereum vs US Dollar', tvSymbol: 'ETHUSD', category: 'Crypto' },
        { symbol: 'Litecoin vs US Dollar', name: 'Litecoin vs US Dollar', tvSymbol: 'LTCUSD', category: 'Crypto' },
        { symbol: 'Bitcoin Cash vs US Dollar', name: 'Bitcoin Cash vs US Dollar', tvSymbol: 'BCHUSD', category: 'Crypto' },
        { symbol: 'Ripple vs US Dollar', name: 'Ripple vs US Dollar', tvSymbol: 'XRPUSD', category: 'Crypto' },
        { symbol: 'Cardano vs US Dollar', name: 'Cardano vs US Dollar', tvSymbol: 'ADAUSD', category: 'Crypto' },
        { symbol: 'Polkadot vs US Dollar', name: 'Polkadot vs US Dollar', tvSymbol: 'DOTUSD', category: 'Crypto' },
        { symbol: 'Solana vs US Dollar', name: 'Solana vs US Dollar', tvSymbol: 'SOLUSD', category: 'Crypto' },

        // Synthetic Indices - Volatility (Standard)
        { symbol: 'Volatility 10 Index', name: 'Volatility 10 Index', tvSymbol: 'R_10', category: 'Synthetics' },
        { symbol: 'Volatility 25 Index', name: 'Volatility 25 Index', tvSymbol: 'R_25', category: 'Synthetics' },
        { symbol: 'Volatility 50 Index', name: 'Volatility 50 Index', tvSymbol: 'R_50', category: 'Synthetics' },
        { symbol: 'Volatility 75 Index', name: 'Volatility 75 Index', tvSymbol: 'R_75', category: 'Synthetics' },
        { symbol: 'Volatility 100 Index', name: 'Volatility 100 Index', tvSymbol: 'R_100', category: 'Synthetics' },

        // Synthetic Indices - Volatility (1 Second)
        { symbol: 'Volatility 10 (1s) Index', name: 'Volatility 10 (1s) Index', tvSymbol: '1HZ10V', category: 'Synthetics' },
        { symbol: 'Volatility 25 (1s) Index', name: 'Volatility 25 (1s) Index', tvSymbol: '1HZ25V', category: 'Synthetics' },
        { symbol: 'Volatility 50 (1s) Index', name: 'Volatility 50 (1s) Index', tvSymbol: '1HZ50V', category: 'Synthetics' },
        { symbol: 'Volatility 75 (1s) Index', name: 'Volatility 75 (1s) Index', tvSymbol: '1HZ75V', category: 'Synthetics' },
        { symbol: 'Volatility 100 (1s) Index', name: 'Volatility 100 (1s) Index', tvSymbol: '1HZ100V', category: 'Synthetics' },

        // Synthetic Indices - Jump
        { symbol: 'Jump 10 Index', name: 'Jump 10 Index', tvSymbol: 'JD10', category: 'Synthetics' },
        { symbol: 'Jump 25 Index', name: 'Jump 25 Index', tvSymbol: 'JD25', category: 'Synthetics' },
        { symbol: 'Jump 50 Index', name: 'Jump 50 Index', tvSymbol: 'JD50', category: 'Synthetics' },
        { symbol: 'Jump 75 Index', name: 'Jump 75 Index', tvSymbol: 'JD75', category: 'Synthetics' },
        { symbol: 'Jump 100 Index', name: 'Jump 100 Index', tvSymbol: 'JD100', category: 'Synthetics' },

        // Synthetic Indices - Boom & Crash
        { symbol: 'Boom 300 Index', name: 'Boom 300 Index', tvSymbol: 'BOOM300', category: 'Synthetics' },
        { symbol: 'Boom 500 Index', name: 'Boom 500 Index', tvSymbol: 'BOOM500', category: 'Synthetics' },
        { symbol: 'Boom 1000 Index', name: 'Boom 1000 Index', tvSymbol: 'BOOM1000', category: 'Synthetics' },
        { symbol: 'Crash 300 Index', name: 'Crash 300 Index', tvSymbol: 'CRASH300', category: 'Synthetics' },
        { symbol: 'Crash 500 Index', name: 'Crash 500 Index', tvSymbol: 'CRASH500', category: 'Synthetics' },
        { symbol: 'Crash 1000 Index', name: 'Crash 1000 Index', tvSymbol: 'CRASH1000', category: 'Synthetics' },

        // Synthetic Indices - Step
        { symbol: 'Step Index', name: 'Step Index', tvSymbol: 'STEP', category: 'Synthetics' },

        // Synthetic Indices - Range Break
        { symbol: 'Range Break 100 Index', name: 'Range Break 100 Index', tvSymbol: 'RDBREAK100', category: 'Synthetics' },
        { symbol: 'Range Break 200 Index', name: 'Range Break 200 Index', tvSymbol: 'RDBREAK200', category: 'Synthetics' },

        // Synthetic Indices - Drift Switching
        { symbol: 'Drift Switching Index 10', name: 'Drift Switching Index 10', tvSymbol: 'DSI10', category: 'Synthetics' },
        { symbol: 'Drift Switching Index 20', name: 'Drift Switching Index 20', tvSymbol: 'DSI20', category: 'Synthetics' },
        { symbol: 'Drift Switching Index 30', name: 'Drift Switching Index 30', tvSymbol: 'DSI30', category: 'Synthetics' },

        // Synthetic Indices - Daily Reset
        { symbol: 'Daily Reset 10 Index', name: 'Daily Reset 10 Index', tvSymbol: 'DR10', category: 'Synthetics' },
        { symbol: 'Daily Reset 20 Index', name: 'Daily Reset 20 Index', tvSymbol: 'DR20', category: 'Synthetics' },
        { symbol: 'Daily Reset 30 Index', name: 'Daily Reset 30 Index', tvSymbol: 'DR30', category: 'Synthetics' },
    ]

    const categories = ['All', 'Forex', 'Commodities', 'Indices', 'Stocks', 'ETFs', 'Crypto', 'Synthetics']

    // Check market status for all symbols
    const allTvSymbols = allSymbols.map(s => s.tvSymbol)
    const { marketStatuses, isInitialCheckComplete } = useMarketStatus(allTvSymbols)

    const filteredSymbols = allSymbols.filter(item => {
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
        const matchesSearch = item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.name.toLowerCase().includes(searchQuery.toLowerCase())

        // Filter by market status (only show open markets unless toggle is on)
        const marketStatus = marketStatuses[item.tvSymbol]
        const isMarketOpen = !isInitialCheckComplete || !marketStatus || marketStatus.isOpen || showClosedMarkets

        return matchesCategory && matchesSearch && isMarketOpen
    })

    const currentSymbol = allSymbols.find(s => s.symbol === selectedSymbol) || allSymbols[0]

    // Auto-select first open market on initial load
    useEffect(() => {
        if (isInitialCheckComplete && marketStatuses) {
            // Find first open market
            const firstOpenMarket = allSymbols.find(symbol => {
                const status = marketStatuses[symbol.tvSymbol]
                return status && status.isOpen
            })

            // If current selection is closed and we have an open market, switch to it
            const currentStatus = marketStatuses[currentSymbol.tvSymbol]
            if (firstOpenMarket && currentStatus && !currentStatus.isOpen) {
                setSelectedSymbol(firstOpenMarket.symbol)
            }
        }
    }, [isInitialCheckComplete])

    // Connect to Deriv WebSocket for real-time price updates
    const { currentPrice, isConnected, error: marketError, priceChange, priceChangePercent } = useDerivWebSocket(currentSymbol.tvSymbol)

    return (
        <Box sx={{
            height: '100%',
            width: '100%',
            display: 'flex',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'hidden'
        }}>
            {/* Open Positions Panel - Slides in from left */}
            <Box sx={{
                width: showPositions ? 300 : 0,
                transition: 'width 0.3s ease',
                overflow: 'hidden',
                bgcolor: 'rgba(255, 255, 255, 0.03)',
                borderRight: showPositions ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 5
            }}>
                {showPositions && (
                    <>
                        {/* Header */}
                        <Box sx={{
                            p: 2,
                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                                Open positions
                            </Typography>
                            <IconButton
                                size="small"
                                onClick={() => setShowPositions(false)}
                                sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' } }}
                            >
                                <X size={18} />
                            </IconButton>
                        </Box>

                        {/* Positions List */}
                        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
                            {/* Empty State */}
                            <Box sx={{ textAlign: 'center', py: 6 }}>
                                <Typography sx={{ fontSize: '2rem', mb: 2, opacity: 0.3 }}>📊</Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    No open positions
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
                                    Your active trades will appear here
                                </Typography>
                            </Box>
                        </Box>
                    </>
                )}
            </Box>

            {/* Left Side - Chart Area */}
            <Box sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                minWidth: 0,
                overflow: 'hidden',
                bgcolor: 'rgba(0, 0, 0, 0.3)',
                height: '100%'
            }}>
                {/* Top Controls - Market Selector - HIDDEN */}
                <Box sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    zIndex: 10,
                    pointerEvents: 'auto',
                    display: 'none' // Hidden for now
                }}>
                    {/* Market Selector */}
                    <Button
                        ref={marketsButtonRef}
                        onClick={() => setShowMarkets(true)}
                        sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            color: 'white',
                            px: 2,
                            py: 1.5,
                            minWidth: 280,
                            justifyContent: 'space-between',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: 1,
                            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
                        }}
                        endIcon={<ChevronDown size={18} />}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            {/* Symbol Icon */}
                            <Box sx={{
                                bgcolor: 'rgba(255, 107, 53, 0.2)',
                                p: 0.5,
                                borderRadius: 0.5,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: 32,
                                height: 32
                            }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem' }}>
                                    {currentSymbol.category === 'Synthetics' ? 'SYN' :
                                        currentSymbol.category === 'Forex' ? 'FX' :
                                            currentSymbol.category === 'Crypto' ? '₿' :
                                                currentSymbol.category === 'Commodities' ? '◆' :
                                                    currentSymbol.category === 'Indices' ? '📊' : 'S'}
                                </Typography>
                            </Box>

                            {/* Symbol Info */}
                            <Box sx={{ textAlign: 'left' }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                                    {selectedSymbol}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                                    {marketError ? (
                                        <>
                                            <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#FF6B35' }}>
                                                Market Closed
                                            </Typography>
                                            <Box component="span" sx={{ fontSize: '0.7rem' }}>🕐</Box>
                                        </>
                                    ) : isConnected && currentPrice ? (
                                        <>
                                            <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.7 }}>
                                                {currentPrice.toFixed(4)}
                                            </Typography>
                                            {priceChange !== null && priceChangePercent !== null && (
                                                <>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            fontSize: '0.7rem',
                                                            color: priceChange >= 0 ? '#4caf50' : '#ef4444'
                                                        }}
                                                    >
                                                        {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(4)} ({priceChange >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
                                                    </Typography>
                                                    <Box
                                                        component="span"
                                                        sx={{
                                                            color: priceChange >= 0 ? '#4caf50' : '#ef4444',
                                                            fontSize: '0.7rem',
                                                            display: 'flex',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        {priceChange >= 0 ? '▲' : '▼'}
                                                    </Box>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.5 }}>
                                            Connecting...
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    </Button>
                </Box>

                {/* Settings Icon - Bottom Left - HIDDEN */}
                <Box sx={{
                    position: 'absolute',
                    bottom: 80,
                    left: 16,
                    zIndex: 10,
                    display: 'none', // Hidden for now
                    flexDirection: 'column',
                    gap: 1,
                    pointerEvents: 'auto'
                }}>
                    <IconButton
                        onClick={() => {
                            setChartType('chart-types')
                            setShowSettings(true)
                        }}
                        sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                            width: 40,
                            height: 40,
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                    >
                        <Settings size={18} />
                    </IconButton>

                    {/* Open Positions Toggle */}
                    <IconButton
                        onClick={() => setShowPositions(!showPositions)}
                        sx={{
                            bgcolor: showPositions ? 'rgba(255, 107, 53, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                            '&:hover': { bgcolor: showPositions ? 'rgba(255, 107, 53, 0.3)' : 'rgba(255, 255, 255, 0.1)' },
                            width: 40,
                            height: 40,
                            border: '1px solid',
                            borderColor: showPositions ? 'primary.main' : 'rgba(255, 255, 255, 0.1)'
                        }}
                    >
                        <List size={18} />
                    </IconButton>
                </Box>

                {/* Trading Chart */}
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    pointerEvents: 'auto',
                    '& iframe': {
                        pointerEvents: 'auto'
                    }
                }}>
                    {/* Deriv SmartCharts with real-time data */}
                    <DerivSmartChart symbol={currentSymbol.tvSymbol} />
                </Box>
            </Box>

            {/* Right Side - Trade Panel */}
            <Box sx={{
                width: 320,
                bgcolor: 'rgba(255, 255, 255, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                borderLeft: '1px solid rgba(255, 255, 255, 0.05)',
                height: '100%',
                overflow: 'auto'
            }}>
                {/* Account Info */}
                <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <Chip label="Demo account" size="small" sx={{ mb: 1 }} />
                    <Typography variant="h6">$10,000.00</Typography>
                </Box>

                {/* Trade Type Selector */}
                <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <Button
                        fullWidth
                        onClick={() => setShowTradeTypes(true)}
                        sx={{
                            justifyContent: 'space-between',
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            color: 'white',
                            py: 1.5,
                            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
                        }}
                        endIcon={<ChevronDown size={16} />}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TrendingUp size={18} />
                            <Typography>Rise/Fall</Typography>
                        </Box>
                    </Button>
                </Box>

                {/* Stake Input */}
                <Box sx={{ p: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
                        Stake
                    </Typography>
                    <TextField
                        fullWidth
                        value={stake}
                        onChange={(e) => setStake(e.target.value)}
                        size="small"
                        slotProps={{
                            input: {
                                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                            }
                        }}
                    />
                </Box>

                {/* Rise/Fall Buttons */}
                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                        fullWidth
                        variant="contained"
                        sx={{
                            bgcolor: '#4caf50',
                            py: 3,
                            '&:hover': { bgcolor: '#45a049' },
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.5
                        }}
                    >
                        <TrendingUp size={24} />
                        <Typography variant="h6">Rise</Typography>
                        <Typography variant="caption">Payout: 95.30%</Typography>
                    </Button>

                    <Button
                        fullWidth
                        variant="contained"
                        color="error"
                        sx={{
                            py: 3,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.5
                        }}
                    >
                        <TrendingDown size={24} />
                        <Typography variant="h6">Fall</Typography>
                        <Typography variant="caption">Payout: 95.30%</Typography>
                    </Button>
                </Box>
            </Box>

            {/* Markets Popover - Dropdown style like Deriv */}
            <Popover
                open={showMarkets}
                anchorEl={marketsButtonRef.current}
                onClose={() => setShowMarkets(false)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                slotProps={{
                    paper: {
                        sx: {
                            width: 320,
                            maxHeight: '80vh',
                            mt: 1,
                            bgcolor: 'rgba(20, 20, 30, 0.98)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: 2
                        }
                    }
                }}
            >
                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">Markets</Typography>
                        <IconButton onClick={() => setShowMarkets(false)} size="small">
                            <X size={20} />
                        </IconButton>
                    </Box>

                    {/* Search */}
                    <TextField
                        size="small"
                        placeholder="Search markets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        fullWidth
                        slotProps={{
                            input: {
                                startAdornment: <Search size={16} style={{ marginRight: 8, opacity: 0.5 }} />
                            }
                        }}
                    />

                    {/* Show Closed Markets Toggle */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 0.5 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                            {isInitialCheckComplete ? 'Only showing open markets' : 'Checking market status...'}
                        </Typography>
                        <Button
                            size="small"
                            onClick={() => setShowClosedMarkets(!showClosedMarkets)}
                            sx={{
                                fontSize: '0.7rem',
                                py: 0.5,
                                px: 1,
                                minWidth: 'auto',
                                textTransform: 'none'
                            }}
                        >
                            {showClosedMarkets ? 'Hide closed' : 'Show all'}
                        </Button>
                    </Box>

                    {/* Category Chips */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {categories.map((cat) => (
                            <Chip
                                key={cat}
                                label={cat}
                                size="small"
                                onClick={() => setSelectedCategory(cat)}
                                sx={{
                                    bgcolor: selectedCategory === cat ? 'primary.main' : 'rgba(255, 255, 255, 0.05)',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        bgcolor: selectedCategory === cat ? 'primary.dark' : 'rgba(255, 255, 255, 0.1)'
                                    }
                                }}
                            />
                        ))}
                    </Box>

                    {/* Symbol List - Organized by category like Deriv */}
                    <Box sx={{
                        maxHeight: '50vh',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0
                    }}>
                        {selectedCategory === 'All' ? (
                            // Show all categories with headers
                            categories.slice(1).map((category) => {
                                const categorySymbols = allSymbols.filter(item => {
                                    const matchesCategory = item.category === category
                                    const matchesSearch = item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        item.name.toLowerCase().includes(searchQuery.toLowerCase())

                                    // Filter by market status (only show open markets unless toggle is on)
                                    const marketStatus = marketStatuses[item.tvSymbol]
                                    const isMarketOpen = !isInitialCheckComplete || !marketStatus || marketStatus.isOpen || showClosedMarkets

                                    return matchesCategory && matchesSearch && isMarketOpen
                                })

                                if (categorySymbols.length === 0) return null

                                return (
                                    <Box key={category} sx={{ mb: 1 }}>
                                        {/* Category Header */}
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                px: 1.5,
                                                py: 0.75,
                                                display: 'block',
                                                color: 'rgba(255, 255, 255, 0.5)',
                                                fontWeight: 700,
                                                textTransform: 'uppercase',
                                                fontSize: '0.65rem',
                                                letterSpacing: '0.8px',
                                                bgcolor: 'rgba(255, 255, 255, 0.02)',
                                                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                                            }}
                                        >
                                            {category}
                                        </Typography>

                                        {/* Category Items */}
                                        {categorySymbols.map((item) => (
                                            <Box
                                                key={item.symbol}
                                                onClick={() => {
                                                    setSelectedSymbol(item.symbol)
                                                    setShowMarkets(false)
                                                }}
                                                sx={{
                                                    px: 1.5,
                                                    py: 1.25,
                                                    bgcolor: selectedSymbol === item.symbol ? 'rgba(255, 107, 53, 0.15)' : 'transparent',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1.5,
                                                    borderLeft: selectedSymbol === item.symbol ? '3px solid' : '3px solid transparent',
                                                    borderLeftColor: selectedSymbol === item.symbol ? 'primary.main' : 'transparent',
                                                    '&:hover': {
                                                        bgcolor: 'rgba(255, 107, 53, 0.08)',
                                                        borderLeftColor: 'rgba(255, 107, 53, 0.5)'
                                                    }
                                                }}
                                            >
                                                {/* Icon Badge */}
                                                <Box sx={{
                                                    bgcolor: 'primary.main',
                                                    p: 0.5,
                                                    borderRadius: 0.5,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    minWidth: 24,
                                                    height: 24
                                                }}>
                                                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.65rem', color: 'white' }}>
                                                        {item.category === 'Synthetics' ? 'SYN' :
                                                            item.category === 'Forex' ? 'FX' :
                                                                item.category === 'Crypto' ? '₿' :
                                                                    item.category === 'Commodities' ? '◆' :
                                                                        item.category === 'Indices' ? '📊' : 'S'}
                                                    </Typography>
                                                </Box>

                                                {/* Symbol Info */}
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.3 }}>
                                                            {item.symbol}
                                                        </Typography>
                                                        {isInitialCheckComplete && marketStatuses[item.tvSymbol] && (
                                                            <Box component="span" sx={{
                                                                width: 6,
                                                                height: 6,
                                                                borderRadius: '50%',
                                                                bgcolor: marketStatuses[item.tvSymbol].isOpen ? '#4caf50' : '#ef4444',
                                                                flexShrink: 0
                                                            }} />
                                                        )}
                                                    </Box>
                                                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.7rem', lineHeight: 1.2 }}>
                                                        {item.name}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                )
                            })
                        ) : (
                            // Show filtered symbols
                            filteredSymbols.map((item) => (
                                <Box
                                    key={item.symbol}
                                    onClick={() => {
                                        setSelectedSymbol(item.symbol)
                                        setShowMarkets(false)
                                    }}
                                    sx={{
                                        px: 1.5,
                                        py: 1.25,
                                        bgcolor: selectedSymbol === item.symbol ? 'rgba(255, 107, 53, 0.15)' : 'transparent',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        borderLeft: selectedSymbol === item.symbol ? '3px solid' : '3px solid transparent',
                                        borderLeftColor: selectedSymbol === item.symbol ? 'primary.main' : 'transparent',
                                        '&:hover': {
                                            bgcolor: 'rgba(255, 107, 53, 0.08)',
                                            borderLeftColor: 'rgba(255, 107, 53, 0.5)'
                                        }
                                    }}
                                >
                                    {/* Icon Badge */}
                                    <Box sx={{
                                        bgcolor: 'primary.main',
                                        p: 0.5,
                                        borderRadius: 0.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minWidth: 24,
                                        height: 24
                                    }}>
                                        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.65rem', color: 'white' }}>
                                            {item.category === 'Synthetics' ? 'SYN' :
                                                item.category === 'Forex' ? 'FX' :
                                                    item.category === 'Crypto' ? '₿' :
                                                        item.category === 'Commodities' ? '◆' :
                                                            item.category === 'Indices' ? '📊' : 'S'}
                                        </Typography>
                                    </Box>

                                    {/* Symbol Info */}
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem', lineHeight: 1.2 }}>
                                                {item.symbol}
                                            </Typography>
                                            {isInitialCheckComplete && marketStatuses[item.tvSymbol] && (
                                                <Box component="span" sx={{
                                                    width: 6,
                                                    height: 6,
                                                    borderRadius: '50%',
                                                    bgcolor: marketStatuses[item.tvSymbol].isOpen ? '#4caf50' : '#ef4444',
                                                    flexShrink: 0
                                                }} />
                                            )}
                                        </Box>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                                            {item.name}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))
                        )}
                    </Box>
                </Box>
            </Popover>

            {/* Settings Dialog - Menu style like Deriv */}
            <Dialog
                open={showSettings}
                onClose={() => setShowSettings(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2 }}>
                    <Typography variant="h6">Settings</Typography>
                    <IconButton onClick={() => setShowSettings(false)} size="small">
                        <X size={20} />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0, display: 'flex', minHeight: 400 }}>
                    {/* Left Menu */}
                    <Box sx={{
                        width: 200,
                        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                        bgcolor: 'rgba(255, 255, 255, 0.02)'
                    }}>
                        {[
                            { id: 'chart-types', label: 'Chart types', icon: '📊' },
                            { id: 'indicators', label: 'Indicators', icon: '📈' },
                            { id: 'templates', label: 'Templates', icon: '📋' },
                            { id: 'drawing-tools', label: 'Drawing tools', icon: '✏️' },
                        ].map((item) => (
                            <Box
                                key={item.id}
                                onClick={() => setChartType(item.id)}
                                sx={{
                                    px: 2,
                                    py: 1.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    cursor: 'pointer',
                                    bgcolor: chartType === item.id ? 'rgba(255, 107, 53, 0.1)' : 'transparent',
                                    borderLeft: chartType === item.id ? '3px solid' : '3px solid transparent',
                                    borderLeftColor: chartType === item.id ? 'primary.main' : 'transparent',
                                    transition: 'all 0.15s',
                                    '&:hover': {
                                        bgcolor: 'rgba(255, 107, 53, 0.05)',
                                        borderLeftColor: 'rgba(255, 107, 53, 0.5)'
                                    }
                                }}
                            >
                                <Typography sx={{ fontSize: '1.2rem' }}>{item.icon}</Typography>
                                <Typography variant="body2" sx={{ fontWeight: chartType === item.id ? 600 : 400 }}>
                                    {item.label}
                                </Typography>
                            </Box>
                        ))}
                    </Box>

                    {/* Right Content */}
                    <Box sx={{ flex: 1, p: 3 }}>
                        {chartType === 'chart-types' && (
                            <Box>
                                <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>Select chart type</Typography>
                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
                                    {[
                                        { value: 'area' as const, label: 'Area', icon: '📈' },
                                        { value: 'candle' as const, label: 'Candle', icon: '📊' },
                                        { value: 'hollow' as const, label: 'Hollow', icon: '📉' },
                                        { value: 'ohlc' as const, label: 'OHLC', icon: '⬜' }
                                    ].map((type) => (
                                        <Box
                                            key={type.value}
                                            onClick={() => setSelectedChartType(type.value)}
                                            sx={{
                                                p: 2,
                                                bgcolor: selectedChartType === type.value ? 'rgba(255, 107, 53, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                                                border: '1px solid',
                                                borderColor: selectedChartType === type.value ? 'primary.main' : 'rgba(255, 255, 255, 0.1)',
                                                borderRadius: 1,
                                                cursor: 'pointer',
                                                textAlign: 'center',
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    bgcolor: 'rgba(255, 107, 53, 0.1)',
                                                    borderColor: 'primary.main'
                                                }
                                            }}
                                        >
                                            <Typography sx={{ fontSize: '1.5rem', mb: 0.5 }}>{type.icon}</Typography>
                                            <Typography variant="caption">{type.label}</Typography>
                                        </Box>
                                    ))}
                                </Box>

                                <Typography variant="subtitle2" sx={{ mt: 4, mb: 2, color: 'text.secondary' }}>Time interval</Typography>
                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1 }}>
                                    {['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '1d'].map((interval) => (
                                        <Button
                                            key={interval}
                                            variant={timeInterval === interval ? 'contained' : 'outlined'}
                                            onClick={() => setTimeInterval(interval)}
                                            size="small"
                                            sx={{ minWidth: 'auto', py: 1 }}
                                        >
                                            {interval}
                                        </Button>
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {chartType === 'indicators' && (
                            <Box sx={{ textAlign: 'center', py: 6 }}>
                                <Typography sx={{ fontSize: '3rem', mb: 2, opacity: 0.3 }}>📈</Typography>
                                <Typography variant="h6" sx={{ mb: 1, color: 'text.secondary' }}>
                                    Indicators
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    You have no active indicators yet
                                </Typography>
                                <Button variant="outlined" sx={{ mt: 3 }} size="small">
                                    Add indicator
                                </Button>
                            </Box>
                        )}

                        {chartType === 'templates' && (
                            <Box sx={{ textAlign: 'center', py: 6 }}>
                                <Typography sx={{ fontSize: '3rem', mb: 2, opacity: 0.3 }}>📋</Typography>
                                <Typography variant="h6" sx={{ mb: 1, color: 'text.secondary' }}>
                                    Templates
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                                    You have no saved templates yet
                                </Typography>
                                <Button variant="contained" sx={{ mr: 1 }} size="small">
                                    + Add new template
                                </Button>
                                <Button variant="outlined" size="small">
                                    Download template
                                </Button>
                            </Box>
                        )}

                        {chartType === 'drawing-tools' && (
                            <Box sx={{ textAlign: 'center', py: 6 }}>
                                <Typography sx={{ fontSize: '3rem', mb: 2, opacity: 0.3 }}>✏️</Typography>
                                <Typography variant="h6" sx={{ mb: 1, color: 'text.secondary' }}>
                                    Drawing tools
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    You have no active drawings yet
                                </Typography>
                                <Button variant="outlined" sx={{ mt: 3 }} size="small">
                                    Add drawing
                                </Button>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Trade Types Dialog */}
            <Dialog
                open={showTradeTypes}
                onClose={() => setShowTradeTypes(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Trade Types
                    <IconButton onClick={() => setShowTradeTypes(false)} size="small">
                        <X size={20} />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {[
                            { value: 'rise-fall', label: 'Rise/Fall', icon: <TrendingUp size={18} /> },
                            { value: 'multipliers', label: 'Multipliers', icon: <X size={18} /> },
                            { value: 'accumulators', label: 'Accumulators', icon: <Plus size={18} /> },
                        ].map((type) => (
                            <Button
                                key={type.value}
                                variant={tradeType === type.value ? 'contained' : 'outlined'}
                                onClick={() => {
                                    setTradeType(type.value)
                                    setShowTradeTypes(false)
                                }}
                                sx={{ justifyContent: 'flex-start', py: 1.5 }}
                                startIcon={type.icon}
                            >
                                {type.label}
                            </Button>
                        ))}
                    </Box>
                </DialogContent>
            </Dialog >
        </Box >
    )
}
