import Map "mo:core/Map";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";

module {
  type OldActor = {};

  type BusinessProfile = {
    id : Nat;
    companyName : Text;
    ownerName : Text;
    udyamNumber : Text;
    gstin : Text;
    pan : Text;
    category : Text;
    products : [Text];
    monthlyCapacity : Text;
    address : Text;
    contactEmail : Text;
    contactPhone : Text;
    updatedAt : Nat;
  };

  type StaffRole = { id : Nat; name : Text; role : Text; email : Text };

  type TenderStatus = { #open; #closingSoon; #closed; #awarded };

  type Tender = {
    id : Nat;
    title : Text;
    buyer : Text;
    referenceNumber : Text;
    estimatedValue : Nat;
    emdAmount : Nat;
    publishedDate : Text;
    submissionDeadline : Text;
    eligibility : Text;
    msmeEligible : Bool;
    status : TenderStatus;
    saved : Bool;
    applicationStage : Text;
  };

  type OrderStatus = { #placed; #dispatched; #delivered; #accepted; #disputed };

  type PurchaseOrder = {
    id : Nat;
    orderNumber : Text;
    buyer : Text;
    description : Text;
    quantity : Nat;
    unit : Text;
    value : Nat;
    orderDate : Text;
    deliveryDeadline : Text;
    status : OrderStatus;
    dispatchedDate : ?Text;
    deliveredDate : ?Text;
    acceptedDate : ?Text;
    proofOfDelivery : ?Text;
    disputeReason : ?Text;
    linkedInvoiceIds : [Nat];
    documentIds : [Nat];
  };

  type InvoiceStatus = { #draft; #issued; #partiallyPaid; #paid; #overdue };

  type Invoice = {
    id : Nat;
    invoiceNumber : Text;
    buyer : Text;
    linkedOrderId : ?Nat;
    amount : Nat;
    amountPaid : Nat;
    balance : Nat;
    invoiceDate : Text;
    acceptanceDate : ?Text;
    paymentTermsDays : Nat;
    dueDate : Text;
    status : InvoiceStatus;
    msmedApplicable : Bool;
    msmedDueDate : ?Text;
    reminderSentAt : ?Nat;
  };

  type Payment = {
    id : Nat;
    invoiceId : Nat;
    amount : Nat;
    paidDate : Text;
    reference : Text;
    method : Text;
  };

  type ChecklistItem = { id : Nat; text : Text; completed : Bool; category : Text };

  type BuyerRisk = {
    buyer : Text;
    riskScore : Nat;
    overdueInvoices : Nat;
    averageDelayDays : Nat;
    notes : Text;
  };

  type DocumentCategory = {
    #invoice;
    #purchaseOrder;
    #deliveryChallan;
    #acceptanceRecord;
    #correspondence;
    #other;
  };

  type Document = {
    id : Nat;
    name : Text;
    category : DocumentCategory;
    mimeType : Text;
    sizeBytes : Nat;
    uploadedAt : Nat;
    linkedInvoiceId : ?Nat;
    linkedOrderId : ?Nat;
    notes : Text;
  };

  type EscalationStep = {
    id : Nat;
    text : Text;
    dueDate : Text;
    completed : Bool;
    description : Text;
  };

  type ActivityEntry = { id : Nat; timestamp : Nat; kind : Text; message : Text };

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    profiles : Map.Map<Principal, BusinessProfile>;
    staff : Map.Map<Principal, [StaffRole]>;
    tenders : Map.Map<Principal, Map.Map<Nat, Tender>>;
    orders : Map.Map<Principal, Map.Map<Nat, PurchaseOrder>>;
    invoices : Map.Map<Principal, Map.Map<Nat, Invoice>>;
    payments : Map.Map<Principal, Map.Map<Nat, Payment>>;
    checklists : Map.Map<Principal, [ChecklistItem]>;
    risks : Map.Map<Principal, [BuyerRisk]>;
    documents : Map.Map<Principal, Map.Map<Nat, Document>>;
    escalations : Map.Map<Principal, [EscalationStep]>;
    activity : Map.Map<Principal, [ActivityEntry]>;
    nextOrderId : { var value : Nat };
    nextInvoiceId : { var value : Nat };
    nextPaymentId : { var value : Nat };
    nextDocumentId : { var value : Nat };
  };

  public func migration(_ : OldActor) : NewActor {
    {
      accessControlState = AccessControl.initState();
      profiles = Map.empty();
      staff = Map.empty();
      tenders = Map.empty();
      orders = Map.empty();
      invoices = Map.empty();
      payments = Map.empty();
      checklists = Map.empty();
      risks = Map.empty();
      documents = Map.empty();
      escalations = Map.empty();
      activity = Map.empty();
      nextOrderId = { var value = 1 };
      nextInvoiceId = { var value = 1 };
      nextPaymentId = { var value = 1 };
      nextDocumentId = { var value = 1 };
    };
  };
};
