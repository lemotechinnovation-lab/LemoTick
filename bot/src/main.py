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
from infrastructure.logger import setup_logging
from integrations.backend_client import BackendClient


async def main():
    """Main entry point for the LemoTick trading bot"""
    # Setup logging first
    setup_logging()
    logger = logging.getLogger(__name__)
    
    try:
        logger.info("Starting LemoTick Bot...")
        
        # Load configuration
        config_manager = ConfigManager()
        config = config_manager.load_config()
        
        #  CRITICAL: Validate account configuration and get user confirmation
        try:
            from utils.account_validator import validate_account_before_start
            logger.info("Validating account configuration...")
            if not validate_account_before_start(config):
                logger.error("Account validation failed")
                sys.exit(1)
            
            logger.info(" Account configuration validated")
        except ImportError as e:
            logger.warning(f"Account validator not available: {e}")
            logger.info("Proceeding without account validation")
        
        # Metrics server will be started by LemoTickBot
        
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

