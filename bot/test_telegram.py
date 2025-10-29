"""
Quick test script for Telegram notification setup.
Run this to verify your Telegram configuration works.
"""

import os
import sys

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from integrations.telegram_notifier import TelegramNotifier

def main():
    print("=" * 70)
    print("LemoTick Telegram Notification Test")
    print("=" * 70)
    print()
    
    # Check environment variables
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_CHAT_ID")
    
    if not bot_token or not chat_id:
        print("❌ TELEGRAM NOT CONFIGURED")
        print()
        print("Please set environment variables:")
        print()
        print("Option 1: Set in credentials.env file:")
        print("  1. Edit bot/config/credentials.env")
        print("  2. Add these lines:")
        print("     TELEGRAM_BOT_TOKEN=your_token_here")
        print("     TELEGRAM_CHAT_ID=your_chat_id_here")
        print()
        print("Option 2: Set temporarily (Windows PowerShell):")
        print("  $env:TELEGRAM_BOT_TOKEN='your_token_here'")
        print("  $env:TELEGRAM_CHAT_ID='your_chat_id_here'")
        print()
        print("=" * 70)
        print("HOW TO GET YOUR TELEGRAM BOT TOKEN AND CHAT ID:")
        print("=" * 70)
        print()
        print("Step 1: Create a Telegram Bot")
        print("  1. Open Telegram on your phone")
        print("  2. Search for: @BotFather")
        print("  3. Send message: /newbot")
        print("  4. Follow instructions to name your bot")
        print("  5. COPY the token (looks like: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz)")
        print()
        print("Step 2: Get Your Chat ID")
        print("  1. Search for: @userinfobot")
        print("  2. Send message: /start")
        print("  3. COPY your ID (looks like: 123456789)")
        print()
        print("Step 3: Start Conversation with Your Bot")
        print("  1. Search for your bot (the name you created)")
        print("  2. Send message: /start")
        print("  3. Now your bot can send you messages!")
        print()
        return
    
    print("✅ Environment variables found!")
    print(f"   Bot Token: {bot_token[:10]}...{bot_token[-10:]}")
    print(f"   Chat ID: {chat_id}")
    print()
    print("Testing Telegram connection...")
    print()
    
    # Initialize notifier
    notifier = TelegramNotifier()
    
    if not notifier.enabled:
        print("❌ Telegram notifier could not be initialized")
        print("Check the error messages above")
        return
    
    print("✅ Telegram notifier initialized!")
    print()
    print("Sending test messages...")
    print()
    
    # Test 1: Simple message
    success = notifier.send_message("🧪 **Test Message 1**: LemoTick bot is configured correctly!")
    if success:
        print("✅ Test message 1 sent successfully")
    else:
        print("❌ Test message 1 failed")
    
    # Test 2: Trade notification
    notifier.notify_trade_opened(
        signal="BUY",
        stake=3.50,
        duration=5,
        price=828.50,
        strategy="Triple EMA"
    )
    print("✅ Test trade notification sent")
    
    # Test 3: Performance summary
    notifier.notify_performance_summary(
        total_trades=10,
        wins=7,
        losses=3,
        profit=12.50,
        win_rate=70.0,
        equity=62.50
    )
    print("✅ Test performance summary sent")
    
    # Test 4: Alert
    notifier.notify_alert(
        "warning",
        "This is a test alert. Your bot would send critical notifications like this."
    )
    print("✅ Test alert sent")
    
    print()
    print("=" * 70)
    print("✅ ALL TESTS COMPLETED!")
    print("=" * 70)
    print()
    print("Check your Telegram app - you should have received 4 messages:")
    print("  1. Simple test message")
    print("  2. Trade opened notification")
    print("  3. Performance summary")
    print("  4. Alert notification")
    print()
    print("If you received all messages, Telegram is ready to use!")
    print()

if __name__ == "__main__":
    main()

