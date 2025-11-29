"""
LemoTick Bot - Main Entry Point
Enterprise-grade trading bot for investor management system
"""

import asyncio
import logging
import sys
import traceback
from pathlib import Path

# Ensure project root path is in sys.path
ROOT_PATH = Path(__file__).resolve().parent
sys.path.append(str(ROOT_PATH))

from core.config_manager import ConfigManager
from core.ema_rsi_bot import EMARSIBot
from infrastructure.logger import setup_logging
from integrations.backend_client import BackendClient


async def main() -> None:
    """Main entry for the LemoTick trading bot."""

    # ------------------------------------------------------
    # Initialize logging first
    # ------------------------------------------------------
    setup_logging()
    logger = logging.getLogger("LemoTick.Main")

    logger.info("Starting LemoTick Bot...")

    # ------------------------------------------------------
    # Load configuration
    # ------------------------------------------------------
    try:
        config_manager = ConfigManager()
        config = config_manager.load_config()
        logger.info(f"Configuration loaded successfully: type={type(config)}")
    except Exception as e:
        logger.error(f"Failed to load configuration: {e}")
        traceback.print_exc()
        sys.exit(1)

    # ------------------------------------------------------
    # Validate account (optional)
    # ------------------------------------------------------
    try:
        from utils.account_validator import AccountValidator

        logger.info("Validating account configuration...")
        if not AccountValidator.validate_and_confirm_account(config):
            logger.error("Account validation failed.")
            sys.exit(1)

        logger.info("Account configuration validated.")
    except ImportError:
        logger.warning("AccountValidator not found — skipping account validation.")

    # ------------------------------------------------------
    # Backend client
    # ------------------------------------------------------
    try:
        backend_cfg = config.get("backend", {})
        logger.info(f"Backend config: {backend_cfg}")

        backend_client = BackendClient(backend_cfg)
        logger.info("Backend client initialized.")
    except Exception as e:
        logger.error(f"Backend client initialization failed: {e}")
        traceback.print_exc()
        sys.exit(1)

    # ------------------------------------------------------
    # Initialize and start bot
    # ------------------------------------------------------
    try:
        logger.info("Initializing trading bot...")
        bot = EMARSIBot(config, backend_client)
        logger.info("Bot initialized. Starting engine...")

        await bot.start()  # <--- async engine loop
    except Exception as e:
        logger.error(f"Failed to start bot: {e}")
        traceback.print_exc()
        sys.exit(1)


# ------------------------------------------------------
# Run async entrypoint
# ------------------------------------------------------
if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nBot stopped via CTRL+C")
