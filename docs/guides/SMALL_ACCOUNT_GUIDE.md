# Small Account Trading Guide ($50 Equity)

This guide provides recommendations for maintaining a small trading account with $50 equity using LemoTick.

## Current Configuration

Your bot has been configured with the following conservative settings for a $50 equity account:

- **Initial Equity**: $50
- **Risk Per Trade**: 1% (very conservative)
- **Min Stake**: $1.00
- **Max Stake**: $3.00
- **Maximum Daily Drawdown**: 5%
- **Emergency Stop**: 8% drawdown
- **Max Consecutive Losses**: 3 trades

## Risk Management Guidelines

### Stake Sizing

1. **Start Small**: Begin with the minimum $1.00 stake size
2. **Gradual Scaling**: Only allow the bot to increase stakes after 5+ consecutive winning trades
3. **Manual Cap**: Consider manually capping max stake at $2.00 initially

### Position Management

1. **Single Trade**: Never allow more than one position at a time
2. **Early Closure**: Enable contract early closure to protect profits
3. **Maximum Exposure**: Never risk more than 2% of account on a single trade

### Drawdown Control

1. **Daily Limit**: Stop trading for the day if you lose 5% of equity ($2.50)
2. **Weekly Limit**: Take a 2-day break if you lose 10% in a week
3. **Emergency Stop**: The bot will stop at 8% drawdown automatically

## Best Practices for Small Accounts

1. **Winning Streaks**: During winning streaks, withdraw 50% of profits over $75
2. **Recovery Mode**: After reaching $40 equity, reduce stakes to $0.50-$1.00
3. **Reinvestment**: Consider adding $10-20 if equity drops below $30
4. **Track Performance**: Monitor win rate closely; aim for 55%+ win rate
5. **Gradual Growth**: Focus on consistent small gains rather than quick profits

## Recommended Trading Schedule

1. **Session Length**: Limit to 2-3 hours per day
2. **Best Times**: Trade during stable market volatility
3. **Weekend Break**: Take weekends off to avoid volatile weekend trading
4. **Multiple Sessions**: Consider splitting into 2-3 shorter sessions

## Account Growth Milestones

| Equity Level | Action |
|--------------|--------|
| $60          | Increase max stake to $3.00 |
| $75          | Consider withdrawing 50% of profits above this level |
| $100         | Revise settings for medium-sized account |
| $40          | Reduce max stake to $1.00 |
| $30          | Consider adding funds or pausing trading |

## Monitoring and Maintenance

1. **Daily Check**: Verify account balance and performance metrics daily
2. **Strategy Review**: Analyze performance weekly
3. **Trading Journal**: Track all results and adjustments
4. **Parameter Tuning**: Adjust parameters gradually based on performance

Remember that maintaining a small account requires discipline, patience, and careful risk management. The settings have been optimized to preserve your capital while allowing for gradual growth.
