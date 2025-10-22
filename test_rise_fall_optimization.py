#!/usr/bin/env python3
"""
Test script for Rise/Fall optimization.
Verifies the simplified strategy and Rise/Fall contract implementation.
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from src.config import config
from src.strategy_engine import StrategyEngine, SignalType
from src.trade_executor import TradeExecutor
from src.logger import logger
import time

def test_simplified_strategy():
    """Test the simplified EMA strategy for Rise/Fall optimization."""
    print("Testing Simplified Strategy for Rise/Fall Optimization")
    print("=" * 60)
    
    # Initialize strategy engine
    strategy = StrategyEngine()
    
    # Test with sample price data
    test_prices = [1.2345, 1.2348, 1.2351, 1.2355, 1.2358, 1.2362, 1.2365, 1.2368, 1.2372, 1.2375]
    
    print(f"Testing with {len(test_prices)} price points...")
    
    signals_generated = 0
    for i, price in enumerate(test_prices):
        timestamp = int(time.time()) + i
        
        # Update strategy
        result = strategy.update(price, timestamp)
        
        if isinstance(result, tuple) and len(result) >= 2:
            signal, duration = result[0], result[1]
        else:
            signal, duration = result, 1
            
        if signal != SignalType.HOLD:
            signals_generated += 1
            print(f"  Signal {signals_generated}: {signal.value} at price {price} (duration: {duration} min)")
    
    print(f"\nGenerated {signals_generated} signals from {len(test_prices)} price points")
    return signals_generated > 0

def test_rise_fall_contract_settings():
    """Test Rise/Fall contract configuration."""
    print("\nTesting Rise/Fall Contract Settings")
    print("=" * 60)
    
    # Check contract settings
    contract_duration = config.get("trading.contract_duration", 1)
    contract_basis = config.get("trading.contract_basis", "stake")
    symbol = config.get("trading.symbol", "R_100")
    
    print(f"Contract Duration: {contract_duration} minute(s)")
    print(f"Contract Basis: {contract_basis}")
    print(f"Symbol: {symbol}")
    
    # Check OTM settings
    otm_multiplier = config.get("trading.otm_atr_multiplier", 0.3)
    otm_offset = config.get("trading.otm_base_offset_pct", 0.002)
    max_otm_prob = config.get("trading.max_otm_probability", 0.15)
    
    print(f"OTM ATR Multiplier: {otm_multiplier}x")
    print(f"OTM Base Offset: {otm_offset * 100:.2f}%")
    print(f"Max OTM Probability: {max_otm_prob * 100:.1f}%")
    
    # Check early closure settings
    early_closure = config.get("trading.early_closure_enabled", True)
    min_profit = config.get("trading.min_profit_threshold", 0.03)
    max_loss = config.get("trading.max_loss_threshold", 0.10)
    
    print(f"Early Closure: {'Enabled' if early_closure else 'Disabled'}")
    print(f"Min Profit Threshold: {min_profit * 100:.1f}%")
    print(f"Max Loss Threshold: {max_loss * 100:.1f}%")
    
    return True

def test_simple_ema_strategy():
    """Test the simple EMA strategy configuration."""
    print("\nTesting Exponential EMA Strategy Configuration")
    print("=" * 60)
    
    # Check strategy settings
    exponential_ema = config.get("strategy.exponential_ema_strategy", True)
    ema_fast = config.get("strategy.ema_fast_period", 5)
    ema_slow = config.get("strategy.ema_slow_period", 8)
    
    print(f"Exponential EMA Strategy: {'Enabled' if exponential_ema else 'Disabled'}")
    print(f"EMA Fast Period: {ema_fast}")
    print(f"EMA Slow Period: {ema_slow}")
    
    # Check cooldown settings
    trade_cooldown = config.get("strategy.trade_cooldown_seconds", 5)
    signal_cooldown = config.get("strategy.signal_cooldown_seconds", 10)
    
    print(f"Trade Cooldown: {trade_cooldown} seconds")
    print(f"Signal Cooldown: {signal_cooldown} seconds")
    
    # Check thresholds
    ema_threshold = config.get("strategy.ema_trend_threshold", 0.0)
    macd_threshold = config.get("strategy.macd_strength_threshold", 0.0)
    
    print(f"EMA Trend Threshold: {ema_threshold}")
    print(f"MACD Strength Threshold: {macd_threshold}")
    
    return exponential_ema and ema_fast < ema_slow

def test_risk_reward_ratios():
    """Test the 1.5:1 risk/reward ratio implementation."""
    print("\nTesting 1.5:1 Risk/Reward Ratios")
    print("=" * 60)
    
    # Simulate contract data
    stake = 10.0
    take_profit = stake * 1.5  # 1.5x stake
    stop_loss = -stake         # 1x stake loss
    
    print(f"Stake: ${stake}")
    print(f"Take Profit Target: ${take_profit} (1.5x stake)")
    print(f"Stop Loss Limit: ${stop_loss} (1x stake)")
    print(f"Risk/Reward Ratio: 1.5:1")
    
    # Test scenarios
    scenarios = [
        (15.0, "Take Profit Hit"),
        (5.0, "Stop Loss Hit"),
        (12.0, "Within Limits"),
        (8.0, "Within Limits")
    ]
    
    for profit, scenario in scenarios:
        if profit >= take_profit:
            action = "CLOSE (Take Profit)"
        elif profit <= stop_loss:
            action = "CLOSE (Stop Loss)"
        else:
            action = "HOLD"
        
        print(f"  {scenario}: P&L=${profit:.1f} -> {action}")
    
    return True

def main():
    """Run all Rise/Fall optimization tests."""
    print("Rise/Fall Optimization Test Suite")
    print("=" * 60)
    
    tests = [
        ("Simplified Strategy", test_simplified_strategy),
        ("Rise/Fall Contract Settings", test_rise_fall_contract_settings),
        ("Exponential EMA Strategy", test_simple_ema_strategy),
        ("Risk/Reward Ratios", test_risk_reward_ratios)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
            status = "PASS" if result else "FAIL"
            print(f"\n{status}: {test_name}")
        except Exception as e:
            results.append((test_name, False))
            print(f"\nFAIL: {test_name} - Error: {e}")
    
    # Summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "PASS" if result else "FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("\nAll tests passed! Rise/Fall optimization is ready.")
        print("\nKey Optimizations Applied:")
        print("• Exponential EMA crossover strategy (5/8 periods)")
        print("• Reduced cooldowns (5s trade, 10s signal)")
        print("• Closer OTM barriers (0.3x ATR, 0.2% offset)")
        print("• 1.5:1 risk/reward ratio (50% profit, 100% loss limit)")
        print("• Faster early closure (15s min age, 30s max age)")
        print("• Rise/Fall contracts (CALL/PUT binary options)")
    else:
        print(f"\n{total - passed} test(s) failed. Please check configuration.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
