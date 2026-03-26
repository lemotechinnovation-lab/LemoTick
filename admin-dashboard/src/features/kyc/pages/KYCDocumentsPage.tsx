import { CheckCircle, Clock, FileText, Shield, Upload, XCircle } from 'lucide-react';
import { useState } from 'react';

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
            const uploadToast = validationToast.customValidation(
                `Uploading ${file.name}...`,
                {
                    loadingMessage: 'Uploading document...',
                    successMessage: 'Document uploaded successfully!',
                    errorMessage: 'Upload failed',
                    duration: 3000,
                    delay: 2000,
                }
            );

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

                    uploadToast.success(`${file.name} uploaded successfully!`);
                    validationToast.fileUpload.uploadSuccess(file.name);
                } else {
                    uploadToast.error('Upload failed. Please try again.');
                    validationToast.fileUpload.uploadError(file.name);
                }
            } catch (error) {
                validationToast.serverError('Upload failed due to server error');
            }
        };

        input.click();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'text-green-400 bg-green-500/20';
            case 'pending': return 'text-yellow-400 bg-yellow-500/20';
            case 'rejected': return 'text-red-400 bg-red-500/20';
            case 'not_uploaded': return 'text-gray-400 bg-gray-500/20';
            default: return 'text-gray-400 bg-gray-500/20';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircle size={16} className="text-green-400" />;
            case 'pending': return <Clock size={16} className="text-yellow-400" />;
            case 'rejected': return <XCircle size={16} className="text-red-400" />;
            case 'not_uploaded': return <Upload size={16} className="text-gray-400" />;
            default: return <FileText size={16} className="text-gray-400" />;
        }
    };

    const approvedDocs = documents.filter(d => d.status === 'approved').length;
    const pendingDocs = documents.filter(d => d.status === 'pending').length;
    const rejectedDocs = documents.filter(d => d.status === 'rejected').length;
    const notUploadedDocs = documents.filter(d => d.status === 'not_uploaded').length;
    const verificationProgress = Math.round((approvedDocs / documents.length) * 100);

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-4 w-full max-w-9xl mx-auto">
            {/* Page header */}
            <div className="relative mb-4 p-3 rounded-lg bg-gradient-to-br from-[#2F6BFF]/10 via-[#16124A] to-[#FFA62B]/10 border border-[#2F6BFF]/20">
                <div className="sm:flex sm:justify-between sm:items-center">
                    <div className="mb-2 sm:mb-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <div className="p-1.5 bg-[#2F6BFF]/20 rounded-lg">
                                <Shield size={16} className="text-[#2F6BFF]" />
                            </div>
                            <h1 className="text-body-dashboard font-bold text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)]">KYC Documents</h1>
                        </div>
                        <p className="text-micro text-gray-300 ml-8">Upload and manage your verification documents</p>
                    </div>

                    {/* Upload Button */}
                    <button
                        onClick={() => toast.info('Please select a document type below to upload')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#2F6BFF] to-[#2557c9] hover:from-[#2557c9] hover:to-[#2F6BFF] text-white transition-all duration-300 shadow-brand hover-lift text-micro"
                    >
                        <Upload size={14} />
                        <span>Upload Document</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
                {/* Verification Progress */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg p-2 border border-[#2F6BFF]/30 hover:border-[#2F6BFF]/60 transition-all duration-300 hover-lift group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#2F6BFF]/5 rounded-full blur-xl group-hover:bg-[#2F6BFF]/10 transition-all duration-300"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                            <div className="p-0.5 bg-gradient-to-br from-[#2F6BFF]/20 to-[#2F6BFF]/5 rounded group-hover:scale-110 transition-transform duration-300">
                                <Shield size={14} className="text-[#2F6BFF]" />
                            </div>
                            <span className="text-[10px] text-gray-400 font-medium">Progress</span>
                        </div>
                        <div className="text-small-dashboard font-bold text-[#2F6BFF] font-tabular">{verificationProgress}%</div>
                        <div className="text-[10px] text-gray-400">Verification</div>
                    </div>
                </div>

                {/* Approved */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg p-2 border border-green-500/30 hover:border-green-500/60 transition-all duration-300 hover-lift group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/5 rounded-full blur-xl group-hover:bg-green-500/10 transition-all duration-300"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                            <div className="p-0.5 bg-gradient-to-br from-green-500/20 to-green-500/5 rounded group-hover:scale-110 transition-transform duration-300">
                                <CheckCircle size={14} className="text-green-400" />
                            </div>
                            <span className="text-[10px] text-green-400 font-medium">Approved</span>
                        </div>
                        <div className="text-small-dashboard font-bold text-green-400 font-tabular">{approvedDocs}</div>
                        <div className="text-[10px] text-gray-400">Documents</div>
                    </div>
                </div>

                {/* Pending */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg p-2 border border-yellow-500/30 hover:border-yellow-500/60 transition-all duration-300 hover-lift group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/5 rounded-full blur-xl group-hover:bg-yellow-500/10 transition-all duration-300"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                            <div className="p-0.5 bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 rounded group-hover:scale-110 transition-transform duration-300">
                                <Clock size={14} className="text-yellow-400" />
                            </div>
                            <span className="text-[10px] text-yellow-400 font-medium">Pending</span>
                        </div>
                        <div className="text-small-dashboard font-bold text-[#efdede] font-tabular drop-shadow-[0_0_6px_rgba(160,167,181,0.3)]">{pendingDocs}</div>
                        <div className="text-[10px] text-gray-400">Under Review</div>
                    </div>
                </div>

                {/* Rejected */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg p-2 border border-red-500/30 hover:border-red-500/60 transition-all duration-300 hover-lift group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-full blur-xl group-hover:bg-red-500/10 transition-all duration-300"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                            <div className="p-0.5 bg-gradient-to-br from-red-500/20 to-red-500/5 rounded group-hover:scale-110 transition-transform duration-300">
                                <XCircle size={14} className="text-red-400" />
                            </div>
                            <span className="text-[10px] text-red-400 font-medium">Rejected</span>
                        </div>
                        <div className="text-small-dashboard font-bold text-[#efdede] font-tabular drop-shadow-[0_0_6px_rgba(160,167,181,0.3)]">{rejectedDocs}</div>
                        <div className="text-[10px] text-gray-400">Need Reupload</div>
                    </div>
                </div>

                {/* Not Uploaded */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg p-2 border border-gray-500/30 hover:border-gray-500/60 transition-all duration-300 hover-lift group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gray-500/5 rounded-full blur-xl group-hover:bg-gray-500/10 transition-all duration-300"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                            <div className="p-0.5 bg-gradient-to-br from-gray-500/20 to-gray-500/5 rounded group-hover:scale-110 transition-transform duration-300">
                                <Upload size={14} className="text-gray-400" />
                            </div>
                            <span className="text-[10px] text-gray-400 font-medium">Missing</span>
                        </div>
                        <div className="text-small-dashboard font-bold text-[#efdede] font-tabular drop-shadow-[0_0_6px_rgba(160,167,181,0.3)]">{notUploadedDocs}</div>
                        <div className="text-[10px] text-gray-400">Not Uploaded</div>
                    </div>
                </div>
            </div>

            {/* Documents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                {documents.map((doc) => (
                    <div
                        key={doc.id}
                        className="bg-gradient-to-br from-[#0B0633] to-[#16124A] rounded-lg border border-[#2F6BFF]/30 shadow-xl overflow-hidden hover:border-[#2F6BFF]/60 transition-all duration-300 hover-lift flex flex-col"
                    >
                        {/* Header with Status Badge */}
                        <div className="p-3 border-b border-[#2F6BFF]/20 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-[#2F6BFF]/20 rounded">
                                    {getStatusIcon(doc.status)}
                                </div>
                                <h3 className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{doc.name}</h3>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-semibold uppercase ${getStatusColor(doc.status)}`}>
                                {doc.status.replace('_', ' ')}
                            </span>
                        </div>

                        {/* Content */}
                        <div className="p-3 flex-1 flex flex-col">
                            {/* File Info */}
                            {doc.fileName && (
                                <div className="mb-2">
                                    <div className="text-[10px] text-gray-400 mb-0.5">File Name</div>
                                    <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{doc.fileName}</div>
                                </div>
                            )}

                            {/* Rejection Reason */}
                            {doc.rejectionReason && (
                                <div className="mb-2 p-2 bg-red-500/10 border border-red-500/30 rounded">
                                    <div className="text-[10px] text-red-400 font-semibold mb-0.5">Rejection Reason</div>
                                    <div className="text-[10px] text-red-300">{doc.rejectionReason}</div>
                                </div>
                            )}

                            {/* Dates */}
                            {doc.uploadedDate && doc.status !== 'not_uploaded' && (
                                <div className="mb-2 space-y-1">
                                    <div className="flex items-center justify-between text-[10px]">
                                        <span className="text-gray-400">Uploaded:</span>
                                        <span className="text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{doc.uploadedDate}</span>
                                    </div>
                                    {doc.reviewedDate && (
                                        <div className="flex items-center justify-between text-[10px]">
                                            <span className="text-gray-400">Reviewed:</span>
                                            <span className="text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{doc.reviewedDate}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Spacer to push button to bottom */}
                            <div className="flex-1"></div>

                            {/* Action Button */}
                            <div className="mt-2">
                                {doc.status === 'not_uploaded' || doc.status === 'rejected' ? (
                                    <button
                                        onClick={() => handleUpload(doc.id)}
                                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-[#2F6BFF] to-[#2557c9] hover:from-[#2557c9] hover:to-[#2F6BFF] text-white text-micro font-semibold transition-all duration-300 shadow-brand hover-lift"
                                    >
                                        <Upload size={14} />
                                        <span>{doc.status === 'rejected' ? 'Reupload Document' : 'Upload Document'}</span>
                                    </button>
                                ) : doc.status === 'approved' ? (
                                    <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-micro font-semibold">
                                        <CheckCircle size={14} />
                                        <span>Verified</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-micro font-semibold">
                                        <Clock size={14} />
                                        <span>Under Review</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Info Box */}
            <div className="mt-3 p-3 bg-[#2F6BFF]/10 border border-[#2F6BFF]/30 rounded-lg">
                <div className="flex items-start gap-2">
                    <Shield size={14} className="text-[#2F6BFF] mt-0.5 flex-shrink-0" />
                    <div>
                        <h3 className="text-micro text-[#efdede] font-semibold mb-1">Document Requirements</h3>
                        <ul className="text-[10px] text-gray-300 space-y-0.5 list-disc list-inside">
                            <li>All documents must be clear and readable</li>
                            <li>Identity documents must be valid and not expired</li>
                            <li>Proof of address must be dated within the last 3 months</li>
                            <li>Selfie must clearly show your face</li>
                            <li>Supported formats: PDF, JPG, PNG (max 5MB)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
