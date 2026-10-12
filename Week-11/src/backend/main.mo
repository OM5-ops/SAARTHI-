import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import OQL "mo:caffeineai-oql";
import Expose "mo:caffeineai-oql/Expose";
import Entity "mo:caffeineai-oql/Entity";
import NatValue "mo:caffeineai-oql/NatValue";
import TextValue "mo:caffeineai-oql/TextValue";
import BoolValue "mo:caffeineai-oql/BoolValue";

import BusinessTypes "types/business";
import TenderTypes "types/tenders";
import OrderTypes "types/orders";
import InvoiceTypes "types/invoices";
import ComplianceTypes "types/compliance";
import DocumentTypes "types/documents";
import ReportTypes "types/reports";

import BusinessApi "mixins/business-api";
import TendersApi "mixins/tenders-api";
import OrdersApi "mixins/orders-api";
import InvoicesApi "mixins/invoices-api";
import ComplianceApi "mixins/compliance-api";
import DocumentsApi "mixins/documents-api";
import ReportsApi "mixins/reports-api";
import DemoApi "mixins/demo-api";
import ApiDocMixin "mixins/api-doc";

actor {
  let accessControlState : AccessControl.AccessControlState;

  let profiles : Map.Map<Principal, BusinessTypes.BusinessProfile>;
  let staff : Map.Map<Principal, [BusinessTypes.StaffRole]>;
  let tenders : Map.Map<Principal, Map.Map<Nat, TenderTypes.Tender>>;
  let orders : Map.Map<Principal, Map.Map<Nat, OrderTypes.PurchaseOrder>>;
  let invoices : Map.Map<Principal, Map.Map<Nat, InvoiceTypes.Invoice>>;
  let payments : Map.Map<Principal, Map.Map<Nat, InvoiceTypes.Payment>>;
  let checklists : Map.Map<Principal, [ComplianceTypes.ChecklistItem]>;
  let risks : Map.Map<Principal, [ComplianceTypes.BuyerRisk]>;
  let documents : Map.Map<Principal, Map.Map<Nat, DocumentTypes.Document>>;
  let escalations : Map.Map<Principal, [DocumentTypes.EscalationStep]>;
  let activity : Map.Map<Principal, [ReportTypes.ActivityEntry]>;

  let nextOrderId : { var value : Nat };
  let nextInvoiceId : { var value : Nat };
  let nextPaymentId : { var value : Nat };
  let nextDocumentId : { var value : Nat };

  // Flatten the per-user nested maps into a single row stream for OQL.
  func flattenTenders() : Iter.Iter<(Principal, TenderTypes.Tender)> {
    tenders.entries().flatMap(func((owner, userTenders)) {
      userTenders.values().map(func(tender) = (owner, tender));
    });
  };

  func flattenOrders() : Iter.Iter<(Principal, OrderTypes.PurchaseOrder)> {
    orders.entries().flatMap(func((owner, userOrders)) {
      userOrders.values().map(func(order) = (owner, order));
    });
  };

  func flattenInvoices() : Iter.Iter<(Principal, InvoiceTypes.Invoice)> {
    invoices.entries().flatMap(func((owner, userInvoices)) {
      userInvoices.values().map(func(invoice) = (owner, invoice));
    });
  };

  func flattenDocuments() : Iter.Iter<(Principal, DocumentTypes.Document)> {
    documents.entries().flatMap(func((owner, userDocuments)) {
      userDocuments.values().map(func(document) = (owner, document));
    });
  };

  func flattenProfiles() : Iter.Iter<(Principal, BusinessTypes.BusinessProfile)> {
    profiles.entries();
  };

  func flattenStaff() : Iter.Iter<(Principal, BusinessTypes.StaffRole)> {
    staff.entries().flatMap(func((owner, roles)) {
      roles.values().map(func(role) = (owner, role));
    });
  };

  func flattenPayments() : Iter.Iter<(Principal, InvoiceTypes.Payment)> {
    payments.entries().flatMap(func((owner, userPayments)) {
      userPayments.values().map(func(payment) = (owner, payment));
    });
  };

  func flattenChecklists() : Iter.Iter<(Principal, ComplianceTypes.ChecklistItem)> {
    checklists.entries().flatMap(func((owner, items)) {
      items.values().map(func(item) = (owner, item));
    });
  };

  func flattenRisks() : Iter.Iter<(Principal, ComplianceTypes.BuyerRisk)> {
    risks.entries().flatMap(func((owner, items)) {
      items.values().map(func(item) = (owner, item));
    });
  };

  func flattenEscalations() : Iter.Iter<(Principal, DocumentTypes.EscalationStep)> {
    escalations.entries().flatMap(func((owner, items)) {
      items.values().map(func(item) = (owner, item));
    });
  };

  func flattenActivity() : Iter.Iter<(Principal, ReportTypes.ActivityEntry)> {
    activity.entries().flatMap(func((owner, items)) {
      items.values().map(func(item) = (owner, item));
    });
  };

  transient let anyPrincipal = Principal.fromText("aaaaa-aa");

  include MixinAuthorization(accessControlState, null);

  include BusinessApi(profiles, staff);
  include TendersApi(tenders);
  include OrdersApi(orders, nextOrderId);
  include InvoicesApi(invoices, payments, nextInvoiceId, nextPaymentId);
  include ComplianceApi(checklists, risks);
  include DocumentsApi(documents, escalations, nextDocumentId);
  include ReportsApi(orders, invoices, payments, tenders, activity);
  include DemoApi(profiles, staff, tenders, orders, invoices, payments, checklists, risks, documents, escalations, activity, nextOrderId, nextInvoiceId, nextPaymentId, nextDocumentId);

  include Expose({
    entities = [
      OQL.Entity.manual<(Principal, TenderTypes.Tender)>("tender", flattenTenders, "Tender", "id")
        .sample((anyPrincipal, {
          id = 0;
          title = "";
          buyer = "";
          referenceNumber = "";
          estimatedValue = 0;
          emdAmount = 0;
          publishedDate = "";
          submissionDeadline = "";
          eligibility = "";
          msmeEligible = false;
          status = #open;
          saved = false;
          applicationStage = "";
        }))
        .payload("id", func((_, tender)) = tender.id)
        .payload("title", func((_, tender)) = tender.title)
        .payload("buyer", func((_, tender)) = tender.buyer)
        .payload("referenceNumber", func((_, tender)) = tender.referenceNumber)
        .payload("estimatedValue", func((_, tender)) = tender.estimatedValue)
        .payload("emdAmount", func((_, tender)) = tender.emdAmount)
        .payload("publishedDate", func((_, tender)) = tender.publishedDate)
        .payload("submissionDeadline", func((_, tender)) = tender.submissionDeadline)
        .payload("eligibility", func((_, tender)) = tender.eligibility)
        .payload("msmeEligible", func((_, tender)) = tender.msmeEligible)
        .payload("status", func((_, tender)) = switch (tender.status) {
          case (#open) { "open" };
          case (#closingSoon) { "closingSoon" };
          case (#closed) { "closed" };
          case (#awarded) { "awarded" };
        })
        .payload("saved", func((_, tender)) = tender.saved)
        .payload("applicationStage", func((_, tender)) = tender.applicationStage)
        .controllerOnly()
        .build(),
      OQL.Entity.manual<(Principal, OrderTypes.PurchaseOrder)>("order", flattenOrders, "PurchaseOrder", "id")
        .sample((anyPrincipal, {
          id = 0;
          orderNumber = "";
          buyer = "";
          description = "";
          quantity = 0;
          unit = "";
          value = 0;
          orderDate = "";
          deliveryDeadline = "";
          status = #placed;
          dispatchedDate = null;
          deliveredDate = null;
          acceptedDate = null;
          proofOfDelivery = null;
          disputeReason = null;
          linkedInvoiceIds = [];
          documentIds = [];
        }))
        .payload("id", func((_, order)) = order.id)
        .payload("orderNumber", func((_, order)) = order.orderNumber)
        .payload("buyer", func((_, order)) = order.buyer)
        .payload("description", func((_, order)) = order.description)
        .payload("quantity", func((_, order)) = order.quantity)
        .payload("unit", func((_, order)) = order.unit)
        .payload("value", func((_, order)) = order.value)
        .payload("orderDate", func((_, order)) = order.orderDate)
        .payload("deliveryDeadline", func((_, order)) = order.deliveryDeadline)
        .payload("status", func((_, order)) = switch (order.status) {
          case (#placed) { "placed" };
          case (#dispatched) { "dispatched" };
          case (#delivered) { "delivered" };
          case (#accepted) { "accepted" };
          case (#disputed) { "disputed" };
        })
        .controllerOnly()
        .build(),
      OQL.Entity.manual<(Principal, InvoiceTypes.Invoice)>("invoice", flattenInvoices, "Invoice", "id")
        .sample((anyPrincipal, {
          id = 0;
          invoiceNumber = "";
          buyer = "";
          linkedOrderId = null;
          amount = 0;
          amountPaid = 0;
          balance = 0;
          invoiceDate = "";
          acceptanceDate = null;
          paymentTermsDays = 0;
          dueDate = "";
          status = #issued;
          msmedApplicable = false;
          msmedDueDate = null;
          reminderSentAt = null;
        }))
        .payload("id", func((_, invoice)) = invoice.id)
        .payload("invoiceNumber", func((_, invoice)) = invoice.invoiceNumber)
        .payload("buyer", func((_, invoice)) = invoice.buyer)
        .payload("amount", func((_, invoice)) = invoice.amount)
        .payload("amountPaid", func((_, invoice)) = invoice.amountPaid)
        .payload("balance", func((_, invoice)) = invoice.balance)
        .payload("invoiceDate", func((_, invoice)) = invoice.invoiceDate)
        .payload("paymentTermsDays", func((_, invoice)) = invoice.paymentTermsDays)
        .payload("dueDate", func((_, invoice)) = invoice.dueDate)
        .payload("status", func((_, invoice)) = switch (invoice.status) {
          case (#draft) { "draft" };
          case (#issued) { "issued" };
          case (#partiallyPaid) { "partiallyPaid" };
          case (#paid) { "paid" };
          case (#overdue) { "overdue" };
        })
        .payload("msmedApplicable", func((_, invoice)) = invoice.msmedApplicable)
        .controllerOnly()
        .build(),
      OQL.Entity.manual<(Principal, DocumentTypes.Document)>("document", flattenDocuments, "Document", "id")
        .sample((anyPrincipal, {
          id = 0;
          name = "";
          category = #other;
          mimeType = "";
          sizeBytes = 0;
          uploadedAt = 0;
          linkedInvoiceId = null;
          linkedOrderId = null;
          notes = "";
        }))
        .payload("id", func((_, document)) = document.id)
        .payload("name", func((_, document)) = document.name)
        .payload("category", func((_, document)) = switch (document.category) {
          case (#invoice) { "invoice" };
          case (#purchaseOrder) { "purchaseOrder" };
          case (#deliveryChallan) { "deliveryChallan" };
          case (#acceptanceRecord) { "acceptanceRecord" };
          case (#correspondence) { "correspondence" };
          case (#other) { "other" };
        })
        .payload("mimeType", func((_, document)) = document.mimeType)
        .payload("sizeBytes", func((_, document)) = document.sizeBytes)
        .payload("uploadedAt", func((_, document)) = document.uploadedAt)
        .payload("notes", func((_, document)) = document.notes)
        .controllerOnly()
        .build(),
      OQL.Entity.manual<(Principal, BusinessTypes.BusinessProfile)>("businessProfile", flattenProfiles, "BusinessProfile", "id")
        .sample((anyPrincipal, {
          id = 0;
          companyName = "";
          ownerName = "";
          udyamNumber = "";
          gstin = "";
          pan = "";
          category = "";
          products = [];
          monthlyCapacity = "";
          address = "";
          contactEmail = "";
          contactPhone = "";
          updatedAt = 0;
        }))
        .payload("id", func((_, profile)) = profile.id)
        .payload("companyName", func((_, profile)) = profile.companyName)
        .payload("ownerName", func((_, profile)) = profile.ownerName)
        .payload("udyamNumber", func((_, profile)) = profile.udyamNumber)
        .payload("gstin", func((_, profile)) = profile.gstin)
        .payload("pan", func((_, profile)) = profile.pan)
        .payload("category", func((_, profile)) = profile.category)
        .payload("monthlyCapacity", func((_, profile)) = profile.monthlyCapacity)
        .payload("address", func((_, profile)) = profile.address)
        .payload("contactEmail", func((_, profile)) = profile.contactEmail)
        .payload("contactPhone", func((_, profile)) = profile.contactPhone)
        .payload("updatedAt", func((_, profile)) = profile.updatedAt)
        .controllerOnly()
        .build(),
      OQL.Entity.manual<(Principal, BusinessTypes.StaffRole)>("staffRole", flattenStaff, "StaffRole", "id")
        .sample((anyPrincipal, { id = 0; name = ""; role = ""; email = "" }))
        .payload("id", func((_, role)) = role.id)
        .payload("name", func((_, role)) = role.name)
        .payload("role", func((_, role)) = role.role)
        .payload("email", func((_, role)) = role.email)
        .controllerOnly()
        .build(),
      OQL.Entity.manual<(Principal, InvoiceTypes.Payment)>("payment", flattenPayments, "Payment", "id")
        .sample((anyPrincipal, {
          id = 0;
          invoiceId = 0;
          amount = 0;
          paidDate = "";
          reference = "";
          method = "";
        }))
        .payload("id", func((_, payment)) = payment.id)
        .payload("invoiceId", func((_, payment)) = payment.invoiceId)
        .payload("amount", func((_, payment)) = payment.amount)
        .payload("paidDate", func((_, payment)) = payment.paidDate)
        .payload("reference", func((_, payment)) = payment.reference)
        .payload("method", func((_, payment)) = payment.method)
        .controllerOnly()
        .build(),
      OQL.Entity.manual<(Principal, ComplianceTypes.ChecklistItem)>("checklistItem", flattenChecklists, "ChecklistItem", "id")
        .sample((anyPrincipal, { id = 0; text = ""; completed = false; category = "" }))
        .payload("id", func((_, item)) = item.id)
        .payload("text", func((_, item)) = item.text)
        .payload("completed", func((_, item)) = item.completed)
        .payload("category", func((_, item)) = item.category)
        .controllerOnly()
        .build(),
      OQL.Entity.manual<(Principal, ComplianceTypes.BuyerRisk)>("buyerRisk", flattenRisks, "BuyerRisk", "buyer")
        .sample((anyPrincipal, {
          buyer = "";
          riskScore = 0;
          overdueInvoices = 0;
          averageDelayDays = 0;
          notes = "";
        }))
        .payload("buyer", func((_, risk)) = risk.buyer)
        .payload("riskScore", func((_, risk)) = risk.riskScore)
        .payload("overdueInvoices", func((_, risk)) = risk.overdueInvoices)
        .payload("averageDelayDays", func((_, risk)) = risk.averageDelayDays)
        .payload("notes", func((_, risk)) = risk.notes)
        .controllerOnly()
        .build(),
      OQL.Entity.manual<(Principal, DocumentTypes.EscalationStep)>("escalationStep", flattenEscalations, "EscalationStep", "id")
        .sample((anyPrincipal, {
          id = 0;
          text = "";
          dueDate = "";
          completed = false;
          description = "";
        }))
        .payload("id", func((_, step)) = step.id)
        .payload("text", func((_, step)) = step.text)
        .payload("dueDate", func((_, step)) = step.dueDate)
        .payload("completed", func((_, step)) = step.completed)
        .payload("description", func((_, step)) = step.description)
        .controllerOnly()
        .build(),
      OQL.Entity.manual<(Principal, ReportTypes.ActivityEntry)>("activityEntry", flattenActivity, "ActivityEntry", "id")
        .sample((anyPrincipal, { id = 0; timestamp = 0; kind = ""; message = "" }))
        .payload("id", func((_, entry)) = entry.id)
        .payload("timestamp", func((_, entry)) = entry.timestamp)
        .payload("kind", func((_, entry)) = entry.kind)
        .payload("message", func((_, entry)) = entry.message)
        .controllerOnly()
        .build(),
    ];
  });

  include ApiDocMixin();
};
