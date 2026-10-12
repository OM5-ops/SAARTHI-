/// Static behavioral documentation for the SARRTHI backend.
/// The document is a compile-time literal — it reads no state — so the mixin
/// takes no parameters and declares only `getApiDoc`.
mixin () {
  public query func getApiDoc() : async Text {
    "# SARRTHI Backend API\n" #
    "\n" #
    "SARRTHI is an MSME management backend for Indian suppliers. It stores a\n" #
    "business profile, staff roles, tenders, purchase orders, invoices and\n" #
    "payments, compliance checklists and buyer-risk notes, documents and\n" #
    "escalation steps, and an activity log. It also computes dashboard metrics,\n" #
    "monthly financials, buyer-delay reports, and a working-capital estimate.\n" #
    "\n" #
    "This is an academic project. It is not an official government portal and\n" #
    "its data is sample data unless a caller writes real records.\n" #
    "\n" #
    "## Authentication and identity\n" #
    "\n" #
    "Every method below is a `shared` function that reads the caller principal\n" #
    "from the message. There is no anonymous read path: a call made without a\n" #
    "signed-in identity is attributed to the anonymous principal and sees only\n" #
    "that principal's (empty) data. The app's frontend pins an Internet Identity\n" #
    "derivation origin, published at `/.well-known/ii-derivation-origin` when\n" #
    "available. An agent already holding the user's Internet Identity\n" #
    "authorization derives the correct per-app principal against that origin\n" #
    "(for example `icp identity link web <name> --app <host>`). Such a delegation\n" #
    "acts with the user's full authority in this app until it expires.\n" #
    "\n" #
    "Data is partitioned by caller principal. Each caller reads and writes only\n" #
    "its own profile, staff, tenders, orders, invoices, payments, checklists,\n" #
    "risks, documents, escalations, and activity. There is no cross-caller read\n" #
    "endpoint and no admin override on the domain methods.\n" #
    "\n" #
    "## Units and encodings\n" #
    "\n" #
    "- `Nat` money values are whole Indian Rupees (INR).\n" #
    "- `Nat` timestamps are nanoseconds since the Unix epoch.\n" #
    "- Dates are ISO-8601 `Text`, e.g. `\"2026-04-15\"`.\n" #
    "- `Percentage` is a whole number 0-100.\n" #
    "- `?T` fields are optional; `null` means absent.\n" #
    "- Status fields are variants: `TenderStatus` (`#open`, `#closingSoon`,\n" #
    "  `#closed`, `#awarded`), `OrderStatus` (`#placed`, `#dispatched`,\n" #
    "  `#delivered`, `#accepted`, `#disputed`), `InvoiceStatus` (`#draft`,\n" #
    "  `#issued`, `#partiallyPaid`, `#paid`, `#overdue`), and\n" #
    "  `DocumentCategory` (`#invoice`, `#purchaseOrder`, `#deliveryChallan`,\n" #
    "  `#acceptanceRecord`, `#correspondence`, `#other`).\n" #
    "\n" #
    "## Business profile and staff\n" #
    "\n" #
    "- `getBusinessProfile() : async ?BusinessProfile` — the caller's profile.\n" #
    "- `saveBusinessProfile(profile : BusinessProfile) : async ()` — upsert the\n" #
    "  caller's profile. The `id` field is caller-supplied and not validated.\n" #
    "- `listStaffRoles() : async [StaffRole]` — the caller's staff list.\n" #
    "- `saveStaffRoles(roles : [StaffRole]) : async ()` — replace the caller's\n" #
    "  staff list wholesale. This is destructive: the previous list is discarded.\n" #
    "\n" #
    "## Tenders\n" #
    "\n" #
    "- `listTenders() : async [Tender]`\n" #
    "- `getTender(id : Nat) : async ?Tender`\n" #
    "- `saveTender(tender : Tender) : async ()` — upsert by `tender.id`.\n" #
    "- `setTenderSaved(id : Nat, saved : Bool) : async Bool` — returns `false`\n" #
    "  when no tender with that id exists for the caller.\n" #
    "\n" #
    "## Orders\n" #
    "\n" #
    "- `listOrders() : async [PurchaseOrder]`\n" #
    "- `getOrder(id : Nat) : async ?PurchaseOrder`\n" #
    "- `createOrder(input : OrderInput) : async Nat` — returns the new id.\n" #
    "- `updateOrder(id : Nat, input : OrderInput) : async Bool` — returns `false`\n" #
    "  when the order does not exist. The update replaces the editable fields;\n" #
    "  delivery and dispute fields are managed by the stored record.\n" #
    "\n" #
    "## Invoices and payments\n" #
    "\n" #
    "- `listInvoices() : async [Invoice]`\n" #
    "- `getInvoice(id : Nat) : async ?Invoice`\n" #
    "- `createInvoice(input : InvoiceInput) : async Nat` — returns the new id.\n" #
    "- `updateInvoice(id : Nat, input : InvoiceInput) : async Bool`\n" #
    "- `deleteInvoice(id : Nat) : async Bool` — destructive; returns `false`\n" #
    "  when the invoice does not exist.\n" #
    "- `listPayments(invoiceId : Nat) : async [Payment]`\n" #
    "- `recordPayment(input : PaymentInput) : async Nat` — appends a payment and\n" #
    "  updates the linked invoice's `amountPaid` and `balance`. Returns the new\n" #
    "  payment id. Not idempotent: calling it twice records two payments.\n" #
    "- `estimateInterest(id : Nat, annualRatePercent : Nat, asOfDate : Text) :\n" #
    "  async ?InterestEstimate` — a rule-based estimate, not a guaranteed\n" #
    "  recovery or legal advice. Returns `null` when the invoice does not exist.\n" #
    "\n" #
    "## Compliance\n" #
    "\n" #
    "- `getComplianceSummary() : async ComplianceSummary`\n" #
    "- `listChecklistItems() : async [ChecklistItem]`\n" #
    "- `saveChecklistItems(items : [ChecklistItem]) : async ()` — replaces the\n" #
    "  caller's checklist wholesale (destructive).\n" #
    "- `listBuyerRisks() : async [BuyerRisk]`\n" #
    "\n" #
    "## Documents and escalations\n" #
    "\n" #
    "- `listDocuments() : async [Document]`\n" #
    "- `getDocument(id : Nat) : async ?Document`\n" #
    "- `createDocument(input : DocumentInput) : async Nat` — returns the new id.\n" #
    "- `deleteDocument(id : Nat) : async Bool` — destructive.\n" #
    "- `listEscalationSteps() : async [EscalationStep]`\n" #
    "- `getEvidenceChecklist(documentId : Nat) : async ?EvidenceChecklist` —\n" #
    "  returns `null` when the document does not exist. The checklist is a\n" #
    "  preparation aid; the app does not submit official complaints.\n" #
    "\n" #
    "## Reports\n" #
    "\n" #
    "- `getDashboardMetrics() : async DashboardMetrics`\n" #
    "- `getMonthlyFinancials() : async [MonthlyFinancial]`\n" #
    "- `getBuyerDelayReport() : async [BuyerDelayReport]`\n" #
    "- `getWorkingCapitalEstimate(enteredExpenses : Nat) : async\n" #
    "  WorkingCapitalEstimate` — an estimate from unpaid invoices and the\n" #
    "  supplied expenses; not a live financing integration or loan approval.\n" #
    "- `listActivity() : async [ActivityEntry]`\n" #
    "\n" #
    "## Demo data\n" #
    "\n" #
    "- `seedDemoData() : async Bool` — seeds clearly labelled sample records for\n" #
    "  the caller. Idempotent: returns `false` and writes nothing once a profile\n" #
    "  already exists for the caller.\n" #
    "\n" #
    "## Lifecycle and polling\n" #
    "\n" #
    "All methods are synchronous from the caller's perspective — there is no job\n" #
    "queue and no polling protocol. A call returns the final result. `query`\n" #
    "methods (`getBusinessProfile`, `listStaffRoles`, `listTenders`, `getTender`,\n" #
    "`listOrders`, `getOrder`, `listInvoices`, `getInvoice`, `listPayments`,\n" #
    "`estimateInterest`, `getComplianceSummary`, `listChecklistItems`,\n" #
    "`listBuyerRisks`, `listDocuments`, `getDocument`, `listEscalationSteps`,\n" #
    "`getEvidenceChecklist`, `getDashboardMetrics`, `getMonthlyFinancials`,\n" #
    "`getBuyerDelayReport`, `getWorkingCapitalEstimate`, `listActivity`) are\n" #
    "read-only and fast. Update methods persist their change before returning.\n" #
    "\n" #
    "## Mutation retry safety\n" #
    "\n" #
    "- `saveBusinessProfile`, `saveStaffRoles`, `saveTender`, `saveChecklistItems`\n" #
    "  are upserts/replacements and are safe to retry with the same payload.\n" #
    "- `createOrder`, `createInvoice`, `createDocument`, `recordPayment` are\n" #
    "  append operations and are NOT idempotent: a retried call creates a second\n" #
    "  record. Retry only after confirming the first call failed.\n" #
    "- `deleteInvoice`, `deleteDocument` are destructive and return `false` on a\n" #
    "  second call for the same id.\n" #
    "- `seedDemoData` is idempotent.\n" #
    "\n" #
    "## Errors and gotchas\n" #
    "\n" #
    "- Methods that take an id return `?T` or `Bool` rather than trapping when\n" #
    "  the record is absent; a `null`/`false` result is a normal outcome.\n" #
    "- `saveStaffRoles` and `saveChecklistItems` replace the whole list — send\n" #
    "  the complete desired list, not a delta.\n" #
    "- `recordPayment` mutates the linked invoice's balance; recording a payment\n" #
    "  larger than the balance is not rejected by the backend.\n" #
    "- Interest and working-capital figures are estimates, not guaranteed\n" #
    "  recoveries or legal advice.\n" #
    "- The OQL `schema()` and `execute()` methods are provided by the OQL\n" #
    "  `Expose` mixin and are documented by that layer, not here.\n";
  };
};
