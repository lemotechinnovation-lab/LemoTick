"""
Telegram notification service for LemoTick bot.
Sends trade alerts and performance updates to your phone.
"""

import os
from typing import Optional
from infrastructure.logger import logger

try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False
    logger.warning("requests library not available - Telegram notifications disabled")


class TelegramNotifier:
    """Send notifications to Telegram."""
    
    def __init__(self, bot_token: Optional[str] = None, chat_id: Optional[str] = None):
        """
        Initialize Telegram notifier.
        
        Args:
            bot_token: Telegram bot token (or set TELEGRAM_BOT_TOKEN env var)
            chat_id: Your Telegram chat ID (or set TELEGRAM_CHAT_ID env var)
            
        Setup Instructions:
        1. Message @BotFather on Telegram -> /newbot -> get your bot_token
        2. Message @userinfobot on Telegram -> get your chat_id
        3. Set environment variables OR pass to this class
        """
        if not REQUESTS_AVAILABLE:
            self.enabled = False
            logger.warning("Telegram notifications disabled - requests library not available")
            return
            
        self.bot_token = bot_token or os.getenv("TELEGRAM_BOT_TOKEN")
        self.chat_id = chat_id or os.getenv("TELEGRAM_CHAT_ID")
        
        if not self.bot_token or not self.chat_id:
            self.enabled = False
            logger.warning("Telegram notifications disabled - bot_token or chat_id not configured")
            logger.info("Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID environment variables to enable")
            return
        
        self.enabled = True
        self.base_url = f"https://api.telegram.org/bot{self.bot_token}"
        
        # Send startup notification
        self.send_message(" LemoTick Bot Started\n\n Telegram notifications active!")
        logger.info(" Telegram notifications enabled")
    
    def send_message(self, message: str, parse_mode: str = "Markdown") -> bool:
        """
        Send message to Telegram.
        
        Args:
            message: Message text (supports Markdown)
            parse_mode: Message format (Markdown or HTML)
            
        Returns:
            True if sent successfully
        """
        if not self.enabled:
            return False
        
        try:
            url = f"{self.base_url}/sendMessage"
            payload = {
                "chat_id": self.chat_id,
                "text": message,
                "parse_mode": parse_mode
            }
            
            response = requests.post(url, json=payload, timeout=5)
            
            if response.status_code == 200:
                return True
            else:
                logger.error(f"Telegram send failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending Telegram message: {e}")
            return False
    
    def notify_trade_opened(self, signal: str, stake: float, duration: int, price: float, strategy: str = "Unknown"):
        """Notify when trade is opened."""
        message = (
            f" *TRADE OPENED*\n\n"
            f"Signal: *{signal}*\n"
            f"Stake: ${stake:.2f}\n"
            f"Duration: {duration} min\n"
            f"Entry: {price:.2f}\n"
            f"Strategy: {strategy}"
        )
        self.send_message(message)
    
    def notify_trade_closed(self, signal: str, stake: float, profit: float, win_rate: float, equity: float):
        """Notify when trade is closed."""
        emoji = "" if profit > 0 else ""
        result = "WIN" if profit > 0 else "LOSS"
        
        message = (
            f"{emoji} *TRADE CLOSED - {result}*\n\n"
            f"Signal: {signal}\n"
            f"Stake: ${stake:.2f}\n"
            f"P&L: ${profit:+.2f} ({profit/stake*100:+.1f}%)\n"
            f"Win Rate: {win_rate:.1f}%\n"
            f"Equity: ${equity:.2f}"
        )
        self.send_message(message)
    
    def notify_performance_summary(self, total_trades: int, wins: int, losses: int, 
                                  profit: float, win_rate: float, equity: float):
        """Send performance summary."""
        message = (
            f" *PERFORMANCE SUMMARY*\n\n"
            f"Trades: {total_trades} ({wins}W / {losses}L)\n"
            f"Win Rate: {win_rate:.1f}%\n"
            f"Total P&L: ${profit:+.2f}\n"
            f"Equity: ${equity:.2f}"
        )
        self.send_message(message)
    
    def notify_alert(self, alert_type: str, message: str):
        """Send critical alerts."""
        emoji_map = {
            "circuit_breaker": "",
            "emergency_stop": "",
            "daily_limit": "",
            "error": "",
            "warning": ""
        }
        
        emoji = emoji_map.get(alert_type, "")
        full_message = f"{emoji} *ALERT: {alert_type.upper()}*\n\n{message}"
        self.send_message(full_message)


# Singleton instance
_notifier_instance = None

def get_telegram_notifier() -> Optional[TelegramNotifier]:
    """Get telegram notifier instance."""
    global _notifier_instance
    
    if _notifier_instance is None:
        _notifier_instance = TelegramNotifier()
    
    return _notifier_instance if _notifier_instance.enabled else None


if __name__ == "__main__":
    # Test the notifier
    print("Testing Telegram Notifier...")
    print("Make sure you set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID environment variables")
    print()
    
    notifier = TelegramNotifier()
    
    if notifier.enabled:
        print(" Telegram configured successfully!")
        notifier.send_message(" Test message from LemoTick bot")
        print("Check your Telegram for test message!")
    else:
        print(" Telegram not configured")
        print("\nSetup Instructions:")
        print("1. Open Telegram and message @BotFather")
        print("2. Send: /newbot")
        print("3. Follow instructions to get your bot_token")
        print("4. Message @userinfobot to get your chat_id")
        print("5. Set environment variables:")
        print("   SET TELEGRAM_BOT_TOKEN=your_token_here")
        print("   SET TELEGRAM_CHAT_ID=your_chat_id_here")



