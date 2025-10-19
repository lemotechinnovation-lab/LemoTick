"""
Unit tests for WebSocket stream handler.
"""

import pytest
import json
from unittest.mock import Mock, patch
from src.stream_handler import StreamHandler


class TestStreamHandler:
    """Test StreamHandler implementation."""
    
    def test_stream_handler_initialization(self):
        """Test stream handler initialization."""
        callback = Mock()
        handler = StreamHandler(callback)
        
        assert handler.on_tick_callback == callback
        assert not handler.is_connected
        assert not handler.is_running
        assert handler.reconnect_attempts == 0
    
    @patch('src.stream_handler.create_connection')
    def test_connect_success(self, mock_create_connection):
        """Test successful connection."""
        callback = Mock()
        handler = StreamHandler(callback)
        
        # Mock WebSocket connection
        mock_ws = Mock()
        mock_ws.recv.side_effect = [
            json.dumps({"authorize": {"client_id": "test123"}}),
            json.dumps({"ticks": "R_100"})
        ]
        mock_create_connection.return_value = mock_ws
        
        result = handler.connect()
        
        assert result is True
        assert handler.is_connected is True
        assert handler.reconnect_attempts == 0
    
    @patch('src.stream_handler.create_connection')
    def test_connect_auth_failure(self, mock_create_connection):
        """Test connection with authentication failure."""
        callback = Mock()
        handler = StreamHandler(callback)
        
        # Mock WebSocket connection with auth error
        mock_ws = Mock()
        mock_ws.recv.return_value = json.dumps({"error": {"code": "InvalidToken"}})
        mock_create_connection.return_value = mock_ws
        
        result = handler.connect()
        
        assert result is False
        assert not handler.is_connected
    
    def test_disconnect(self):
        """Test disconnection."""
        callback = Mock()
        handler = StreamHandler(callback)
        
        # Mock WebSocket
        handler.ws = Mock()
        handler.is_connected = True
        
        handler.disconnect()
        
        handler.ws.close.assert_called_once()
        assert not handler.is_connected
    
    def test_send_message_connected(self):
        """Test sending message when connected."""
        callback = Mock()
        handler = StreamHandler(callback)
        
        # Mock connected WebSocket
        handler.ws = Mock()
        handler.is_connected = True
        
        message = {"test": "message"}
        result = handler.send_message(message)
        
        assert result is True
        handler.ws.send.assert_called_once_with(json.dumps(message))
    
    def test_send_message_not_connected(self):
        """Test sending message when not connected."""
        callback = Mock()
        handler = StreamHandler(callback)
        
        handler.is_connected = False
        
        message = {"test": "message"}
        result = handler.send_message(message)
        
        assert result is False


if __name__ == "__main__":
    pytest.main([__file__])
