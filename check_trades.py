#!/usr/bin/env python3
import sqlite3
import os

# Check if database exists
db_path = 'data/bot_state.db'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Check if trades table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='trades'")
    if cursor.fetchone():
        # Get trade statistics
        cursor.execute('SELECT COUNT(*) as total_trades FROM trades')
        total = cursor.fetchone()[0]

        cursor.execute('SELECT COUNT(*) as wins FROM trades WHERE profit > 0')
        wins = cursor.fetchone()[0]

        cursor.execute('SELECT COUNT(*) as losses FROM trades WHERE profit < 0')
        losses = cursor.fetchone()[0]

        cursor.execute('SELECT COUNT(*) as breakeven FROM trades WHERE profit = 0')
        breakeven = cursor.fetchone()[0]

        if total > 0:
            win_rate = (wins / total) * 100
            loss_rate = (losses / total) * 100
            print(f'Trading Statistics:')
            print(f'   Total Trades: {total}')
            print(f'   Wins: {wins}')
            print(f'   Losses: {losses}')
            print(f'   Breakeven: {breakeven}')
            print(f'   Win Rate: {win_rate:.1f}%')
            print(f'   Loss Rate: {loss_rate:.1f}%')
            print(f'   Win/Loss Ratio: {wins/losses:.2f}' if losses > 0 else '   Win/Loss Ratio: Perfect (no losses)')

            # Show recent trades
            cursor.execute('SELECT signal_type, entry_price, exit_price, profit, timestamp FROM trades ORDER BY timestamp DESC LIMIT 5')
            recent_trades = cursor.fetchall()
            if recent_trades:
                print(f'\nRecent Trades:')
                for trade in recent_trades:
                    signal, entry, exit_price, profit, timestamp = trade
                    print(f'   {signal} at {entry:.2f} -> {exit_price:.2f} = {profit:+.2f}')
        else:
            print('No trades recorded yet. The bot is generating signals but no trades have been executed.')
    else:
        print('No trades table found. The bot hasn\'t recorded any trades yet.')

    conn.close()
else:
    print('Database not found. The bot hasn\'t been run long enough to create trade records.')
