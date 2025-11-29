import { QUERY_KEYS } from '@/config/constants'
import { useAuthStore } from '@features/auth/stores/authStore'
import { notificationService } from '@features/notifications/services/notificationService'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell, Mail, MessageSquare, Save } from 'lucide-react'
import { useState } from 'react'

export default function PreferencesPage() {
    const { user } = useAuthStore()
    const queryClient = useQueryClient()

    // Fetch preferences
    const { data: preferences, isLoading, error } = useQuery({
        queryKey: [...QUERY_KEYS.PREFERENCES, user?.id],
        queryFn: () => notificationService.getPreferences(user!.id),
        enabled: !!user?.id,
    })

    // Local state for form
    const [localPrefs, setLocalPrefs] = useState(preferences)

    // Update when preferences load
    useState(() => {
        if (preferences) {
            setLocalPrefs(preferences)
        }
    })

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (data: typeof preferences) => notificationService.updatePreferences(user!.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.PREFERENCES, user?.id] })
            // TODO: Show success toast
        },
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (localPrefs) {
            updateMutation.mutate(localPrefs)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading preferences...</p>
                </div>
            </div>
        )
    }

    if (error || !preferences) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-red-600">Error loading preferences</p>
                    <p className="text-sm text-gray-500 mt-2">Please try refreshing the page</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Notification Preferences</h1>
                <p className="text-gray-600">Manage how and when you receive notifications</p>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Email Notifications */}
                <div className="card mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="rounded-full bg-blue-100 p-3">
                                <Mail className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Email Notifications</h3>
                                <p className="text-sm text-gray-600">Receive notifications via email</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={localPrefs?.emailNotifications}
                                onChange={(e) => setLocalPrefs(prev => prev ? { ...prev, emailNotifications: e.target.checked } : prev)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                    </div>

                    <div className="space-y-3 pl-16">
                        <label className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Deposit notifications</span>
                            <input
                                type="checkbox"
                                className="toggle"
                                checked={localPrefs?.emailOnDeposit}
                                onChange={(e) => setLocalPrefs(prev => prev ? { ...prev, emailOnDeposit: e.target.checked } : prev)}
                                disabled={!localPrefs?.emailNotifications}
                            />
                        </label>
                        <label className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Withdrawal notifications</span>
                            <input
                                type="checkbox"
                                className="toggle"
                                checked={localPrefs?.emailOnWithdrawal}
                                onChange={(e) => setLocalPrefs(prev => prev ? { ...prev, emailOnWithdrawal: e.target.checked } : prev)}
                                disabled={!localPrefs?.emailNotifications}
                            />
                        </label>
                        <label className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Trade notifications</span>
                            <input
                                type="checkbox"
                                className="toggle"
                                checked={localPrefs?.emailOnTrade}
                                onChange={(e) => setLocalPrefs(prev => prev ? { ...prev, emailOnTrade: e.target.checked } : prev)}
                                disabled={!localPrefs?.emailNotifications}
                            />
                        </label>
                        <label className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Profit notifications</span>
                            <input
                                type="checkbox"
                                className="toggle"
                                checked={localPrefs?.emailOnProfit}
                                onChange={(e) => setLocalPrefs(prev => prev ? { ...prev, emailOnProfit: e.target.checked } : prev)}
                                disabled={!localPrefs?.emailNotifications}
                            />
                        </label>
                        <label className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Loss notifications</span>
                            <input
                                type="checkbox"
                                className="toggle"
                                checked={localPrefs?.emailOnLoss}
                                onChange={(e) => setLocalPrefs(prev => prev ? { ...prev, emailOnLoss: e.target.checked } : prev)}
                                disabled={!localPrefs?.emailNotifications}
                            />
                        </label>
                    </div>
                </div>

                {/* SMS Notifications */}
                <div className="card mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="rounded-full bg-green-100 p-3">
                                <MessageSquare className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">SMS Notifications</h3>
                                <p className="text-sm text-gray-600">Receive notifications via SMS</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={localPrefs?.smsNotifications}
                                onChange={(e) => setLocalPrefs(prev => prev ? { ...prev, smsNotifications: e.target.checked } : prev)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                    </div>

                    <div className="space-y-3 pl-16">
                        <label className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Deposit notifications</span>
                            <input
                                type="checkbox"
                                className="toggle"
                                checked={localPrefs?.smsOnDeposit}
                                onChange={(e) => setLocalPrefs(prev => prev ? { ...prev, smsOnDeposit: e.target.checked } : prev)}
                                disabled={!localPrefs?.smsNotifications}
                            />
                        </label>
                        <label className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Withdrawal notifications</span>
                            <input
                                type="checkbox"
                                className="toggle"
                                checked={localPrefs?.smsOnWithdrawal}
                                onChange={(e) => setLocalPrefs(prev => prev ? { ...prev, smsOnWithdrawal: e.target.checked } : prev)}
                                disabled={!localPrefs?.smsNotifications}
                            />
                        </label>
                        <label className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Trade notifications</span>
                            <input
                                type="checkbox"
                                className="toggle"
                                checked={localPrefs?.smsOnTrade}
                                onChange={(e) => setLocalPrefs(prev => prev ? { ...prev, smsOnTrade: e.target.checked } : prev)}
                                disabled={!localPrefs?.smsNotifications}
                            />
                        </label>
                    </div>
                </div>

                {/* Push Notifications */}
                <div className="card mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="rounded-full bg-purple-100 p-3">
                                <Bell className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Push Notifications</h3>
                                <p className="text-sm text-gray-600">Receive in-app notifications</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={localPrefs?.pushNotifications}
                                onChange={(e) => setLocalPrefs(prev => prev ? { ...prev, pushNotifications: e.target.checked } : prev)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                    </div>

                    <div className="space-y-3 pl-16">
                        <label className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Deposit notifications</span>
                            <input
                                type="checkbox"
                                className="toggle"
                                checked={localPrefs?.pushOnDeposit}
                                onChange={(e) => setLocalPrefs(prev => prev ? { ...prev, pushOnDeposit: e.target.checked } : prev)}
                                disabled={!localPrefs?.pushNotifications}
                            />
                        </label>
                        <label className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Withdrawal notifications</span>
                            <input
                                type="checkbox"
                                className="toggle"
                                checked={localPrefs?.pushOnWithdrawal}
                                onChange={(e) => setLocalPrefs(prev => prev ? { ...prev, pushOnWithdrawal: e.target.checked } : prev)}
                                disabled={!localPrefs?.pushNotifications}
                            />
                        </label>
                        <label className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Trade notifications</span>
                            <input
                                type="checkbox"
                                className="toggle"
                                checked={localPrefs?.pushOnTrade}
                                onChange={(e) => setLocalPrefs(prev => prev ? { ...prev, pushOnTrade: e.target.checked } : prev)}
                                disabled={!localPrefs?.pushNotifications}
                            />
                        </label>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="btn-primary flex items-center space-x-2"
                        disabled={updateMutation.isPending}
                    >
                        <Save className="h-4 w-4" />
                        <span>{updateMutation.isPending ? 'Saving...' : 'Save Preferences'}</span>
                    </button>
                </div>
            </form>
        </div>
    )
}

