import { Construction } from 'lucide-react';

interface ComingSoonProps {
    title: string;
    description?: string;
}

function ComingSoon({ title, description }: ComingSoonProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-violet-100 dark:bg-[#2F6BFF]/10 mb-6">
                    <Construction className="w-10 h-10 text-[#2F6BFF]" />
                </div>
                <h1 className="text-3xl md:text-4xl text-gray-800 dark:text-gray-100 font-bold mb-4">
                    {title}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-200 mb-2">
                    {description || 'This feature is currently under development'}
                </p>
                <p className="text-sm text-gray-300 dark:text-gray-300">
                    Check back soon for updates!
                </p>
            </div>
        </div>
    );
}

export default ComingSoon;
