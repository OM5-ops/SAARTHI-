import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ActivityEntry {
    id: Id;
    kind: string;
    message: string;
    timestamp: Timestamp;
}
export interface BusinessProfile {
    id: Id;
    pan: string;
    ownerName: string;
    monthlyCapacity: string;
    updatedAt: Timestamp;
    gstin: string;
    address: string;
    contactEmail: string;
    companyName: string;
    category: string;
    products: Array<string>;
    udyamNumber: string;
    contactPhone: string;
}
export interface BuyerDelayReport {
    oldestDueDate: DateText;
    invoiceCount: bigint;
    totalOutstanding: Money;
    averageDelayDays: bigint;
    buyer: string;
}
export interface BuyerRisk {
    overdueInvoices: bigint;
    averageDelayDays: bigint;
    notes: string;
    buyer: string;
    riskScore: Percentage;
}
export interface Cell {
    value: Value;
    name: string;
}
export interface ChecklistItem {
    id: Id;
    text: string;
    completed: boolean;
    category: string;
}
export interface ComplianceSummary {
    pendingChecklistItems: bigint;
    generatedAt: Timestamp;
    totalTenders: bigint;
    buyerRisks: Array<BuyerRisk>;
    overdueInvoiceCount: bigint;
    msmeEligibleTenders: bigint;
    msmeQuotaPercent: Percentage;
}
export interface DashboardMetrics {
    totalOrders: bigint;
    overdueInvoices: bigint;
    upcomingDeadlines: bigint;
    generatedAt: Timestamp;
    activeTenders: bigint;
    outstandingPayments: Money;
    pendingDeliveries: bigint;
}
export type DateText = string;
export interface Document {
    id: Id;
    linkedInvoiceId?: Id;
    name: string;
    mimeType: string;
    notes: string;
    category: DocumentCategory;
    sizeBytes: bigint;
    uploadedAt: Timestamp;
    linkedOrderId?: Id;
}
export interface DocumentInput {
    linkedInvoiceId?: Id;
    name: string;
    mimeType: string;
    notes: string;
    category: DocumentCategory;
    sizeBytes: bigint;
    linkedOrderId?: Id;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface EscalationStep {
    id: Id;
    text: string;
    completed: boolean;
    dueDate: DateText;
    description: string;
}
export interface EvidenceChecklist {
    requiredItems: Array<string>;
    complete: boolean;
    documentId: Id;
    presentItems: Array<string>;
}
export type Id = bigint;
export interface InterestEstimate {
    daysOverdue: bigint;
    principal: Money;
    invoiceId: Id;
    assumptions: string;
    estimatedInterest: Money;
    asOfDate: DateText;
    annualRatePercent: Percentage;
}
export interface Invoice {
    id: Id;
    status: InvoiceStatus;
    paymentTermsDays: bigint;
    balance: Money;
    acceptanceDate?: DateText;
    dueDate: DateText;
    amountPaid: Money;
    msmedDueDate?: DateText;
    invoiceDate: DateText;
    invoiceNumber: string;
    buyer: string;
    msmedApplicable: boolean;
    reminderSentAt?: Timestamp;
    amount: Money;
    linkedOrderId?: Id;
}
export interface InvoiceInput {
    paymentTermsDays: bigint;
    acceptanceDate?: DateText;
    dueDate: DateText;
    invoiceDate: DateText;
    invoiceNumber: string;
    buyer: string;
    msmedApplicable: boolean;
    amount: Money;
    linkedOrderId?: Id;
}
export type Money = bigint;
export interface MonthlyFinancial {
    month: string;
    outstanding: Money;
    invoiced: Money;
    received: Money;
}
export interface OrderInput {
    status: OrderStatus;
    deliveryDeadline: DateText;
    value: Money;
    unit: string;
    description: string;
    orderDate: DateText;
    quantity: bigint;
    buyer: string;
    orderNumber: string;
}
export interface Payment {
    id: Id;
    method: string;
    reference: string;
    invoiceId: Id;
    paidDate: DateText;
    amount: Money;
}
export interface PaymentInput {
    method: string;
    reference: string;
    invoiceId: Id;
    paidDate: DateText;
    amount: Money;
}
export type Percentage = bigint;
export interface PurchaseOrder {
    id: Id;
    status: OrderStatus;
    deliveryDeadline: DateText;
    disputeReason?: string;
    documentIds: Array<Id>;
    dispatchedDate?: DateText;
    value: Money;
    unit: string;
    linkedInvoiceIds: Array<Id>;
    acceptedDate?: DateText;
    description: string;
    orderDate: DateText;
    quantity: bigint;
    buyer: string;
    orderNumber: string;
    deliveredDate?: DateText;
    proofOfDelivery?: string;
}
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export interface StaffRole {
    id: Id;
    name: string;
    role: string;
    email: string;
}
export interface Tender {
    id: Id;
    status: TenderStatus;
    applicationStage: string;
    title: string;
    referenceNumber: string;
    publishedDate: DateText;
    saved: boolean;
    eligibility: string;
    msmeEligible: boolean;
    submissionDeadline: DateText;
    estimatedValue: Money;
    buyer: string;
    emdAmount: Money;
}
export type Timestamp = bigint;
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export interface WorkingCapitalEstimate {
    unpaidInvoiceTotal: Money;
    generatedAt: Timestamp;
    estimatedGap: Money;
    assumptions: string;
    enteredExpenses: Money;
}
export enum DocumentCategory {
    other = "other",
    deliveryChallan = "deliveryChallan",
    invoice = "invoice",
    acceptanceRecord = "acceptanceRecord",
    purchaseOrder = "purchaseOrder",
    correspondence = "correspondence"
}
export enum InvoiceStatus {
    paid = "paid",
    issued = "issued",
    overdue = "overdue",
    partiallyPaid = "partiallyPaid",
    draft = "draft"
}
export enum OrderStatus {
    disputed = "disputed",
    placed = "placed",
    dispatched = "dispatched",
    delivered = "delivered",
    accepted = "accepted"
}
export enum TenderStatus {
    closed = "closed",
    open = "open",
    awarded = "awarded",
    closingSoon = "closingSoon"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createDocument(input: DocumentInput): Promise<bigint>;
    createInvoice(input: InvoiceInput): Promise<bigint>;
    createOrder(input: OrderInput): Promise<bigint>;
    deleteDocument(id: bigint): Promise<boolean>;
    deleteInvoice(id: bigint): Promise<boolean>;
    deleteOrder(id: bigint): Promise<boolean>;
    estimateInterest(id: bigint, annualRatePercent: bigint, asOfDate: string): Promise<InterestEstimate | null>;
    execute(qJson: string): Promise<Result>;
    getApiDoc(): Promise<string>;
    getBusinessProfile(): Promise<BusinessProfile | null>;
    getBuyerDelayReport(): Promise<Array<BuyerDelayReport>>;
    getCallerUserRole(): Promise<UserRole>;
    getComplianceSummary(): Promise<ComplianceSummary>;
    getDashboardMetrics(): Promise<DashboardMetrics>;
    getDocument(id: bigint): Promise<Document | null>;
    getEvidenceChecklist(documentId: bigint): Promise<EvidenceChecklist | null>;
    getInvoice(id: bigint): Promise<Invoice | null>;
    getMonthlyFinancials(): Promise<Array<MonthlyFinancial>>;
    getOrder(id: bigint): Promise<PurchaseOrder | null>;
    getTender(id: bigint): Promise<Tender | null>;
    getWorkingCapitalEstimate(enteredExpenses: bigint): Promise<WorkingCapitalEstimate>;
    isCallerAdmin(): Promise<boolean>;
    listActivity(): Promise<Array<ActivityEntry>>;
    listBuyerRisks(): Promise<Array<BuyerRisk>>;
    listChecklistItems(): Promise<Array<ChecklistItem>>;
    listDocuments(): Promise<Array<Document>>;
    listEscalationSteps(): Promise<Array<EscalationStep>>;
    listInvoices(): Promise<Array<Invoice>>;
    listOrders(): Promise<Array<PurchaseOrder>>;
    listPayments(invoiceId: bigint): Promise<Array<Payment>>;
    listStaffRoles(): Promise<Array<StaffRole>>;
    listTenders(): Promise<Array<Tender>>;
    recordPayment(input: PaymentInput): Promise<bigint>;
    saveBusinessProfile(profile: BusinessProfile): Promise<void>;
    saveChecklistItems(items: Array<ChecklistItem>): Promise<void>;
    saveStaffRoles(roles: Array<StaffRole>): Promise<void>;
    saveTender(tender: Tender): Promise<void>;
    schema(): Promise<string>;
    seedDemoData(): Promise<boolean>;
    setOrderStatus(id: bigint, status: OrderStatus): Promise<boolean>;
    setTenderSaved(id: bigint, saved: boolean): Promise<boolean>;
    updateInvoice(id: bigint, input: InvoiceInput): Promise<boolean>;
    updateOrder(id: bigint, input: OrderInput): Promise<boolean>;
}
