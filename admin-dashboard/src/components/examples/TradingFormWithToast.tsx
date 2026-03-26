import React, { useState } from 'react';
import { validateWithToast, validationToast } from '../../lib/validation-toast';

interface TradingFormProps {
    onSubmit?: (data: any) => void;
}

export function TradingFormWithToast({ onSubmit }: TradingFormProps) {
    const [formData, setFormData] = useState({
        symbol: '',
        amount: '',
        tradeType: 'buy',
        stopLoss: '',
        takeProfit: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = (): boolean => {
        // Required field validations
        if (!validateWithToast.required(formData.symbol, 'Trading Symbol')) return false;
        if (!validateWithToast.required(formData.amount, 'Amount')) return false;

        // Amount validation
        if (!validateWithToast.amount(formData.amount, 10, 10000)) return false;

        // Custom validations with toast feedback
        if (formData.stopLoss && parseFloat(formData.stopLoss) >= parseFloat(formData.amount)) {
            validationToast.formError('Stop loss must be less than trade amount', 'Stop Loss');
            return false;
        }

        if (formData.takeProfit && parseFloat(formData.takeProfit) <= parseFloat(formData.amount)) {
            validationToast.formError('Take profit must be greater than trade amount', 'Take Profit');
            return false;
        }

        return true;
    };

    const simulateTradeExecution = async (): Promise<boolean> => {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simulate random success/failure
        return Math.random() > 0.3; // 70% success rate
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        // Check market status (simulated)
        const isMarketOpen = new Date().getHours() >= 9 && new Date().getHours() <= 17;
        if (!isMarketOpen) {
            validationToast.trading.marketClosed();
            return;
        }

        // Simulate balance check
        const userBalance = 5000; // Simulated user balance
        const tradeAmount = parseFloat(formData.amount);

        if (tradeAmount > userBalance) {
            validationToast.trading.insufficientBalance();
            return;
        }

        // Show loading toast
        const tradeToast = validationToast.customValidation(
            `Executing ${formData.tradeType.toUpperCase()} order for ${formData.symbol}`,
            {
                loadingMessage: 'Processing trade...',
                successMessage: 'Trade executed successfully!',
                errorMessage: 'Trade execution failed',
                duration: 4000,
                delay: 2000,
            }
        );

        setIsLoading(true);

        try {
            const success = await simulateTradeExecution();

            if (success) {
                tradeToast.success(`${formData.tradeType.toUpperCase()} order for ${formData.symbol} executed successfully!`);

                // Reset form after successful trade
                setTimeout(() => {
                    setFormData({
                        symbol: '',
                        amount: '',
                        tradeType: 'buy',
                        stopLoss: '',
                        takeProfit: '',
                    });
                }, 1000);

                onSubmit?.(formData);
            } else {
                tradeToast.error('Trade execution failed. Please try again.');
            }
        } catch (error) {
            validationToast.serverError('Failed to connect to trading server');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-center">Trading Form with Toast Validation</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="symbol" className="block text-sm font-medium mb-1">
                        Trading Symbol *
                    </label>
                    <input
                        type="text"
                        id="symbol"
                        name="symbol"
                        value={formData.symbol}
                        onChange={handleInputChange}
                        placeholder="e.g., EURUSD, BTCUSD"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>

                <div>
                    <label htmlFor="tradeType" className="block text-sm font-medium mb-1">
                        Trade Type
                    </label>
                    <select
                        id="tradeType"
                        name="tradeType"
                        value={formData.tradeType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    >
                        <option value="buy">Buy</option>
                        <option value="sell">Sell</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="amount" className="block text-sm font-medium mb-1">
                        Amount * (Min: $10, Max: $10,000)
                    </label>
                    <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        placeholder="Enter amount"
                        min="10"
                        max="10000"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>

                <div>
                    <label htmlFor="stopLoss" className="block text-sm font-medium mb-1">
                        Stop Loss (Optional)
                    </label>
                    <input
                        type="number"
                        id="stopLoss"
                        name="stopLoss"
                        value={formData.stopLoss}
                        onChange={handleInputChange}
                        placeholder="Stop loss amount"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>

                <div>
                    <label htmlFor="takeProfit" className="block text-sm font-medium mb-1">
                        Take Profit (Optional)
                    </label>
                    <input
                        type="number"
                        id="takeProfit"
                        name="takeProfit"
                        value={formData.takeProfit}
                        onChange={handleInputChange}
                        placeholder="Take profit amount"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                >
                    {isLoading ? 'Processing...' : `Execute ${formData.tradeType.toUpperCase()} Order`}
                </button>
            </form>

            <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
                <h3 className="text-sm font-semibold mb-2">Toast Features Demonstrated:</h3>
                <ul className="text-xs space-y-1">
                    <li>✅ Required field validation</li>
                    <li>✅ Amount range validation</li>
                    <li>✅ Custom business logic validation</li>
                    <li>✅ Market status checking</li>
                    <li>✅ Balance validation</li>
                    <li>✅ Loading states with delay</li>
                    <li>✅ Success/error feedback</li>
                    <li>✅ Network error handling</li>
                </ul>
            </div>
        </div>
    );
}