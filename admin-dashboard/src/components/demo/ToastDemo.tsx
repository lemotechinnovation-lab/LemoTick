import { useToast } from '../../hooks/use-toast';
import { validationToast } from '../../lib/validation-toast';

export function ToastDemo() {
    const { toast, toastWithLoader } = useToast();

    const demoValidations = () => {
        // Test different validation scenarios
        setTimeout(() => validationToast.formError("This field is required", "Email"), 100);
        setTimeout(() => validationToast.invalidEmail(), 600);
        setTimeout(() => validationToast.weakPassword(), 1100);
        setTimeout(() => validationToast.success("Form submitted successfully!"), 1600);
    };

    const demoLoaderToast = () => {
        const loadingToast = toastWithLoader("Processing your request...", {
            loadingMessage: "Please wait...",
            successMessage: "Operation completed!",
            errorMessage: "Something went wrong",
            duration: 3000,
            delay: 2000,
        });

        // Simulate success after 3 seconds
        setTimeout(() => {
            loadingToast.success("Data saved successfully!");
        }, 3000);
    };

    const demoTradingValidations = () => {
        setTimeout(() => validationToast.trading.insufficientBalance(), 100);
        setTimeout(() => validationToast.trading.invalidAmount(10, 1000), 600);
        setTimeout(() => validationToast.trading.marketClosed(), 1100);
        setTimeout(() => validationToast.trading.tradeSuccess("BUY", 500), 1600);
    };

    const demoFileUpload = () => {
        setTimeout(() => validationToast.fileUpload.invalidType(["PDF", "JPG", "PNG"]), 100);
        setTimeout(() => validationToast.fileUpload.tooLarge("5MB"), 600);
        setTimeout(() => validationToast.fileUpload.uploadSuccess("document.pdf"), 1100);
    };

    const demoNetworkErrors = () => {
        setTimeout(() => validationToast.networkError(), 100);
        setTimeout(() => validationToast.serverError("Database connection failed"), 600);
        setTimeout(() => validationToast.unauthorized(), 1100);
        setTimeout(() => validationToast.sessionExpired(), 1600);
    };

    const demoCustomToasts = () => {
        setTimeout(() => toast({
            title: "Custom Info Toast",
            description: "This is a custom information message",
            variant: "info",
            duration: 3000,
        }), 100);

        setTimeout(() => toast({
            title: "Custom Warning",
            description: "This is a warning message with custom styling",
            variant: "warning",
            duration: 4000,
        }), 600);

        setTimeout(() => toast({
            title: "Loading Example",
            description: "This shows a loading state",
            loading: true,
            duration: 2000,
        }), 1100);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-center">Toast Notification System Demo</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-3">Form Validations</h3>
                    <button
                        onClick={demoValidations}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                    >
                        Test Form Validations
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-3">Loader Toast</h3>
                    <button
                        onClick={demoLoaderToast}
                        className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
                    >
                        Test Loader Toast
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-3">Trading Validations</h3>
                    <button
                        onClick={demoTradingValidations}
                        className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded transition-colors"
                    >
                        Test Trading Toasts
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-3">File Upload</h3>
                    <button
                        onClick={demoFileUpload}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition-colors"
                    >
                        Test File Upload Toasts
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-3">Network Errors</h3>
                    <button
                        onClick={demoNetworkErrors}
                        className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
                    >
                        Test Network Errors
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-3">Custom Toasts</h3>
                    <button
                        onClick={demoCustomToasts}
                        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded transition-colors"
                    >
                        Test Custom Toasts
                    </button>
                </div>
            </div>

            <div className="mt-8 bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Usage Examples</h3>
                <div className="space-y-4 text-sm">
                    <div>
                        <h4 className="font-semibold text-green-600">✅ Form Validation:</h4>
                        <code className="block bg-gray-200 dark:bg-gray-700 p-2 rounded mt-1">
                            {`if (!validateWithToast.email(email)) return;`}
                        </code>
                    </div>

                    <div>
                        <h4 className="font-semibold text-blue-600">🔄 Loader Toast:</h4>
                        <code className="block bg-gray-200 dark:bg-gray-700 p-2 rounded mt-1">
                            {`const loadingToast = validationToast.apiValidation('login');
loadingToast.success('Login successful!');`}
                        </code>
                    </div>

                    <div>
                        <h4 className="font-semibold text-purple-600">💰 Trading Validation:</h4>
                        <code className="block bg-gray-200 dark:bg-gray-700 p-2 rounded mt-1">
                            {`validationToast.trading.insufficientBalance();`}
                        </code>
                    </div>

                    <div>
                        <h4 className="font-semibold text-red-600">❌ Error Handling:</h4>
                        <code className="block bg-gray-200 dark:bg-gray-700 p-2 rounded mt-1">
                            {`validationToast.networkError();`}
                        </code>
                    </div>
                </div>
            </div>
        </div>
    );
}