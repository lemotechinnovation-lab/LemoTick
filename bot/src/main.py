"""
LemoTick Bot - Main Entry Point
Enterprise-grade trading bot for investor management system
"""

import asyncio
import logging
import sys
from pathlib import Path

# Add the src directory to Python path
sys.path.append(str(Path(__file__).parent))

from core.bot_engine import LemoTickBot
from core.config_manager import ConfigManager
from core.logger import setup_logging
from integrations.backend_client import BackendClient


async def main():
    """Main entry point for the LemoTick trading bot"""
    try:
        # Setup logging
        setup_logging()
        logger = logging.getLogger(__name__)
        logger.info("Starting LemoTick Bot...")
        
        # Load configuration
        config_manager = ConfigManager()
        config = config_manager.load_config()
        
        # Initialize backend client for investor management integration
        backend_client = BackendClient(config.get('backend', {}))
        
        # Initialize and start the bot
        bot = LemoTickBot(config, backend_client)
        await bot.start()

    except KeyboardInterrupt:
        logger.info("Bot stopped by user")
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())