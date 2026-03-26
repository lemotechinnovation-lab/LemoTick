"""
Notification Service - Send alerts via Gmail
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from datetime import datetime

from lemotickautostart.config import Settings
from lemotickautostart.logger import setup_logger

logger = setup_logger(__name__)


class NotificationService:
    """Send notifications via Gmail"""
    
    def __init__(self, settings: Settings):
        """Initialize notification service"""
        self.settings = settings
        if settings.gmail_enabled:
            logger.info("✅ Gmail notifications enabled")
        else:
            logger.info("⚠️ Gmail notifications disabled")
    
    def send_trade_opened(self, symbol: str, direction: str, stake: float, 
                         entry_price: float, trade_id: str) -> bool:
        """Send notification when trade opens"""
        try:
            message = f"""
🚀 TRADE OPENED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Symbol: {symbol}
Direction: {direction.upper()}
Stake: ${stake:.2f}
Entry Price: {entry_price:.4f}
Trade ID: {trade_id}
Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            """.strip()
            
            if self.settings.gmail_enabled:
                return self._send_gmail(f"Trade Opened: {symbol} {direction}", message)
            else:
                logger.debug("Gmail notifications disabled")
                return False
        
        except Exception as e:
            logger.error(f"Error sending trade opened notification: {e}")
            return False
    
    def send_trade_closed(self, symbol: str, direction: str, stake: float,
                         entry_price: float, exit_price: float, profit: float,
                         trade_id: str) -> bool:
        """Send notification when trade closes"""
        try:
            profit_pct = (profit / stake * 100) if stake > 0 else 0
            status = "✅ WIN" if profit > 0 else "❌ LOSS"
            
            message = f"""
{status} TRADE CLOSED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Symbol: {symbol}
Direction: {direction.upper()}
Stake: ${stake:.2f}
Entry Price: {entry_price:.4f}
Exit Price: {exit_price:.4f}
Profit/Loss: ${profit:.2f} ({profit_pct:.2f}%)
Trade ID: {trade_id}
Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            """.strip()
            
            if self.settings.gmail_enabled:
                return self._send_gmail(f"Trade Closed: {symbol} {direction} - {status}", message)
            else:
                logger.debug("Gmail notifications disabled")
                return False
        
        except Exception as e:
            logger.error(f"Error sending trade closed notification: {e}")
            return False
    
    def _send_gmail(self, subject: str, message: str) -> bool:
        """Send email via Gmail"""
        try:
            if not self.settings.gmail_sender or not self.settings.gmail_password or not self.settings.gmail_recipient:
                logger.warning("Gmail credentials not configured")
                return False
            
            # Create email
            msg = MIMEMultipart()
            msg['From'] = self.settings.gmail_sender
            msg['To'] = self.settings.gmail_recipient
            msg['Subject'] = subject
            msg.attach(MIMEText(message, 'plain'))
            
            # Send email
            with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
                server.login(self.settings.gmail_sender, self.settings.gmail_password)
                server.send_message(msg)
            
            logger.info(f"✅ Email sent to {self.settings.gmail_recipient}")
            return True
        
        except Exception as e:
            logger.error(f"Error sending Gmail: {e}")
            return False
