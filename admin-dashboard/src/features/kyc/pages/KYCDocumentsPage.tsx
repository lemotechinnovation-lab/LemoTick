import { PageHeader } from '@/components/ui/PageHeader';
import { validationToast } from '@/lib/validation-toast';
import { AlertCircle, CheckCircle, Clock, FileText, Shield, Upload, XCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export interface KYCDocument {
    id: string;
    type: 'identity' | 'address' | 'selfie' | 'additional';
    name: string;
    status: 'pending' | 'approved' | 'rejected' | 'not_uploaded';
    uploadedDate?: string;
    reviewedDate?: string;
    rejectionReason?: string;
    fileName?: string;
}

export default function KYCDocumentsPage() {
    const [documents, setDocuments] = useState<KYCDocument[]>([
        {
            id: '1',
            type: 'identity',
            name: 'Identity Document',
            status: 'approved',
            uploadedDate: '2024-03-01',
            reviewedDate: '2024-03-02',
            fileName: 'passport.pdf',
        },
        {
            id: '2',
            type: 'address',
            name: 'Proof of Address',
            status: 'pending',
            uploadedDate: '2024-03-05',
            fileName: 'utility_bill.pdf',
        },
        {
            id: '3',
            type: 'selfie',
            name: 'Selfie Verification',
            status: 'rejected',
            uploadedDate: '2024-03-03',
            reviewedDate: '2024-03-04',
            rejectionReason: 'Image quality too low. Please upload a clearer photo.',
            fileName: 'selfie.jpg',
        },
    ]);

    const handleUpload = async (docId: string) => {
        // Create file input element
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.jpg,.jpeg,.png';
        input.multiple = false;

        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            // Validate file type
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
            if (!allowedTypes.includes(file.type)) {
                validationToast.fileUpload.invalidType(['PDF', 'JPG', 'PNG']);
                return;
            }

            // Validate file size (5MB limit)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                validationToast.fileUpload.tooLarge('5MB');
                return;
            }

            // Show upload progress toast
            toast.loading(`Uploading ${file.name}...`);

            try {
                // Simulate upload delay
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Simulate upload success/failure
                const success = Math.random() > 0.1; // 90% success rate

                if (success) {
                    setDocuments(docs => docs.map(doc =>
                        doc.id === docId
                            ? {
                                ...doc,
                                status: 'pending' as const,
                                uploadedDate: new Date().toISOString().split('T')[0],
                                fileName: file.name
                            }
                            : doc
                    ));

                    toast.dismiss();
                    validationToast.fileUpload.uploadSuccess(file.name);
                } else {
                    toast.dismiss();
                    toast.error('Upload failed. Please try again.');
                }
            } catch (error) {
                toast.dismiss();
                validationToast.serverError('Upload failed due to server error');
            }
        };

        input.click();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'text-green-400 bg-green-500/20 border border-green-500/30';
            case 'pending': return 'text-yellow-400 bg-yellow-500/20 border border-yellow-500/30';
            case 'rejected': return 'text-red-400 bg-red-500/20 border border-red-500/30';
            case 'not_uploaded': return 'text-gray-400 bg-gray-500/20 border border-gray-500/30';
            default: return 'text-gray-400 bg-gray-500/20 border border-gray-500/30';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />;
            case 'pending': return <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />;
            case 'rejected': return <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />;
            case 'not_uploaded': return <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />;
            default: return <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />;
        }
    };

    const approvedDocs = documents.filter(d => d.status === 'approved').length;
    const pendingDocs = documents.filter(d => d.status === 'pending').length;
    const rejectedDocs = documents.filter(d => d.status === 'rejected').length;
    const notUploadedDocs = documents.filter(d => d.status === 'not_uploaded').length;
    const verificationProgress = Math.round((approvedDocs / documents.length) * 100);

    return (
        <div className="w-full max-w-full min-w-0 relative from-[#0F0A2B] via-[#0F0A2B] to-[#1A1450]/60 relative">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(47, 107, 255, 0.15) 1px, transparent 0)',
                backgroundSize: '32px 32px'
            }}></div>

            {/* Animated gradient orbs */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-[#2F6BFF]/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FFA62B]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

            {/* Content */}
            <div className="relative pt-32 pb-20 px-4 sm:px-4 sm:px-6 lg:px-6 sm:px-8">
                <div className="w-full max-w-full mx-auto">
                    {/* Page Header */}
                    <PageHeader
                        variant="hero"
                        title="KYC DOCUMENTS"
                        description="Upload and manage your verification documents to unlock full trading capabilities"
                        badge="Identity Verification"
                        badgeIcon="🛡️"
                    />

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6 mb-8 sm:mb-12">
                        {/* Verification Progress */}
                        <div className="p-4 sm:p-6 rounded-2xl bg-[#16124A]/50 border border-[#2F6BFF]/20 hover:border-[#2F6BFF] transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 rounded-xl flex items-center justify-center">
                                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-[#2F6BFF]" />
                                </div>
                                <span className="text-sm text-gray-400">Progress</span>
                            </div>
                            <div className="text-base sm:text-lg sm:text-xl sm:text-2xl sm:text-3xl font-bold text-[#2F6BFF] mb-1">{verificationProgress}%</div>
                            <div className="text-sm text-gray-400">Verification</div>
                        </div>

                        {/* Approved */}
                        <div className="p-4 sm:p-6 rounded-2xl bg-[#16124A]/50 border border-green-500/20 hover:border-green-500 transition-all duration-300">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 sm:w-10 sm:h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-xl flex items-center justify-center">
                                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 sm:w-6 sm:h-6 text-green-400" />
                                </div>
                                <span className="text-sm text-green-400">Approved</span>
                            </div>
                            <div className="text-base sm:text-lg sm:text-xl sm:text-2xl sm:text-3xl font-bold text-white mb-1">{approvedDocs}</div>
                            <div className="text-sm text-gray-400">Documents</div>
                        </div>

                        {/* Pending */}
                        <div className="p-4 sm:p-6 rounded-2xl bg-[#16124A]/50 border border-yellow-500/20 hover:border-yellow-500 transition-all duration-300">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 sm:w-10 sm:h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-500/20 to-yellow-500/10 rounded-xl flex items-center justify-center">
                                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 sm:w-6 sm:h-6 text-yellow-400" />
                                </div>
                                <span className="text-sm text-yellow-400">Pending</span>
                            </div>
                            <div className="text-base sm:text-lg sm:text-xl sm:text-2xl sm:text-3xl font-bold text-white mb-1">{pendingDocs}</div>
                            <div className="text-sm text-gray-400">Under Review</div>
                        </div>

                        {/* Rejected */}
                        <div className="p-4 sm:p-6 rounded-2xl bg-[#16124A]/50 border border-red-500/20 hover:border-red-500 transition-all duration-300">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 sm:w-10 sm:h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500/20 to-red-500/10 rounded-xl flex items-center justify-center">
                                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5 sm:w-6 sm:h-6 text-red-400" />
                                </div>
                                <span className="text-sm text-red-400">Rejected</span>
                            </div>
                            <div className="text-base sm:text-lg sm:text-xl sm:text-2xl sm:text-3xl font-bold text-white mb-1">{rejectedDocs}</div>
                            <div className="text-sm text-gray-400">Need Reupload</div>
                        </div>

                        {/* Not Uploaded */}
                        <div className="p-4 sm:p-6 rounded-2xl bg-[#16124A]/50 border border-gray-500/20 hover:border-gray-500 transition-all duration-300">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 sm:w-10 sm:h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-gray-500/20 to-gray-500/10 rounded-xl flex items-center justify-center">
                                    <Upload className="w-4 h-4 sm:w-5 sm:h-5 sm:w-6 sm:h-6 text-gray-400" />
                                </div>
                                <span className="text-sm text-gray-400">Missing</span>
                            </div>
                            <div className="text-base sm:text-lg sm:text-xl sm:text-2xl sm:text-3xl font-bold text-white mb-1">{notUploadedDocs}</div>
                            <div className="text-sm text-gray-400">Not Uploaded</div>
                        </div>
                    </div>

                    {/* Documents Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 sm:p-6 mb-3 sm:mb-4 sm:mb-6 sm:mb-8 w-full max-w-full sm:mb-12 w-full max-w-full w-full max-w-full">
                        {documents.map((doc) => (
                            <div
                                key={doc.id}
                                className="p-4 sm:p-6 rounded-2xl bg-[#16124A]/50 border border-[#2F6BFF]/20 hover:border-[#2F6BFF] transition-all duration-300 flex flex-col"
                            >
                                {/* Header with Status Badge */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3 sm:mb-4 sm:mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 sm:w-8 sm:h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 rounded-xl flex items-center justify-center">
                                            {getStatusIcon(doc.status)}
                                        </div>
                                        <h3 className="text-base sm:text-lg font-semibold text-white">{doc.name}</h3>
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <div className="mb-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusColor(doc.status)}`}>
                                        {doc.status.replace('_', ' ')}
                                    </span>
                                </div>

                                {/* File Info */}
                                {doc.fileName && (
                                    <div className="mb-4">
                                        <div className="text-sm text-gray-400 mb-1">File Name</div>
                                        <div className="text-white font-medium">{doc.fileName}</div>
                                    </div>
                                )}

                                {/* Rejection Reason */}
                                {doc.rejectionReason && (
                                    <div className="mb-3 sm:mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <div className="text-sm text-red-400 font-semibold mb-1">Rejection Reason</div>
                                                <div className="text-sm text-red-300">{doc.rejectionReason}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Dates */}
                                {doc.uploadedDate && doc.status !== 'not_uploaded' && (
                                    <div className="mb-3 sm:mb-4 space-y-2">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm">
                                            <span className="text-gray-400">Uploaded:</span>
                                            <span className="text-white">{doc.uploadedDate}</span>
                                        </div>
                                        {doc.reviewedDate && (
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm">
                                                <span className="text-gray-400">Reviewed:</span>
                                                <span className="text-white">{doc.reviewedDate}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Spacer to push button to bottom */}
                                <div className="flex-1"></div>

                                {/* Action Button */}
                                <div className="mt-4">
                                    {doc.status === 'not_uploaded' || doc.status === 'rejected' ? (
                                        <button
                                            onClick={() => handleUpload(doc.id)}
                                            className="w-full flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl bg-gradient-to-r from-[#2F6BFF] to-[#FFA62B] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                        >
                                            <Upload className="w-5 h-5" />
                                            <span>{doc.status === 'rejected' ? 'Reupload Document' : 'Upload Document'}</span>
                                        </button>
                                    ) : doc.status === 'approved' ? (
                                        <div className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 font-semibold">
                                            <CheckCircle className="w-5 h-5" />
                                            <span>Verified</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 font-semibold">
                                            <Clock className="w-5 h-5" />
                                            <span>Under Review</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Info Box */}
                    <div className="p-4 sm:p-6 rounded-2xl bg-[#2F6BFF]/10 border border-[#2F6BFF]/30">
                        <div className="flex items-start gap-4">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 sm:w-10 sm:h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Shield className="w-4 h-4 sm:w-5 sm:h-5 sm:w-6 sm:h-6 text-[#2F6BFF]" />
                            </div>
                            <div>
                                <h3 className="text-base sm:text-lg sm:text-xl font-semibold text-white mb-3">Document Requirements</h3>
                                <ul className="text-gray-300 space-y-2">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mt-0.5 flex-shrink-0" />
                                        <span>All documents must be clear and readable</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mt-0.5 flex-shrink-0" />
                                        <span>Identity documents must be valid and not expired</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mt-0.5 flex-shrink-0" />
                                        <span>Proof of address must be dated within the last 3 months</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mt-0.5 flex-shrink-0" />
                                        <span>Selfie must clearly show your face</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mt-0.5 flex-shrink-0" />
                                        <span>Supported formats: PDF, JPG, PNG (max 5MB)</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
