import { QUERY_KEYS } from '@/config/constants'
import { useAuthStore } from '@features/auth/stores/authStore'
import { useQuery } from '@tanstack/react-query'
import { formatDateTime } from '@utils/format'
import { Download, FileText, Plus } from 'lucide-react'
import { statementService } from '../services/statementService'

export default function StatementsPage() {
    const { user } = useAuthStore()

    // Fetch statements
    const { data: statements, isLoading, error } = useQuery({
        queryKey: [...QUERY_KEYS.STATEMENTS, user?.id],
        queryFn: () => statementService.getInvestorStatements(user!.id),
        enabled: !!user?.id,
    })

    const getStatementTypeColor = (type: string) => {
        switch (type) {
            case 'Monthly':
                return 'bg-blue-100 text-blue-800'
            case 'Quarterly':
                return 'bg-purple-100 text-purple-800'
            case 'Annual':
                return 'bg-green-100 text-green-800'
            case 'Custom':
                return 'bg-gray-100 text-gray-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading statements...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-red-600">Error loading statements</p>
                    <p className="text-sm text-gray-500 mt-2">Please try refreshing the page</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Statements</h1>
                    <p className="text-gray-600">View and download your investment statements</p>
                </div>
                <button className="btn-primary flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Generate Statement</span>
                </button>
            </div>

            {statements && statements.length > 0 ? (
                <div className="card overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                                        Statement
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                                        Period
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                                        Generated
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                                        Size
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-600">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {statements.map((statement) => (
                                    <tr key={statement.id} className="hover:bg-gray-50">
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <FileText className="h-5 w-5 text-primary-600" />
                                                <span className="text-sm font-medium text-gray-900">
                                                    {statement.fileName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatementTypeColor(statement.statementType)}`}>
                                                {statement.statementType}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                            {formatDateTime(statement.periodStart)} - {formatDateTime(statement.periodEnd)}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                            {formatDateTime(statement.generatedAt)}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                            {(statement.fileSize / 1024 / 1024).toFixed(2)} MB
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right">
                                            <button
                                                className="btn-secondary flex items-center space-x-2"
                                                onClick={() => statementService.downloadStatement(statement.id)}
                                            >
                                                <Download className="h-4 w-4" />
                                                <span>Download</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="card flex flex-col items-center justify-center py-12">
                    <FileText className="h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No statements yet</h3>
                    <p className="mt-2 text-center text-sm text-gray-500">
                        Generate your first statement to view your investment history
                    </p>
                    <button className="btn-primary mt-6 flex items-center space-x-2">
                        <Plus className="h-4 w-4" />
                        <span>Generate Your First Statement</span>
                    </button>
                </div>
            )}

            {/* Info Card */}
            <div className="card mt-6 bg-blue-50">
                <h3 className="font-bold text-gray-900 mb-3">About Statements</h3>
                <div className="space-y-2 text-sm text-gray-700">
                    <p>• <strong>Monthly Statements:</strong> Generated automatically at the end of each month</p>
                    <p>• <strong>Quarterly Statements:</strong> Comprehensive review of your quarterly performance</p>
                    <p>• <strong>Annual Statements:</strong> Full year summary for tax purposes</p>
                    <p>• <strong>Custom Statements:</strong> Generate statements for any date range</p>
                </div>
                <p className="text-xs text-gray-600 mt-3">
                    All statements are available in PDF format and include transaction history, performance metrics, and tax information.
                </p>
            </div>
        </div>
    )
}

