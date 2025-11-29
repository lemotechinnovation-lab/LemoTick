import { QUERY_KEYS } from '@/config/constants'
import { useAuthStore } from '@features/auth/stores/authStore'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { formatDateTime } from '@utils/format'
import { CheckCircle, FileText, Trash2, Upload, XCircle } from 'lucide-react'
import { kycService } from '../services/kycService'

export default function KYCDocumentsPage() {
    const { user } = useAuthStore()
    const queryClient = useQueryClient()

    // Fetch KYC documents
    const { data: documents, isLoading, error } = useQuery({
        queryKey: [...QUERY_KEYS.KYC_DOCUMENTS, user?.id],
        queryFn: () => kycService.getInvestorKYCDocuments(user!.id),
        enabled: !!user?.id,
    })

    // Fetch verification status
    const { data: verificationStatus } = useQuery({
        queryKey: [...QUERY_KEYS.KYC_DOCUMENTS, 'status', user?.id],
        queryFn: () => kycService.getVerificationStatus(user!.id),
        enabled: !!user?.id,
    })

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (documentId: string) => kycService.deleteKYCDocument(documentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.KYC_DOCUMENTS, user?.id] })
            queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.KYC_DOCUMENTS, 'status', user?.id] })
        },
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Verified':
                return 'bg-green-100 text-green-800'
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'Rejected':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Verified':
                return <CheckCircle className="h-5 w-5 text-green-600" />
            case 'Rejected':
                return <XCircle className="h-5 w-5 text-red-600" />
            default:
                return <FileText className="h-5 w-5 text-yellow-600" />
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading documents...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-red-600">Error loading documents</p>
                    <p className="text-sm text-gray-500 mt-2">Please try refreshing the page</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">KYC Documents</h1>
                <p className="text-gray-600">Upload and manage your identity verification documents</p>
            </div>

            {/* Verification Status */}
            {verificationStatus && (
                <div className={`card mb-6 ${verificationStatus.isVerified ? 'bg-green-50' : 'bg-yellow-50'}`}>
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-bold text-gray-900 flex items-center space-x-2">
                                {verificationStatus.isVerified ? (
                                    <>
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <span>Account Verified</span>
                                    </>
                                ) : (
                                    <>
                                        <FileText className="h-5 w-5 text-yellow-600" />
                                        <span>Verification Pending</span>
                                    </>
                                )}
                            </h3>
                            <div className="mt-2 space-y-1 text-sm">
                                {verificationStatus.verifiedDocuments.length > 0 && (
                                    <p className="text-green-700">
                                        ✓ {verificationStatus.verifiedDocuments.length} document(s) verified
                                    </p>
                                )}
                                {verificationStatus.pendingDocuments.length > 0 && (
                                    <p className="text-yellow-700">
                                        ⏳ {verificationStatus.pendingDocuments.length} document(s) under review
                                    </p>
                                )}
                                {verificationStatus.missingDocuments.length > 0 && (
                                    <p className="text-red-700">
                                        ⚠ Missing: {verificationStatus.missingDocuments.join(', ')}
                                    </p>
                                )}
                            </div>
                        </div>
                        {!verificationStatus.isVerified && (
                            <button className="btn-primary flex items-center space-x-2">
                                <Upload className="h-4 w-4" />
                                <span>Upload Document</span>
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Documents Grid */}
            {documents && documents.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {documents.map((doc) => (
                        <div key={doc.id} className="card relative">
                            <div className="absolute top-4 right-4">
                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(doc.status)}`}>
                                    {doc.status}
                                </span>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="rounded-full bg-primary-100 p-3">
                                    {getStatusIcon(doc.status)}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900">{doc.documentType}</h3>
                                    <p className="text-sm text-gray-600">{doc.fileName}</p>
                                </div>
                            </div>

                            <div className="mt-4 space-y-2">
                                {doc.documentNumber && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Document Number</span>
                                        <span className="font-medium text-gray-900">{doc.documentNumber}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Uploaded</span>
                                    <span className="font-medium text-gray-900">
                                        {formatDateTime(doc.uploadedAt)}
                                    </span>
                                </div>
                                {doc.verifiedAt && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Verified</span>
                                        <span className="font-medium text-gray-900">
                                            {formatDateTime(doc.verifiedAt)}
                                        </span>
                                    </div>
                                )}
                                {doc.expiryDate && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Expires</span>
                                        <span className="font-medium text-gray-900">
                                            {formatDateTime(doc.expiryDate)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">File Size</span>
                                    <span className="font-medium text-gray-900">
                                        {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                                    </span>
                                </div>
                            </div>

                            {doc.notes && (
                                <div className="mt-3 rounded-lg bg-gray-50 p-3">
                                    <p className="text-xs font-medium text-gray-700">Notes:</p>
                                    <p className="text-sm text-gray-600 mt-1">{doc.notes}</p>
                                </div>
                            )}

                            <div className="mt-4 flex space-x-2">
                                <button
                                    className="btn-secondary flex-1"
                                    onClick={() => kycService.downloadKYCDocument(doc.id)}
                                >
                                    Download
                                </button>
                                {doc.status === 'Pending' && (
                                    <button
                                        className="btn-secondary text-red-600 hover:bg-red-50"
                                        onClick={() => {
                                            if (confirm('Are you sure you want to delete this document?')) {
                                                deleteMutation.mutate(doc.id)
                                            }
                                        }}
                                        disabled={deleteMutation.isPending}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card flex flex-col items-center justify-center py-12">
                    <FileText className="h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No documents uploaded</h3>
                    <p className="mt-2 text-center text-sm text-gray-500">
                        Upload your identity documents to verify your account
                    </p>
                    <button className="btn-primary mt-6 flex items-center space-x-2">
                        <Upload className="h-4 w-4" />
                        <span>Upload Your First Document</span>
                    </button>
                </div>
            )}

            {/* Required Documents Info */}
            <div className="card mt-6 bg-blue-50">
                <h3 className="font-bold text-gray-900 mb-3">Required Documents</h3>
                <div className="space-y-2 text-sm text-gray-700">
                    <p>• <strong>ID Document:</strong> National ID, Passport, or Driver's License</p>
                    <p>• <strong>Proof of Address:</strong> Utility bill or bank statement (not older than 3 months)</p>
                    <p>• <strong>Proof of Income:</strong> Payslip or bank statement (optional)</p>
                </div>
                <p className="text-xs text-gray-600 mt-3">
                    All documents will be securely encrypted and reviewed within 24-48 hours.
                </p>
            </div>
        </div>
    )
}

