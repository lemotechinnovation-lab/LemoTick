"""
Configuration Manager for LemoTick Bot
Handles loading and managing configuration from various sources
"""

import os
import yaml
import json
from typing import Dict, Any, Optional
from pathlib import Path


class ConfigManager:
    """Manages configuration loading and validation"""
    
    def __init__(self):
        self.config_path = Path(__file__).parent.parent.parent / "config"
        self.config = {}
    
    def load_config(self) -> Dict[str, Any]:
        """Load configuration from multiple sources"""
        try:
            # Load base configuration
            self._load_yaml_config()
            self._load_env_config()
            self._validate_config()
            
            return self.config
            
        except Exception as e:
            raise Exception(f"Failed to load configuration: {e}")
    
    def _load_yaml_config(self):
        """Load configuration from YAML files"""
        settings_file = self.config_path / "settings.yaml"
        if settings_file.exists():
            with open(settings_file, 'r') as f:
                self.config.update(yaml.safe_load(f) or {})
    
    def _load_env_config(self):
        """Load configuration from environment variables"""
        # Check for live account setting first
        lemotick_live_account = os.getenv('LEMOTICK_LIVE_ACCOUNT', '').lower()
        
        # Determine which credentials file to use
        if lemotick_live_account in ('true', '1', 'yes'):
            env_file = self.config_path / "credentials.live.env"
        else:
            env_file = self.config_path / "credentials.demo.env"
        
        # Fallback to credentials.env if the preferred file doesn't exist
        if not env_file.exists():
            env_file = self.config_path / "credentials.env"
        
        if env_file.exists():
            with open(env_file, 'r') as f:
                for line in f:
                    if line.strip() and not line.startswith('#'):
                        key, value = line.strip().split('=', 1)
                        os.environ[key] = value
        
        # Load environment variables
        env_config = {
            'deriv_token': os.getenv('DERIV_API_TOKEN'),
            'deriv_app_id': os.getenv('DERIV_APP_ID'),
            'backend_url': os.getenv('BACKEND_URL', 'http://localhost:5000'),
            'backend_api_key': os.getenv('BACKEND_API_KEY'),
            'database_url': os.getenv('DATABASE_URL'),
            'log_level': os.getenv('LOG_LEVEL', 'INFO')
        }
        
        # Load account mode settings from environment variables
        lemotick_live_account = os.getenv('LEMOTICK_LIVE_ACCOUNT', '').lower()
        if lemotick_live_account in ('true', '1', 'yes'):
            # Override account mode settings when environment variable is present
            if 'account_mode' not in self.config:
                self.config['account_mode'] = {}
            self.config['account_mode']['use_live_account'] = True
            
            # Also update the development settings for backward compatibility
            if 'development' not in self.config:
                self.config['development'] = {}
            self.config['development']['demo_account'] = False
            
            print(f"IMPORTANT: Live account enabled via environment variable LEMOTICK_LIVE_ACCOUNT={lemotick_live_account}")
        
        # Filter out None values
        self.config.update({k: v for k, v in env_config.items() if v is not None})
    
    def _validate_config(self):
        """Validate required configuration"""
        required_keys = ['deriv_token', 'deriv_app_id']
        missing_keys = [key for key in required_keys if not self.config.get(key)]
        
        if missing_keys:
            raise Exception(f"Missing required configuration: {missing_keys}")
    
    def get(self, key: str, default: Any = None) -> Any:
        """Get configuration value"""
        return self.config.get(key, default)
    
    def update(self, key: str, value: Any):
        """Update configuration value"""
        self.config[key] = value


