// ==================== USER & AUTH ====================

export interface User {
    id: string
    email: string
    firstName: string
    lastName: string
    role: UserRole
    status: InvestorStatus
    twoFactorEnabled: boolean
    createdAt: string
    lastLoginAt?: string
}

export enum UserRole {
    Investor = 0,
    Administrator = 1,
    ComplianceOfficer = 2,
    Support = 3,
    Auditor = 4,
}

export enum InvestorStatus {
    Pending = 0,
    Active = 1,
    Suspended = 2,
    Closed = 3,
    KYCRequired = 4,
    KYCPending = 5,
    KYCApproved = 6,
    KYCDenied = 7,
}

export interface LoginCredentials {
    email: string
    password: string
}

export interface RegisterData {
    firstName: string
    lastName: string
    email: string
    password: string
    confirmPassword: string
    phoneNumber?: string
    dateOfBirth: string
    nationality: string
    idNumber: string
    referralCode?: string
}

export interface AuthResponse {
    token: string
    refreshToken?: string
    user: User
    expiresIn: number
}

// ==================== PORTFOLIO ====================

export interface Portfolio {
    id: string
    investorId: string
    name: string
    description?: string
    initialInvestment: number
    currentValue: number
    totalProfit: number
    totalLoss: number
    netProfit: number
    profitPercentage: number
    status: PortfolioStatus
    riskLevel: RiskLevel
    createdAt: string
    updatedAt?: string
}

export enum PortfolioStatus {
    Active = 0,
    Suspended = 1,
    Closed = 2,
    UnderReview = 3,
}

export enum RiskLevel {
    Low = 0,
    Medium = 1,
    High = 2,
    VeryHigh = 3,
}

// ==================== TRADES ====================

export interface Trade {
    id: string
    portfolioId: string
    symbol: string
    type: TradeType
    direction: TradeDirection
    amount: number
    entryPrice: number
    exitPrice?: number
    stake: number
    profit?: number
    loss?: number
    status: TradeStatus
    entryTime: string
    exitTime?: string
    strategy?: string
    notes?: string
}

export enum TradeType {
    BinaryOption = 0,
    CFD = 1,
    Forex = 2,
    Crypto = 3,
    Stock = 4,
}

export enum TradeDirection {
    Buy = 0,
    Sell = 1,
    Rise = 2,
    Fall = 3,
}

export enum TradeStatus {
    Open = 0,
    Closed = 1,
    Cancelled = 2,
    Expired = 3,
    Failed = 4,
}

// ==================== TRANSACTIONS ====================

export interface Transaction {
    id: string
    investorId: string
    portfolioId?: string
    type: TransactionType
    amount: number
    balance: number
    currency: string
    status: TransactionStatus
    description?: string
    reference?: string
    createdAt: string
    processedAt?: string
}

export enum TransactionType {
    Deposit = 0,
    Withdrawal = 1,
    ProfitDistribution = 2,
    Loss = 3,
    Fee = 4,
    Refund = 5,
    Bonus = 6,
    Penalty = 7,
}

export enum TransactionStatus {
    Pending = 0,
    Processing = 1,
    Completed = 2,
    Failed = 3,
    Cancelled = 4,
    Reversed = 5,
}

// ==================== NOTIFICATIONS ====================

export interface Notification {
    id: string
    title: string
    message: string
    type: NotificationType
    priority: NotificationPriority
    isRead: boolean
    createdAt: string
    readAt?: string
    actionUrl?: string
    actionText?: string
}

export enum NotificationType {
    TradeExecuted = 0,
    TradeClosed = 1,
    ProfitDistribution = 2,
    LossAlert = 3,
    RiskAlert = 4,
    SystemUpdate = 5,
    AccountUpdate = 6,
    SecurityAlert = 7,
    Marketing = 8,
    General = 9,
}

export enum NotificationPriority {
    Low = 0,
    Normal = 1,
    High = 2,
    Critical = 3,
}

// ==================== BANK ACCOUNTS ====================

export interface BankAccount {
    id: string
    investorId: string
    accountHolderName: string
    maskedAccountNumber: string
    branchCode: string
    bankName: string
    accountType: BankAccountType
    status: BankAccountStatus
    isPrimary: boolean
    addedAt: string
    verifiedAt?: string
}

export enum BankAccountType {
    Cheque = 0,
    Savings = 1,
    Transmission = 2,
}

export enum BankAccountStatus {
    Pending = 0,
    Verified = 1,
    Rejected = 2,
    Inactive = 3,
}

// ==================== PREFERENCES ====================

export interface InvestorPreferences {
    id: string
    investorId: string
    emailNotifications: boolean
    tradeNotifications: boolean
    riskAlerts: boolean
    monthlyStatements: boolean
    quarterlyReports: boolean
    marketingEmails: boolean
    securityAlerts: boolean
    statementDelivery: StatementDeliveryMethod
    statementDay: number
    currency: string
    language: string
    timezone: string
    dateFormat: string
    riskTolerance: RiskTolerance
    autoRebalancing: boolean
    riskAlertThreshold: number
    automatedTrading: boolean
    maxDailyLossLimit: number
    autoStopLoss: boolean
    createdAt: string
    updatedAt?: string
}

export enum StatementDeliveryMethod {
    Email = 0,
    Portal = 1,
    Both = 2,
}

export enum RiskTolerance {
    Conservative = 0,
    Moderate = 1,
    Medium = 2,
    Aggressive = 3,
    VeryAggressive = 4,
}

// ==================== DASHBOARD ====================

export interface DashboardSummary {
    totalInvestment: number
    currentValue: number
    totalProfit: number
    totalLoss: number
    netProfit: number
    profitPercentage: number
    activePortfolios: number
    openTrades: number
    pendingWithdrawals: number
    unreadNotifications: number
}

export interface PerformanceMetric {
    date: string
    value: number
    profit: number
    loss: number
}

// ==================== API ====================

export interface ApiError {
    message: string
    errors?: Record<string, string[]>
    status?: number
}

export interface PaginatedResponse<T> {
    data: T[]
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
}

export interface ApiResponse<T> {
    data?: T
    message?: string
    success: boolean
}

