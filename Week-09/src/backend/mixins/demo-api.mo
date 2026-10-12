import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import BusinessTypes "../types/business";
import TenderTypes "../types/tenders";
import OrderTypes "../types/orders";
import InvoiceTypes "../types/invoices";
import ComplianceTypes "../types/compliance";
import DocumentTypes "../types/documents";
import ReportTypes "../types/reports";

mixin (
  profiles : Map.Map<Principal, BusinessTypes.BusinessProfile>,
  staff : Map.Map<Principal, [BusinessTypes.StaffRole]>,
  tenders : Map.Map<Principal, Map.Map<Nat, TenderTypes.Tender>>,
  orders : Map.Map<Principal, Map.Map<Nat, OrderTypes.PurchaseOrder>>,
  invoices : Map.Map<Principal, Map.Map<Nat, InvoiceTypes.Invoice>>,
  payments : Map.Map<Principal, Map.Map<Nat, InvoiceTypes.Payment>>,
  checklists : Map.Map<Principal, [ComplianceTypes.ChecklistItem]>,
  risks : Map.Map<Principal, [ComplianceTypes.BuyerRisk]>,
  documents : Map.Map<Principal, Map.Map<Nat, DocumentTypes.Document>>,
  escalations : Map.Map<Principal, [DocumentTypes.EscalationStep]>,
  activity : Map.Map<Principal, [ReportTypes.ActivityEntry]>,
  nextOrderId : { var value : Nat },
  nextInvoiceId : { var value : Nat },
  nextPaymentId : { var value : Nat },
  nextDocumentId : { var value : Nat },
) {
  // Seed realistic, clearly labelled sample data for the calling business.
  // Idempotent: a second call is a no-op once a profile exists.
  public shared ({ caller }) func seedDemoData() : async Bool {
    if (profiles.get(caller) != null) {
      return false;
    };
    let now = Time.now().toNat();

    profiles.add(caller, {
      id = 1;
      companyName = "SARRTHI Demo Industries Pvt Ltd (sample)";
      ownerName = "Ravi Kumar (sample)";
      udyamNumber = "UDYAM-DL-00-0000000 (sample)";
      gstin = "07AAAAA0000A1Z5 (sample)";
      pan = "AAAAA0000A (sample)";
      category = "Micro Enterprise (sample)";
      products = ["Fabricated steel components (sample)", "Railway signalling spares (sample)", "Industrial fasteners (sample)"];
      monthlyCapacity = "12,000 units / month (sample)";
      address = "Plot 42, Okhla Industrial Area Phase II, New Delhi 110020 (sample)";
      contactEmail = "demo@sarrthi.example (sample)";
      contactPhone = "+91 90000 00000 (sample)";
      updatedAt = now;
    });

    staff.add(caller, [
      { id = 1; name = "Ravi Kumar (sample)"; role = "Owner"; email = "ravi@sarrthi.example (sample)" },
      { id = 2; name = "Anita Sharma (sample)"; role = "Accounts"; email = "anita@sarrthi.example (sample)" },
      { id = 3; name = "Suresh Rao (sample)"; role = "Operations"; email = "suresh@sarrthi.example (sample)" },
    ]);

    let userTenders = Map.empty<Nat, TenderTypes.Tender>();
    userTenders.add(1, {
      id = 1;
      title = "Supply of fabricated steel brackets (sample)";
      buyer = "Indian Railways — Northern Railway (sample)";
      referenceNumber = "NR/DEMO/2026/0001 (sample)";
      estimatedValue = 2500000;
      emdAmount = 50000;
      publishedDate = "2026-03-01";
      submissionDeadline = "2026-04-30";
      eligibility = "MSME registered, past experience of 2 years (sample)";
      msmeEligible = true;
      status = #closingSoon;
      saved = true;
      applicationStage = "Bid documents under preparation (sample)";
    });
    userTenders.add(2, {
      id = 2;
      title = "Annual rate contract for industrial fasteners (sample)";
      buyer = "Bharat Heavy Electricals Ltd (sample)";
      referenceNumber = "BHEL/DEMO/2026/0042 (sample)";
      estimatedValue = 1800000;
      emdAmount = 36000;
      publishedDate = "2026-02-10";
      submissionDeadline = "2026-03-20";
      eligibility = "MSME registered, ISO 9001 (sample)";
      msmeEligible = true;
      status = #closed;
      saved = false;
      applicationStage = "Bid submitted (sample)";
    });
    userTenders.add(3, {
      id = 3;
      title = "Maintenance of signalling equipment (sample)";
      buyer = "Indian Railways — Western Railway (sample)";
      referenceNumber = "WR/DEMO/2026/0017 (sample)";
      estimatedValue = 900000;
      emdAmount = 18000;
      publishedDate = "2026-01-15";
      submissionDeadline = "2026-02-15";
      eligibility = "MSME registered (sample)";
      msmeEligible = true;
      status = #awarded;
      saved = true;
      applicationStage = "Awarded (sample)";
    });
    tenders.add(caller, userTenders);

    let userOrders = Map.empty<Nat, OrderTypes.PurchaseOrder>();
    userOrders.add(1, {
      id = 1;
      orderNumber = "PO/NR/2026/0001 (sample)";
      buyer = "Indian Railways — Northern Railway (sample)";
      description = "Fabricated steel brackets, 5,000 units (sample)";
      quantity = 5000;
      unit = "units";
      value = 1250000;
      orderDate = "2026-02-20";
      deliveryDeadline = "2026-04-10";
      status = #dispatched;
      dispatchedDate = ?"2026-03-28";
      deliveredDate = null : ?Text;
      acceptedDate = null : ?Text;
      proofOfDelivery = null : ?Text;
      disputeReason = null : ?Text;
      linkedInvoiceIds = [1];
      documentIds = [1];
    });
    userOrders.add(2, {
      id = 2;
      orderNumber = "PO/BHEL/2026/0042 (sample)";
      buyer = "Bharat Heavy Electricals Ltd (sample)";
      description = "Industrial fasteners, 20,000 units (sample)";
      quantity = 20000;
      unit = "units";
      value = 600000;
      orderDate = "2026-01-05";
      deliveryDeadline = "2026-02-05";
      status = #accepted;
      dispatchedDate = ?"2026-01-25";
      deliveredDate = ?"2026-02-01";
      acceptedDate = ?"2026-02-03";
      proofOfDelivery = ?"POD/BHEL/2026/0042 (sample)";
      disputeReason = null : ?Text;
      linkedInvoiceIds = [2];
      documentIds = [2];
    });
    userOrders.add(3, {
      id = 3;
      orderNumber = "PO/WR/2026/0017 (sample)";
      buyer = "Indian Railways — Western Railway (sample)";
      description = "Signalling equipment maintenance, 1 lot (sample)";
      quantity = 1;
      unit = "lot";
      value = 900000;
      orderDate = "2026-02-16";
      deliveryDeadline = "2026-03-15";
      status = #disputed;
      dispatchedDate = ?"2026-03-10";
      deliveredDate = ?"2026-03-14";
      acceptedDate = null : ?Text;
      proofOfDelivery = null : ?Text;
      disputeReason = ?"Buyer raised a quality query on 2 items (sample)";
      linkedInvoiceIds = [] : [Nat];
      documentIds = [] : [Nat];
    });
    orders.add(caller, userOrders);
    nextOrderId.value := 4;

    let userInvoices = Map.empty<Nat, InvoiceTypes.Invoice>();
    userInvoices.add(1, {
      id = 1;
      invoiceNumber = "INV/2026/0001 (sample)";
      buyer = "Indian Railways — Northern Railway (sample)";
      linkedOrderId = ?1;
      amount = 1250000;
      amountPaid = 500000;
      balance = 750000;
      invoiceDate = "2026-03-01";
      acceptanceDate = ?"2026-03-05";
      paymentTermsDays = 45;
      dueDate = "2026-04-15";
      status = #partiallyPaid;
      msmedApplicable = true;
      msmedDueDate = ?"2026-04-19";
      reminderSentAt = null : ?Nat;
    });
    userInvoices.add(2, {
      id = 2;
      invoiceNumber = "INV/2026/0002 (sample)";
      buyer = "Bharat Heavy Electricals Ltd (sample)";
      linkedOrderId = ?2;
      amount = 600000;
      amountPaid = 600000;
      balance = 0;
      invoiceDate = "2026-02-05";
      acceptanceDate = ?"2026-02-10";
      paymentTermsDays = 30;
      dueDate = "2026-03-12";
      status = #paid;
      msmedApplicable = true;
      msmedDueDate = ?"2026-03-22";
      reminderSentAt = null : ?Nat;
    });
    userInvoices.add(3, {
      id = 3;
      invoiceNumber = "INV/2026/0003 (sample)";
      buyer = "Bharat Heavy Electricals Ltd (sample)";
      linkedOrderId = null : ?Nat;
      amount = 450000;
      amountPaid = 0;
      balance = 450000;
      invoiceDate = "2026-01-20";
      acceptanceDate = null : ?Text;
      paymentTermsDays = 45;
      dueDate = "2026-03-06";
      status = #overdue;
      msmedApplicable = true;
      msmedDueDate = ?"2026-03-06";
      reminderSentAt = ?now;
    });
    userInvoices.add(4, {
      id = 4;
      invoiceNumber = "INV/2026/0004 (sample)";
      buyer = "Indian Railways — Western Railway (sample)";
      linkedOrderId = ?3;
      amount = 900000;
      amountPaid = 0;
      balance = 900000;
      invoiceDate = "2026-03-16";
      acceptanceDate = null : ?Text;
      paymentTermsDays = 45;
      dueDate = "2026-04-30";
      status = #issued;
      msmedApplicable = true;
      msmedDueDate = ?"2026-04-30";
      reminderSentAt = null : ?Nat;
    });
    invoices.add(caller, userInvoices);
    nextInvoiceId.value := 5;

    let userPayments = Map.empty<Nat, InvoiceTypes.Payment>();
    userPayments.add(1, {
      id = 1;
      invoiceId = 1;
      amount = 500000;
      paidDate = "2026-03-25";
      reference = "NEFT/DEMO/0001 (sample)";
      method = "NEFT";
    });
    userPayments.add(2, {
      id = 2;
      invoiceId = 2;
      amount = 600000;
      paidDate = "2026-03-10";
      reference = "RTGS/DEMO/0002 (sample)";
      method = "RTGS";
    });
    payments.add(caller, userPayments);
    nextPaymentId.value := 3;

    checklists.add(caller, [
      { id = 1; text = "Udyam registration certificate uploaded (sample)"; completed = true; category = "Registration" },
      { id = 2; text = "GST returns up to date (sample)"; completed = true; category = "Tax" },
      { id = 3; text = "Bid security (EMD) arranged (sample)"; completed = false; category = "Tender" },
      { id = 4; text = "Delivery challan filed for open orders (sample)"; completed = false; category = "Delivery" },
    ]);

    risks.add(caller, [
      { buyer = "Bharat Heavy Electricals Ltd (sample)"; riskScore = 35; overdueInvoices = 0; averageDelayDays = 5; notes = "Mostly on time; one invoice settled after a short delay (sample)." },
      { buyer = "Indian Railways — Western Railway (sample)"; riskScore = 70; overdueInvoices = 1; averageDelayDays = 22; notes = "One invoice overdue; dispute open on a linked order (sample)." },
      { buyer = "Indian Railways — Northern Railway (sample)"; riskScore = 45; overdueInvoices = 0; averageDelayDays = 10; notes = "Partial payment received; balance within terms (sample)." },
    ]);

    let userDocuments = Map.empty<Nat, DocumentTypes.Document>();
    userDocuments.add(1, {
      id = 1;
      name = "PO/NR/2026/0001.pdf (sample)";
      category = #purchaseOrder;
      mimeType = "application/pdf";
      sizeBytes = 182000;
      uploadedAt = now;
      linkedInvoiceId = ?1;
      linkedOrderId = ?1;
      notes = "Northern Railway purchase order copy (sample).";
    });
    userDocuments.add(2, {
      id = 2;
      name = "INV/2026/0002.pdf (sample)";
      category = #invoice;
      mimeType = "application/pdf";
      sizeBytes = 96000;
      uploadedAt = now;
      linkedInvoiceId = ?2;
      linkedOrderId = ?2;
      notes = "Paid invoice copy (sample).";
    });
    userDocuments.add(3, {
      id = 3;
      name = "Challan/WR/2026/0017.pdf (sample)";
      category = #deliveryChallan;
      mimeType = "application/pdf";
      sizeBytes = 74000;
      uploadedAt = now;
      linkedInvoiceId = null : ?Nat;
      linkedOrderId = ?3;
      notes = "Delivery challan for the disputed order (sample).";
    });
    documents.add(caller, userDocuments);
    nextDocumentId.value := 4;

    escalations.add(caller, [
      { id = 1; text = "Send written reminder to buyer (sample)"; dueDate = "2026-03-20"; completed = true; description = "First reminder for the overdue invoice (sample)." },
      { id = 2; text = "Issue formal demand notice (sample)"; dueDate = "2026-04-05"; completed = false; description = "Next step if the reminder is unanswered (sample)." },
      { id = 3; text = "Prepare ODR filing documents (sample)"; dueDate = "2026-04-20"; completed = false; description = "Assemble evidence before filing; this app does not submit complaints automatically (sample)." },
    ]);

    activity.add(caller, [
      { id = 1; timestamp = now; kind = "seed"; message = "Demo data seeded for the sample business." },
      { id = 2; timestamp = now; kind = "invoice"; message = "Invoice INV/2026/0003 is overdue (sample)." },
      { id = 3; timestamp = now; kind = "tender"; message = "Tender NR/DEMO/2026/0001 closes soon (sample)." },
    ]);

    true;
  };
};
