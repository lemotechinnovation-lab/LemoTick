"""
Main entry point for LemoTick Autostart Bot
"""

import sys
from pathlib import Path

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from lemotickautostart.config import Settings
from lemotickautostart.logger import setup_logger
from lemotickautostart.core.bot import TradingBot


logger = setup_logger(__name__)


def main():
    """Main entry point for the bot"""
    try:
        logger.info("=" * 80)
        logger.info("LemoTick Autostart Bot v1.0.0")
        logger.info("Professional Binary Options Trading Bot")
        logger.info("=" * 80)
        
        # Load configuration
        settings = Settings.load()
        logger.info(f"Configuration loaded: {settings.trading_mode.upper()} mode")
        logger.info(f"Symbol: {settings.symbol}")
        logger.info(f"Timeframe: {settings.timeframe}")
        logger.info(f"Stake: ${settings.stake_amount}")
        
        # Initialize bot with ConnectionManager + StreamManager
        bot = TradingBot(settings)
        logger.info("Bot initialized successfully")
        
        # Start bot
        logger.info("Starting bot...")
        bot.start()
        
    except KeyboardInterrupt:
        logger.info("Bot stopped by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Fatal error: {str(e)}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
