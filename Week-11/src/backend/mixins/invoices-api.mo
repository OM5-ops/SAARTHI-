import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Types "../types/invoices";
import InvoicesLib "../lib/invoices";

mixin (
  invoices : Map.Map<Principal, Map.Map<Nat, Types.Invoice>>,
  payments : Map.Map<Principal, Map.Map<Nat, Types.Payment>>,
  nextInvoiceId : { var value : Nat },
  nextPaymentId : { var value : Nat },
) {
  public query ({ caller }) func listInvoices() : async [Types.Invoice] {
    InvoicesLib.listInvoices(invoices, caller);
  };

  public query ({ caller }) func getInvoice(id : Nat) : async ?Types.Invoice {
    InvoicesLib.getInvoice(invoices, caller, id);
  };

  public shared ({ caller }) func createInvoice(input : Types.InvoiceInput) : async Nat {
    InvoicesLib.createInvoice(invoices, nextInvoiceId, caller, input);
  };

  public shared ({ caller }) func updateInvoice(id : Nat, input : Types.InvoiceInput) : async Bool {
    InvoicesLib.updateInvoice(invoices, caller, id, input);
  };

  public shared ({ caller }) func deleteInvoice(id : Nat) : async Bool {
    InvoicesLib.deleteInvoice(invoices, caller, id);
  };

  public query ({ caller }) func listPayments(invoiceId : Nat) : async [Types.Payment] {
    InvoicesLib.listPayments(payments, caller, invoiceId);
  };

  public shared ({ caller }) func recordPayment(input : Types.PaymentInput) : async Nat {
    InvoicesLib.recordPayment(invoices, payments, nextPaymentId, caller, input);
  };

  public query ({ caller }) func estimateInterest(id : Nat, annualRatePercent : Nat, asOfDate : Text) : async ?Types.InterestEstimate {
    InvoicesLib.estimateInterest(invoices, caller, id, annualRatePercent, asOfDate);
  };
};
