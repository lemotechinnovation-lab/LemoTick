"""
Enhanced Performance Monitoring System for LemoTick Bot.
Implements comprehensive performance tracking and analysis.

Features:
- Real-time performance metrics
- Win rate analysis
- Drawdown monitoring
- Trade quality assessment
- Performance alerts
"""

import time
import json
import os
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
import numpy as np
from infrastructure.logger import logger
from infrastructure.config import config


@dataclass
class PerformanceMetrics:
    """Performance metrics data structure."""
    timestamp: float
    total_trades: int
    winning_trades: int
    losing_trades: int
    win_rate: float
    total_profit: float
    current_equity: float
    max_drawdown: float
    consecutive_losses: int
    consecutive_wins: int
    trades_per_hour: float
    profit_per_hour: float
    sharpe_ratio: float
    profit_factor: float
    avg_trade_duration: float
    signal_quality_avg: float


@dataclass
class TradeQuality:
    """Trade quality assessment."""
    trade_id: str
    timestamp: float
    signal_type: str
    signal_quality: float
    pattern_confidence: float
    trend_strength: float
    momentum_strength: float
    volatility: float
    outcome: str  # 'win', 'loss', 'pending'
    profit: float
    duration: float


class PerformanceMonitor:
    """
    Enhanced performance monitoring system.

    Features:
    - Real-time performance tracking
    - Win rate analysis and alerts
    - Drawdown monitoring
    - Trade quality assessment
    - Performance optimization suggestions
    """

    def __init__(self, data_path: str = "data/performance"):
        """Initialize performance monitor."""
        self.data_path = data_path
        self.metrics_history: List[PerformanceMetrics] = []
        self.trade_quality_history: List[TradeQuality] = []

        # Performance thresholds
        self.min_win_rate = config.get('risk_management.min_win_rate_threshold', 0.60)
        self.max_drawdown = config.get('risk_management.max_daily_drawdown', 0.03)
        self.max_consecutive_losses = config.get('risk_management.max_consecutive_losses', 3)

        # Alert settings
        self.alerts_enabled = True
        self.alert_cooldown = 300  # 5 minutes between alerts
        self.last_alert_time = 0

        # Ensure data directory exists
        os.makedirs(data_path, exist_ok=True)

        logger.info("Performance Monitor initialized")
        logger.info(f"Min win rate threshold: {self.min_win_rate:.1%}")
        logger.info(f"Max drawdown threshold: {self.max_drawdown:.1%}")

    def update_metrics(self,
                       total_trades: int,
                       winning_trades: int,
                       total_profit: float,
                       current_equity: float,
                       consecutive_losses: int = 0,
                       consecutive_wins: int = 0,
                       signal_quality_avg: float = 0.0) -> PerformanceMetrics:
        """
        Update performance metrics.

        Args:
            total_trades: Total number of trades
            winning_trades: Number of winning trades
            total_profit: Total profit/loss
            current_equity: Current equity
            consecutive_losses: Current consecutive losses
            consecutive_wins: Current consecutive wins
            signal_quality_avg: Average signal quality

        Returns:
            Updated PerformanceMetrics object
        """
        losing_trades = total_trades - winning_trades
        win_rate = (winning_trades / total_trades * 100) if total_trades > 0 else 0

        # Calculate additional metrics
        trades_per_hour = self._calculate_trades_per_hour(total_trades)
        profit_per_hour = self._calculate_profit_per_hour(total_profit)
        sharpe_ratio = self._calculate_sharpe_ratio()
        profit_factor = self._calculate_profit_factor()
        avg_trade_duration = self._calculate_avg_trade_duration()
        max_drawdown = self._calculate_max_drawdown(current_equity)

        metrics = PerformanceMetrics(
            timestamp=time.time(),
            total_trades=total_trades,
            winning_trades=winning_trades,
            losing_trades=losing_trades,
            win_rate=win_rate,
            total_profit=total_profit,
            current_equity=current_equity,
            max_drawdown=max_drawdown,
            consecutive_losses=consecutive_losses,
            consecutive_wins=consecutive_wins,
            trades_per_hour=trades_per_hour,
            profit_per_hour=profit_per_hour,
            sharpe_ratio=sharpe_ratio,
            profit_factor=profit_factor,
            avg_trade_duration=avg_trade_duration,
            signal_quality_avg=signal_quality_avg
        )

        # Add to history
        self.metrics_history.append(metrics)

        # Keep only last 1000 entries
        if len(self.metrics_history) > 1000:
            self.metrics_history = self.metrics_history[-1000:]

        # Check for alerts
        self._check_performance_alerts(metrics)

        # Log performance summary every 10 trades
        if total_trades > 0 and total_trades % 10 == 0:
            self._log_performance_summary(metrics)

        return metrics

    def record_trade_quality(self,
                            trade_id: str,
                            signal_type: str,
                            signal_quality: float,
                            pattern_confidence: float,
                            trend_strength: float,
                            momentum_strength: float,
                            volatility: float,
                            outcome: str = 'pending',
                            profit: float = 0.0,
                            duration: float = 0.0) -> TradeQuality:
        """
        Record trade quality metrics.

        Args:
            trade_id: Unique trade identifier
            signal_type: BUY/SELL signal type
            signal_quality: Overall signal quality score
            pattern_confidence: Pattern confidence score
            trend_strength: Trend strength score
            momentum_strength: Momentum strength score
            volatility: Market volatility
            outcome: Trade outcome ('win', 'loss', 'pending')
            profit: Trade profit/loss
            duration: Trade duration in minutes

        Returns:
            TradeQuality object
        """
        quality = TradeQuality(
            trade_id=trade_id,
            timestamp=time.time(),
            signal_type=signal_type,
            signal_quality=signal_quality,
            pattern_confidence=pattern_confidence,
            trend_strength=trend_strength,
            momentum_strength=momentum_strength,
            volatility=volatility,
            outcome=outcome,
            profit=profit,
            duration=duration
        )

        self.trade_quality_history.append(quality)

        # Keep only last 500 entries
        if len(self.trade_quality_history) > 500:
            self.trade_quality_history = self.trade_quality_history[-500:]

        logger.debug(f"Trade quality recorded: {trade_id} - Quality: {signal_quality:.2f}")

        return quality

    def update_trade_outcome(self, trade_id: str, outcome: str, profit: float, duration: float):
        """Update trade outcome in quality history."""
        for quality in self.trade_quality_history:
            if quality.trade_id == trade_id:
                quality.outcome = outcome
                quality.profit = profit
                quality.duration = duration
                break

    def _calculate_trades_per_hour(self, total_trades: int) -> float:
        """Calculate trades per hour."""
        if len(self.metrics_history) < 2:
            return 0.0

        time_span = self.metrics_history[-1].timestamp - self.metrics_history[0].timestamp
        hours = time_span / 3600

        return total_trades / hours if hours > 0 else 0.0

    def _calculate_profit_per_hour(self, total_profit: float) -> float:
        """Calculate profit per hour."""
        if len(self.metrics_history) < 2:
            return 0.0

        time_span = self.metrics_history[-1].timestamp - self.metrics_history[0].timestamp
        hours = time_span / 3600

        return total_profit / hours if hours > 0 else 0.0

    def _calculate_sharpe_ratio(self) -> float:
        """Calculate Sharpe ratio from equity history."""
        if len(self.metrics_history) < 2:
            return 0.0

        equity_values = [m.current_equity for m in self.metrics_history]
        returns = np.diff(equity_values) / equity_values[:-1]

        if len(returns) == 0 or np.std(returns) == 0:
            return 0.0

        return np.mean(returns) / np.std(returns) * np.sqrt(252)  # Annualized

    def _calculate_profit_factor(self) -> float:
        """Calculate profit factor from trade quality history."""
        if not self.trade_quality_history:
            return 0.0

        completed_trades = [t for t in self.trade_quality_history if t.outcome in ['win', 'loss']]

        if not completed_trades:
            return 0.0

        gross_profit = sum(t.profit for t in completed_trades if t.profit > 0)
        gross_loss = abs(sum(t.profit for t in completed_trades if t.profit < 0))

        return gross_profit / gross_loss if gross_loss > 0 else float('inf')

    def _calculate_avg_trade_duration(self) -> float:
        """Calculate average trade duration."""
        completed_trades = [t for t in self.trade_quality_history if t.outcome in ['win', 'loss'] and t.duration > 0]

        if not completed_trades:
            return 0.0

        return sum(t.duration for t in completed_trades) / len(completed_trades)

    def _calculate_max_drawdown(self, current_equity: float) -> float:
        """Calculate maximum drawdown."""
        if not self.metrics_history:
            return 0.0

        peak_equity = max(m.current_equity for m in self.metrics_history)
        drawdown = (peak_equity - current_equity) / peak_equity if peak_equity > 0 else 0.0

        return max(drawdown, 0.0)

    def _check_performance_alerts(self, metrics: PerformanceMetrics):
        """Check for performance alerts."""
        if not self.alerts_enabled:
            return

        current_time = time.time()

        # Check if we're in cooldown
        if current_time - self.last_alert_time < self.alert_cooldown:
            return

        alerts = []

        # Win rate alert
        if metrics.total_trades >= 10 and metrics.win_rate < self.min_win_rate * 100:
            alerts.append(f" LOW WIN RATE: {metrics.win_rate:.1f}% (below {self.min_win_rate:.1%})")

        # Drawdown alert
        if metrics.max_drawdown > self.max_drawdown:
            alerts.append(f" HIGH DRAWDOWN: {metrics.max_drawdown:.1%} (above {self.max_drawdown:.1%})")

        # Consecutive losses alert
        if metrics.consecutive_losses >= self.max_consecutive_losses:
            alerts.append(f" CONSECUTIVE LOSSES: {metrics.consecutive_losses} (above {self.max_consecutive_losses})")

        # Signal quality alert
        if metrics.signal_quality_avg < 0.6:
            alerts.append(f" LOW SIGNAL QUALITY: {metrics.signal_quality_avg:.2f} (below 0.60)")

        # Send alerts
        if alerts:
            for alert in alerts:
                logger.warning(alert)

            self.last_alert_time = current_time

    def _log_performance_summary(self, metrics: PerformanceMetrics):
        """Log performance summary."""
        logger.info("=" * 60)
        logger.info(" PERFORMANCE SUMMARY")
        logger.info("=" * 60)
        logger.info(f"Total Trades: {metrics.total_trades}")
        logger.info(f"Win Rate: {metrics.win_rate:.1f}% ({metrics.winning_trades}W/{metrics.losing_trades}L)")
        logger.info(f"Total Profit: ${metrics.total_profit:.2f}")
        logger.info(f"Current Equity: ${metrics.current_equity:.2f}")
        logger.info(f"Max Drawdown: {metrics.max_drawdown:.1%}")
        logger.info(f"Trades/Hour: {metrics.trades_per_hour:.1f}")
        logger.info(f"Profit/Hour: ${metrics.profit_per_hour:.2f}")
        logger.info(f"Sharpe Ratio: {metrics.sharpe_ratio:.2f}")
        logger.info(f"Profit Factor: {metrics.profit_factor:.2f}")
        logger.info(f"Avg Trade Duration: {metrics.avg_trade_duration:.1f} min")
        logger.info(f"Signal Quality: {metrics.signal_quality_avg:.2f}")
        logger.info("=" * 60)

    def get_performance_report(self) -> Dict:
        """Get comprehensive performance report."""
        if not self.metrics_history:
            return {"error": "No performance data available"}

        latest_metrics = self.metrics_history[-1]

        # Calculate additional statistics
        win_rates = [m.win_rate for m in self.metrics_history if m.total_trades > 0]
        avg_win_rate = np.mean(win_rates) if win_rates else 0

        # Trade quality analysis
        completed_trades = [t for t in self.trade_quality_history if t.outcome in ['win', 'loss']]
        avg_signal_quality = np.mean([t.signal_quality for t in completed_trades]) if completed_trades else 0

        # Performance trends
        recent_metrics = self.metrics_history[-10:] if len(self.metrics_history) >= 10 else self.metrics_history
        recent_win_rate = np.mean([m.win_rate for m in recent_metrics if m.total_trades > 0]) if recent_metrics else 0

        return {
            "current_performance": asdict(latest_metrics),
            "statistics": {
                "avg_win_rate": avg_win_rate,
                "avg_signal_quality": avg_signal_quality,
                "recent_win_rate": recent_win_rate,
                "total_quality_records": len(self.trade_quality_history),
                "performance_records": len(self.metrics_history)
            },
            "recommendations": self._generate_recommendations(latest_metrics)
        }

    def _generate_recommendations(self, metrics: PerformanceMetrics) -> List[str]:
        """Generate performance improvement recommendations."""
        recommendations = []

        # Win rate recommendations
        if metrics.win_rate < 60:
            recommendations.append("Increase signal quality threshold to improve win rate")
            recommendations.append("Enable trend and momentum confirmation filters")
            recommendations.append("Reduce trade frequency to focus on high-quality signals")

        # Drawdown recommendations
        if metrics.max_drawdown > 0.05:
            recommendations.append("Reduce position size to limit drawdown")
            recommendations.append("Implement stricter stop-loss rules")
            recommendations.append("Consider taking a break after consecutive losses")

        # Signal quality recommendations
        if metrics.signal_quality_avg < 0.7:
            recommendations.append("Improve pattern recognition accuracy")
            recommendations.append("Add more confirmation indicators")
            recommendations.append("Filter out low-quality market conditions")

        # Trading frequency recommendations
        if metrics.trades_per_hour > 10:
            recommendations.append("Reduce trading frequency to improve signal quality")
            recommendations.append("Implement longer cooldown periods between trades")

        return recommendations

    def save_performance_data(self, filename: str = None):
        """Save performance data to file."""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"performance_data_{timestamp}.json"

        filepath = os.path.join(self.data_path, filename)

        data = {
            "metrics_history": [asdict(m) for m in self.metrics_history],
            "trade_quality_history": [asdict(t) for t in self.trade_quality_history],
            "export_timestamp": datetime.now().isoformat()
        }

        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)

        logger.info(f"Performance data saved to {filepath}")

    def load_performance_data(self, filename: str):
        """Load performance data from file."""
        filepath = os.path.join(self.data_path, filename)

        if not os.path.exists(filepath):
            logger.error(f"Performance data file not found: {filepath}")
            return False

        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)

            # Load metrics history
            self.metrics_history = [PerformanceMetrics(**m) for m in data.get('metrics_history', [])]

            # Load trade quality history
            self.trade_quality_history = [TradeQuality(**t) for t in data.get('trade_quality_history', [])]

            logger.info(f"Performance data loaded from {filepath}")
            logger.info(f"Loaded {len(self.metrics_history)} metrics records")
            logger.info(f"Loaded {len(self.trade_quality_history)} trade quality records")

            return True

        except Exception as e:
            logger.error(f"Error loading performance data: {e}")
            return False


# Global performance monitor instance
performance_monitor = None


def get_performance_monitor() -> PerformanceMonitor:
    """Get global performance monitor instance."""
    global performance_monitor
    if performance_monitor is None:
        performance_monitor = PerformanceMonitor()
    return performance_monitor

