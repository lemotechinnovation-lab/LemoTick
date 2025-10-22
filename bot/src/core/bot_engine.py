"""
LemoTick Bot Engine
Main orchestrator for the trading bot with investor management integration
"""

import asyncio
import logging
from typing import Dict, Any, Optional
from datetime import datetime

from .config_manager import ConfigManager
from ..services.stream_handler import StreamHandler
from ..services.trade_executor import TradeExecutor
from ..services.risk_manager import RiskManager
from ..integrations.backend_client import BackendClient


class LemoTickBot:
    """
    Main bot engine that orchestrates all trading activities
    with integration to the investor management system
    """
    
    def __init__(self, config: Dict[str, Any], backend_client: BackendClient):
        self.config = config
        self.backend_client = backend_client
        self.logger = logging.getLogger(__name__)
        
        # Initialize core components
        self.stream_handler = StreamHandler(config)
        self.risk_manager = RiskManager(config, backend_client)
        self.trade_executor = TradeExecutor(config, self.risk_manager, backend_client)
        
        # Bot state
        self.is_running = False
        self.start_time = None
        
    async def start(self):
        """Start the bot and all its components"""
        try:
            self.logger.info("Initializing LemoTick Bot...")
            
            # Initialize backend connection
            await self.backend_client.connect()
            
            # Start core components
            await self.stream_handler.start()
            await self.risk_manager.start()
            await self.trade_executor.start()
            
            self.is_running = True
            self.start_time = datetime.now()
            
            self.logger.info("LemoTick Bot started successfully")
            
            # Keep the bot running
            while self.is_running:
                await asyncio.sleep(1)
                
        except Exception as e:
            self.logger.error(f"Error starting bot: {e}")
            await self.stop()
            raise
    
    async def stop(self):
        """Stop the bot and all its components"""
        try:
            self.logger.info("Stopping LemoTick Bot...")
            
            self.is_running = False
            
            # Stop components in reverse order
            if hasattr(self, 'trade_executor'):
                await self.trade_executor.stop()
            
            if hasattr(self, 'risk_manager'):
                await self.risk_manager.stop()
                
            if hasattr(self, 'stream_handler'):
                await self.stream_handler.stop()
            
            if hasattr(self, 'backend_client'):
                await self.backend_client.disconnect()
            
            self.logger.info("LemoTick Bot stopped")
            
        except Exception as e:
            self.logger.error(f"Error stopping bot: {e}")
    
    async def get_status(self) -> Dict[str, Any]:
        """Get current bot status for investor dashboard"""
        return {
            "is_running": self.is_running,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "uptime": (datetime.now() - self.start_time).total_seconds() if self.start_time else 0,
            "stream_status": await self.stream_handler.get_status() if hasattr(self, 'stream_handler') else None,
            "risk_status": await self.risk_manager.get_status() if hasattr(self, 'risk_manager') else None,
            "trade_status": await self.trade_executor.get_status() if hasattr(self, 'trade_executor') else None
        }
