"""
Account configuration validator and safety checks.
Prevents accidental live trading without explicit confirmation.
"""

import os
import sys
from infrastructure.logger import logger


class AccountValidator:
    """Validates account configuration and prevents accidental live trading."""
    
    @staticmethod
    def validate_and_confirm_account(config) -> bool:
        """
        Validate account configuration and get user confirmation for live trading.
        
        Args:
            config: Configuration object
            
        Returns:
            True if configuration is valid and user has confirmed (if needed)
            
        Raises:
            SystemExit: If live trading is not properly confirmed
        """
        # Handle both dictionary and object configs
        if isinstance(config, dict):
            # Dictionary-style access - Follow same priority as in config.py
            
            # Check environment variable first (highest priority)
            env_live = os.getenv("LEMOTICK_LIVE_ACCOUNT", "").lower()
            if env_live in ("true", "1", "yes"):
                is_demo = False
                account_type = "real"
            elif env_live in ("false", "0", "no"):
                is_demo = True
                account_type = "demo"
            else:
                # Check new account_mode configuration
                use_live = config.get('account_mode', {}).get('use_live_account', False)
                if use_live:
                    is_demo = False
                    account_type = "real"
                else:
                    # Fall back to deprecated development.demo_account
                    is_demo = config.get('development', {}).get('demo_account', True)
                    account_type = "demo" if is_demo else "real"
                    
            requires_confirmation = config.get('account_mode', {}).get('require_explicit_confirmation', True)
        else:
            # Object-style access
            account_type = config.get_account_type()
            is_demo = config.is_demo_account()
            requires_confirmation = config.requires_live_confirmation()
        
        # Check environment variable for auto-confirmation
        auto_confirm = os.getenv("LEMOTICK_CONFIRM_LIVE", "").lower() in ("true", "1", "yes")
        
        if is_demo:
            logger.info("=" * 80)
            logger.info("DEMO ACCOUNT MODE ACTIVE")
            logger.info("=" * 80)
            logger.info("Account Type: DEMO (Paper Trading)")
            logger.info("Risk Level: SAFE - No real money at risk")
            logger.info("Purpose: Testing and development")
            logger.info("=" * 80)
            return True
        
        # LIVE ACCOUNT - Show prominent warning
        logger.critical("=" * 80)
        logger.critical(" WARNING: LIVE ACCOUNT MODE DETECTED!")
        logger.critical("=" * 80)
        logger.critical("Account Type: REAL / LIVE")
        logger.critical("Risk Level:   REAL MONEY TRADING ENABLED")
        logger.critical("=" * 80)
        
        # Display account settings based on config type
        if isinstance(config, dict):
            # Dictionary-style access
            account_type_key = "demo" if is_demo else "real"
            account_config = config.get('accounts', {}).get(account_type_key, {})
            min_stake = account_config.get("min_stake", 0)
            max_stake = account_config.get("max_stake", 0)
            initial_equity = account_config.get("initial_equity", 0)
            risk_per_trade = account_config.get("risk_per_trade", 0)
        else:
            # Object-style access
            min_stake = config.get_account_config("min_stake", 0)
            max_stake = config.get_account_config("max_stake", 0)
            initial_equity = config.get_account_config("initial_equity", 0)
            risk_per_trade = config.get_account_config("risk_per_trade", 0)
        
        logger.critical(f"Min Stake: ${min_stake:.2f}")
        logger.critical(f"Max Stake: ${max_stake:.2f}")
        logger.critical(f"Initial Equity: ${initial_equity:.2f}")
        logger.critical(f"Risk Per Trade: {risk_per_trade * 100:.1f}%")
        logger.critical("=" * 80)
        
        # Check if confirmation is required
        if not requires_confirmation:
            logger.warning("  Explicit confirmation DISABLED in config")
            logger.warning("Proceeding with LIVE trading without user confirmation")
            return True
        
        # Check for auto-confirmation via environment variable
        if auto_confirm:
            logger.warning("  Auto-confirmation enabled via LEMOTICK_CONFIRM_LIVE=true")
            logger.warning("Proceeding with LIVE trading")
            return True
        
        # Require interactive confirmation
        logger.critical("=" * 80)
        logger.critical(" EXPLICIT CONFIRMATION REQUIRED")
        logger.critical("=" * 80)
        logger.critical("You are about to start trading with REAL MONEY.")
        logger.critical("Type 'YES, TRADE LIVE' to confirm, or anything else to abort.")
        logger.critical("=" * 80)
        
        try:
            # Read from stdin
            user_input = input("Confirm live trading: ").strip()
            
            if user_input == "YES, TRADE LIVE":
                logger.warning(" Live trading confirmed by user")
                logger.warning("Starting bot with REAL MONEY trading...")
                return True
            else:
                logger.error(" Live trading NOT confirmed")
                logger.error(f"You entered: '{user_input}'")
                logger.error("Expected: 'YES, TRADE LIVE'")
                logger.error("Aborting to prevent accidental live trading")
                sys.exit(1)
                
        except (EOFError, KeyboardInterrupt):
            logger.error("\n Confirmation interrupted")
            logger.error("Aborting to prevent accidental live trading")
            sys.exit(1)
    
    @staticmethod
    def display_startup_banner(config):
        """Display startup banner with account information."""
        # Handle both dictionary and object configs
        if isinstance(config, dict):
            # Dictionary-style access - Follow same priority as in config.py
            
            # Check environment variable first (highest priority)
            env_live = os.getenv("LEMOTICK_LIVE_ACCOUNT", "").lower()
            if env_live in ("true", "1", "yes"):
                is_demo = False
                account_type = "real"
            elif env_live in ("false", "0", "no"):
                is_demo = True
                account_type = "demo"
            else:
                # Check new account_mode configuration
                use_live = config.get('account_mode', {}).get('use_live_account', False)
                if use_live:
                    is_demo = False
                    account_type = "real"
                else:
                    # Fall back to deprecated development.demo_account
                    is_demo = config.get('development', {}).get('demo_account', True)
                    account_type = "demo" if is_demo else "real"
        else:
            # Object-style access
            account_type = config.get_account_type()
            is_demo = config.is_demo_account()
        
        # Get account config based on config type
        if isinstance(config, dict):
            # Dictionary-style access
            account_type_key = "demo" if is_demo else "real"
            account_config = config.get('accounts', {}).get(account_type_key, {})
            min_stake = account_config.get("min_stake", 0)
            max_stake = account_config.get("max_stake", 0)
            risk_per_trade = account_config.get("risk_per_trade", 0) * 100
        else:
            # Object-style access
            min_stake = config.get_account_config("min_stake", 0)
            max_stake = config.get_account_config("max_stake", 0)
            risk_per_trade = config.get_account_config("risk_per_trade", 0) * 100
        
        print("\n")
        print("=" * 80)
        print("  _                     _____ _      _    ")
        print(" | |    ___ _ __ ___   |_   _(_) ___| | __")
        print(" | |   / _ \\ '_ ` _ \\    | | | |/ __| |/ /")
        print(" | |__|  __/ | | | | |   | | | | (__|   < ")
        print(" |_____\\___|_| |_| |_|   |_| |_|\\___|_|\\_\\")
        print("                                          ")
        print("  Algorithmic Trading Bot v2.0")
        print("=" * 80)
        
        if is_demo:
            print("MODE: DEMO ACCOUNT (Paper Trading)")
            print("FUNDS: Virtual money - no real risk")
        else:
            print("MODE: LIVE ACCOUNT (REAL MONEY TRADING)")
            print("FUNDS: REAL MONEY AT RISK")
        
        print(f"STAKE RANGE: ${min_stake:.2f} - ${max_stake:.2f}")
        print(f"RISK: {risk_per_trade:.1f}% per trade")
        print("=" * 80)
        print("\n")


def validate_account_before_start(config) -> bool:
    """
    Validate account configuration before starting the bot.
    
    Args:
        config: Configuration object
        
    Returns:
        True if validation passes
        
    Raises:
        SystemExit: If validation fails or user doesn't confirm live trading
    """
    validator = AccountValidator()
    
    # Display startup banner
    validator.display_startup_banner(config)
    
    # Validate and confirm account
    return validator.validate_and_confirm_account(config)



