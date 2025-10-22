"""
Data recording module for LemoTick bot.
Handles persistence of ticks, trades, and performance data.
"""

import sqlite3
import csv
import json
from pathlib import Path
from typing import Dict, Any, Optional, List
from datetime import datetime
from .config import config
from .logger import logger
from .utils.helpers import get_timestamp, get_utc_timestamp


class DataRecorder:
    """Handles data persistence for ticks, trades, and performance metrics."""

    def __init__(self, data_dir: str = "data"):
        """
        Initialize data recorder.

        Args:
            data_dir: Directory for data storage
        """
        self.data_dir = Path(data_dir)
        self.db_path = self.data_dir / "bot_state.db"

        # Create data directories
        self.data_dir.mkdir(exist_ok=True)
        (self.data_dir / "ticks").mkdir(exist_ok=True)
        (self.data_dir / "trades").mkdir(exist_ok=True)
        (self.data_dir / "backtests").mkdir(exist_ok=True)

        # Initialize database
        self._init_database()

        logger.info(f"Data recorder initialized. Data directory: {self.data_dir}")

    def _init_database(self) -> None:
        """Initialize SQLite database with required tables."""
        try:
            conn = sqlite3.connect(self.db_path, check_same_thread=False)
            cursor = conn.cursor()

            # Trades table
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS trades (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    trade_id TEXT UNIQUE,
                    timestamp INTEGER,
                    signal_type TEXT,
                    contract_type TEXT,
                    stake REAL,
                    entry_price REAL,
                    exit_price REAL,
                    profit REAL,
                    status TEXT,
                    contract_id TEXT,
                    proposal_id TEXT,
                    completion_time INTEGER,
                    created_at TEXT
                )
            """
            )

            # Ticks table (for storing tick data if needed)
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS ticks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp INTEGER,
                    price REAL,
                    epoch INTEGER,
                    symbol TEXT,
                    created_at TEXT
                )
            """
            )

            # Performance metrics table
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS performance (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date TEXT,
                    total_trades INTEGER,
                    wins INTEGER,
                    losses INTEGER,
                    total_profit REAL,
                    win_rate REAL,
                    max_drawdown REAL,
                    equity_start REAL,
                    equity_end REAL,
                    created_at TEXT
                )
            """
            )

            # Configuration table (for storing runtime config)
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS config_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp INTEGER,
                    config_json TEXT,
                    created_at TEXT
                )
            """
            )

            # Create indexes for better performance
            cursor.execute(
                "CREATE INDEX IF NOT EXISTS idx_trades_timestamp ON trades(timestamp)"
            )
            cursor.execute(
                "CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status)"
            )
            cursor.execute(
                "CREATE INDEX IF NOT EXISTS idx_ticks_timestamp ON ticks(timestamp)"
            )
            cursor.execute(
                "CREATE INDEX IF NOT EXISTS idx_ticks_symbol ON ticks(symbol)"
            )

            conn.commit()
            conn.close()

            logger.info("Database initialized successfully")

        except Exception as e:
            logger.error(f"Error initializing database: {e}")
            raise

    def record_tick(self, price: float, epoch: int, symbol: str = None) -> None:
        """
        Record tick data.

        Args:
            price: Tick price
            epoch: Tick epoch timestamp
            symbol: Trading symbol
        """
        try:
            symbol = symbol or config.symbol  # Always use current config symbol
            timestamp = get_timestamp()
            created_at = get_utc_timestamp()

            conn = sqlite3.connect(self.db_path, check_same_thread=False)
            cursor = conn.cursor()

            cursor.execute(
                """
                INSERT INTO ticks (timestamp, price, epoch, symbol, created_at)
                VALUES (?, ?, ?, ?, ?)
            """,
                (timestamp, price, epoch, symbol, created_at),
            )

            conn.commit()
            conn.close()

        except Exception as e:
            logger.error(f"Error recording tick: {e}")

    def record_trade(self, trade_data: Dict[str, Any]) -> None:
        """
        Record trade data.

        Args:
            trade_data: Trade information dictionary
        """
        try:
            conn = sqlite3.connect(self.db_path, check_same_thread=False)
            cursor = conn.cursor()

            # Extract trade information
            trade_id = trade_data.get("trade_id", "")
            timestamp = trade_data.get("timestamp", get_timestamp())
            signal_type = trade_data.get("signal_type", "")
            contract_type = trade_data.get("contract_type", "")
            stake = trade_data.get("stake", 0.0)
            entry_price = trade_data.get("entry_price", 0.0)
            exit_price = trade_data.get("exit_price", 0.0)
            profit = trade_data.get("profit", 0.0)
            status = trade_data.get("status", "unknown")
            contract_id = trade_data.get("contract_id", "")
            proposal_id = trade_data.get("proposal_id", "")
            completion_time = trade_data.get("completion_time", 0)
            created_at = get_utc_timestamp()

            cursor.execute(
                """
                INSERT OR REPLACE INTO trades (
                    trade_id, timestamp, signal_type, contract_type, stake,
                    entry_price, exit_price, profit, status, contract_id,
                    proposal_id, completion_time, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    trade_id,
                    timestamp,
                    signal_type,
                    contract_type,
                    stake,
                    entry_price,
                    exit_price,
                    profit,
                    status,
                    contract_id,
                    proposal_id,
                    completion_time,
                    created_at,
                ),
            )

            conn.commit()
            conn.close()

            logger.debug(f"Trade recorded: {trade_id}")

        except Exception as e:
            logger.error(f"Error recording trade: {e}")

    def update_trade_status(self, contract_id: str, status: str, exit_price: float = None, profit: float = None) -> None:
        """
        Update trade status in the database.

        Args:
            contract_id: Contract ID to update
            status: New status (e.g., "closed", "cancelled")
            exit_price: Exit price (optional)
            profit: Profit/loss amount (optional)
        """
        try:
            conn = sqlite3.connect(self.db_path, check_same_thread=False)
            cursor = conn.cursor()

            # Build update query dynamically based on provided parameters
            update_fields = ["status = ?"]
            update_values = [status]

            if exit_price is not None:
                update_fields.append("exit_price = ?")
                update_values.append(exit_price)

            if profit is not None:
                update_fields.append("profit = ?")
                update_values.append(profit)

            # Add completion time for closed trades
            if status == "closed":
                update_fields.append("completion_time = ?")
                update_values.append(get_timestamp())

            update_values.append(contract_id)

            query = f"""
                UPDATE trades 
                SET {', '.join(update_fields)}
                WHERE contract_id = ?
            """

            cursor.execute(query, update_values)
            conn.commit()
            conn.close()

            logger.info(f"Trade status updated: {contract_id} -> {status}")

        except Exception as e:
            logger.error(f"Error updating trade status: {e}")

    def record_performance(self, performance_data: Dict[str, Any]) -> None:
        """
        Record daily performance metrics.

        Args:
            performance_data: Performance metrics dictionary
        """
        try:
            conn = sqlite3.connect(self.db_path, check_same_thread=False)
            cursor = conn.cursor()

            date = performance_data.get("date", datetime.now().strftime("%Y-%m-%d"))
            total_trades = performance_data.get("total_trades", 0)
            wins = performance_data.get("wins", 0)
            losses = performance_data.get("losses", 0)
            total_profit = performance_data.get("total_profit", 0.0)
            win_rate = performance_data.get("win_rate", 0.0)
            max_drawdown = performance_data.get("max_drawdown", 0.0)
            equity_start = performance_data.get("equity_start", 0.0)
            equity_end = performance_data.get("equity_end", 0.0)
            created_at = get_utc_timestamp()

            cursor.execute(
                """
                INSERT INTO performance (
                    date, total_trades, wins, losses, total_profit,
                    win_rate, max_drawdown, equity_start, equity_end, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    date,
                    total_trades,
                    wins,
                    losses,
                    total_profit,
                    win_rate,
                    max_drawdown,
                    equity_start,
                    equity_end,
                    created_at,
                ),
            )

            conn.commit()
            conn.close()

            logger.info(f"Performance recorded for {date}")

        except Exception as e:
            logger.error(f"Error recording performance: {e}")

    def get_trades(
        self,
        start_time: Optional[int] = None,
        end_time: Optional[int] = None,
        status: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Retrieve trades from database.

        Args:
            start_time: Start timestamp filter
            end_time: End timestamp filter
            status: Status filter

        Returns:
            List of trade dictionaries
        """
        try:
            conn = sqlite3.connect(self.db_path, check_same_thread=False)
            cursor = conn.cursor()

            query = "SELECT * FROM trades WHERE 1=1"
            params = []

            if start_time:
                query += " AND timestamp >= ?"
                params.append(start_time)

            if end_time:
                query += " AND timestamp <= ?"
                params.append(end_time)

            if status:
                query += " AND status = ?"
                params.append(status)

            query += " ORDER BY timestamp DESC"

            cursor.execute(query, params)
            columns = [description[0] for description in cursor.description]
            rows = cursor.fetchall()

            conn.close()

            return [dict(zip(columns, row)) for row in rows]

        except Exception as e:
            logger.error(f"Error retrieving trades: {e}")
            return []

    def get_performance_summary(self, days: int = 30) -> Dict[str, Any]:
        """
        Get performance summary for specified number of days.

        Args:
            days: Number of days to include

        Returns:
            Performance summary dictionary
        """
        try:
            conn = sqlite3.connect(self.db_path, check_same_thread=False)
            cursor = conn.cursor()

            # Get recent performance records
            cursor.execute(
                """
                SELECT * FROM performance
                ORDER BY date DESC
                LIMIT ?
            """,
                (days,),
            )

            columns = [description[0] for description in cursor.description]
            rows = cursor.fetchall()

            conn.close()

            if not rows:
                return {}

            # Calculate summary statistics
            total_trades = sum(row[columns.index("total_trades")] for row in rows)
            total_wins = sum(row[columns.index("wins")] for row in rows)
            total_losses = sum(row[columns.index("losses")] for row in rows)
            total_profit = sum(row[columns.index("total_profit")] for row in rows)

            win_rate = (total_wins / total_trades * 100) if total_trades > 0 else 0
            max_drawdown = (
                max(row[columns.index("max_drawdown")] for row in rows) if rows else 0
            )

            return {
                "period_days": days,
                "total_trades": total_trades,
                "total_wins": total_wins,
                "total_losses": total_losses,
                "total_profit": total_profit,
                "win_rate": win_rate,
                "max_drawdown": max_drawdown,
                "avg_daily_profit": total_profit / days if days > 0 else 0,
            }

        except Exception as e:
            logger.error(f"Error calculating performance summary: {e}")
            return {}

    def export_trades_to_csv(self, filename: Optional[str] = None) -> str:
        """
        Export trades to CSV file.

        Args:
            filename: Output filename (optional)

        Returns:
            Path to exported file
        """
        try:
            if not filename:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"trades_export_{timestamp}.csv"

            filepath = self.data_dir / "trades" / filename

            trades = self.get_trades()

            if not trades:
                logger.warning("No trades to export")
                return str(filepath)

            with open(filepath, "w", newline="", encoding="utf-8") as csvfile:
                fieldnames = trades[0].keys()
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(trades)

            logger.info(f"Trades exported to {filepath}")
            return str(filepath)

        except Exception as e:
            logger.error(f"Error exporting trades: {e}")
            return ""

    def save_config_snapshot(self, config_data: Dict[str, Any]) -> None:
        """
        Save configuration snapshot.

        Args:
            config_data: Configuration data to save
        """
        try:
            conn = sqlite3.connect(self.db_path, check_same_thread=False)
            cursor = conn.cursor()

            timestamp = get_timestamp()
            config_json = json.dumps(config_data, indent=2)
            created_at = get_utc_timestamp()

            cursor.execute(
                """
                INSERT INTO config_history (timestamp, config_json, created_at)
                VALUES (?, ?, ?)
            """,
                (timestamp, config_json, created_at),
            )

            conn.commit()
            conn.close()

            logger.debug("Configuration snapshot saved")

        except Exception as e:
            logger.error(f"Error saving config snapshot: {e}")

    def cleanup_old_data(self, days_to_keep: int = 30) -> None:
        """
        Clean up old data to manage database size.

        Args:
            days_to_keep: Number of days of data to keep
        """
        try:
            cutoff_time = get_timestamp() - (days_to_keep * 24 * 60 * 60)

            conn = sqlite3.connect(self.db_path, check_same_thread=False)
            cursor = conn.cursor()

            # Clean up old ticks
            cursor.execute("DELETE FROM ticks WHERE timestamp < ?", (cutoff_time,))
            ticks_deleted = cursor.rowcount

            # Clean up old performance records
            cursor.execute(
                "DELETE FROM performance WHERE date < date('now', '-{} days')".format(
                    days_to_keep
                )
            )
            perf_deleted = cursor.rowcount

            conn.commit()
            conn.close()

            logger.info(
                f"Data cleanup completed: {ticks_deleted} ticks, {perf_deleted} performance records removed"
            )

        except Exception as e:
            logger.error(f"Error cleaning up old data: {e}")

    def get_database_stats(self) -> Dict[str, Any]:
        """
        Get database statistics.

        Returns:
            Database statistics dictionary
        """
        try:
            conn = sqlite3.connect(self.db_path, check_same_thread=False)
            cursor = conn.cursor()

            stats = {}

            # Count records in each table
            tables = ["trades", "ticks", "performance", "config_history"]
            for table in tables:
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                stats[f"{table}_count"] = cursor.fetchone()[0]

            # Get database file size
            stats["db_size_mb"] = self.db_path.stat().st_size / (1024 * 1024)

            conn.close()

            return stats

        except Exception as e:
            logger.error(f"Error getting database stats: {e}")
            return {}
