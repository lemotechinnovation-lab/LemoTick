import { api } from '@/services/api'

export interface KYCDocument {
    id: string
    investorId: string
    documentType: string
    documentNumber: string
    fileName: string
    filePath: string
    fileSize: number
    mimeType: string
    status: string
    uploadedAt: string
    verifiedAt: string | null
    verifiedBy: string | null
    expiryDate: string | null
    notes: string | null
}

export interface UploadKYCDocumentRequest {
    investorId: string
    documentType: 'ID' | 'Passport' | 'ProofOfAddress' | 'ProofOfIncome' | 'BankStatement' | 'Other'
    documentNumber?: string
    expiryDate?: string
    file: File
}

export interface UpdateKYCDocumentRequest {
    documentNumber?: string
    status?: 'Pending' | 'Verified' | 'Rejected'
    expiryDate?: string
    notes?: string
}

export const kycService = {
    /**
     * Get all KYC documents for an investor
     */
    getInvestorKYCDocuments: async (investorId: string): Promise<KYCDocument[]> => {
        return api.get(`/api/KYCDocuments/investor/${investorId}`)
    },

    /**
     * Get KYC document by ID
     */
    getKYCDocument: async (documentId: string): Promise<KYCDocument> => {
        return api.get(`/api/KYCDocuments/${documentId}`)
    },

    /**
     * Upload new KYC document
     */
    uploadKYCDocument: async (data: UploadKYCDocumentRequest): Promise<KYCDocument> => {
        const formData = new FormData()
        formData.append('investorId', data.investorId)
        formData.append('documentType', data.documentType)
        if (data.documentNumber) formData.append('documentNumber', data.documentNumber)
        if (data.expiryDate) formData.append('expiryDate', data.expiryDate)
        formData.append('file', data.file)

        return api.post('/api/KYCDocuments', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
    },

    /**
     * Update KYC document
     */
    updateKYCDocument: async (
        documentId: string,
        data: UpdateKYCDocumentRequest
    ): Promise<KYCDocument> => {
        return api.put(`/api/KYCDocuments/${documentId}`, data)
    },

    /**
     * Delete KYC document
     */
    deleteKYCDocument: async (documentId: string): Promise<void> => {
        return api.delete(`/api/KYCDocuments/${documentId}`)
    },

    /**
     * Download KYC document
     */
    downloadKYCDocument: async (documentId: string): Promise<void> => {
        const document = await api.get<KYCDocument>(`/api/KYCDocuments/${documentId}`)
        await api.downloadFile(`/api/KYCDocuments/${documentId}/download`, document.fileName)
    },

    /**
     * Get KYC verification status
     */
    getVerificationStatus: async (investorId: string): Promise<{
        isVerified: boolean
        missingDocuments: string[]
        pendingDocuments: string[]
        verifiedDocuments: string[]
    }> => {
        return api.get(`/api/KYCDocuments/investor/${investorId}/verification-status`)
    },
}

