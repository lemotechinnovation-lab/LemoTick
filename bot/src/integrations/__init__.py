"""
Integrations module for LemoTick bot.
Contains integrations with external systems like the backend API.
"""

from .backend_client import BackendClient

__all__ = [
    'BackendClient',
]

