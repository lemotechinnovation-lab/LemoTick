import { AlertCircle, CheckCircle, Clock, DollarSign, IdCard, Lock, Mail, Phone } from 'lucide-react';

export function IconTest() {
    return (
        <div className="p-6 bg-[#0F0A2B] rounded-lg">
            <h2 className="text-white text-xl mb-4">Icon Test Component</h2>
            <div className="grid grid-cols-4 gap-4">
                <div className="flex items-center gap-2 text-white">
                    <Mail className="h-5 w-5 text-[#2F6BFF]" />
                    <span>Mail</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                    <Lock className="h-5 w-5 text-[#2F6BFF]" />
                    <span>Lock</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <span>Alert</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                    <Phone className="h-5 w-5 text-[#2F6BFF]" />
                    <span>Phone</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                    <IdCard className="h-5 w-5 text-[#2F6BFF]" />
                    <span>ID Card</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span>Check</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                    <DollarSign className="h-5 w-5 text-[#FFA62B]" />
                    <span>Dollar</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                    <Clock className="h-5 w-5 text-[#FFA62B]" />
                    <span>Clock</span>
                </div>
            </div>

            <div className="mt-6">
                <h3 className="text-white text-lg mb-2">Input Field Test</h3>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="email"
                        placeholder="test@example.com"
                        className="appearance-none block w-full pl-10 pr-3 py-2 border border-[#2F6BFF]/20 rounded-lg bg-[#16124A]/50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2F6BFF] focus:border-transparent transition-all text-sm hover:border-[#2F6BFF]/40"
                    />
                </div>
            </div>
        </div>
    );
}