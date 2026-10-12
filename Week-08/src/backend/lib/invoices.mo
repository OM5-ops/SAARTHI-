import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Types "../types/invoices";

module {
  func userInvoices(invoices : Map.Map<Principal, Map.Map<Nat, Types.Invoice>>, caller : Principal) : Map.Map<Nat, Types.Invoice> {
    switch (invoices.get(caller)) {
      case (?existing) { existing };
      case null {
        let fresh = Map.empty<Nat, Types.Invoice>();
        invoices.add(caller, fresh);
        fresh;
      };
    };
  };

  func userPayments(payments : Map.Map<Principal, Map.Map<Nat, Types.Payment>>, caller : Principal) : Map.Map<Nat, Types.Payment> {
    switch (payments.get(caller)) {
      case (?existing) { existing };
      case null {
        let fresh = Map.empty<Nat, Types.Payment>();
        payments.add(caller, fresh);
        fresh;
      };
    };
  };

  // Whole days between two ISO-8601 date strings ("YYYY-MM-DD").
  func daysBetween(from : Text, to : Text) : Nat {
    let a = from.toInt() ?? 0;
    let b = to.toInt() ?? 0;
    if (b > a) { (b - a).toNat() } else { 0 };
  };

  func statusFor(amount : Nat, amountPaid : Nat, dueDate : Text, asOfDate : Text) : Types.InvoiceStatus {
    if (amountPaid >= amount) { #paid }
    else if (amountPaid > 0) { #partiallyPaid }
    else if (asOfDate > dueDate) { #overdue }
    else { #issued };
  };

  public func listInvoices(invoices : Map.Map<Principal, Map.Map<Nat, Types.Invoice>>, caller : Principal) : [Types.Invoice] {
    switch (invoices.get(caller)) {
      case (?existing) { existing.values().toArray() };
      case null { [] };
    };
  };

  public func getInvoice(invoices : Map.Map<Principal, Map.Map<Nat, Types.Invoice>>, caller : Principal, id : Nat) : ?Types.Invoice {
    switch (invoices.get(caller)) {
      case (?existing) { existing.get(id) };
      case null { null };
    };
  };

  public func createInvoice(invoices : Map.Map<Principal, Map.Map<Nat, Types.Invoice>>, nextId : { var value : Nat }, caller : Principal, input : Types.InvoiceInput) : Nat {
    let id = nextId.value;
    nextId.value := id + 1;
    let invoice : Types.Invoice = {
      id;
      invoiceNumber = input.invoiceNumber;
      buyer = input.buyer;
      linkedOrderId = input.linkedOrderId;
      amount = input.amount;
      amountPaid = 0;
      balance = input.amount;
      invoiceDate = input.invoiceDate;
      acceptanceDate = input.acceptanceDate;
      paymentTermsDays = input.paymentTermsDays;
      dueDate = input.dueDate;
      status = statusFor(input.amount, 0, input.dueDate, input.invoiceDate);
      msmedApplicable = input.msmedApplicable;
      msmedDueDate = if (input.msmedApplicable) { ?input.dueDate } else { null };
      reminderSentAt = null;
    };
    userInvoices(invoices, caller).add(id, invoice);
    id;
  };

  public func updateInvoice(invoices : Map.Map<Principal, Map.Map<Nat, Types.Invoice>>, caller : Principal, id : Nat, input : Types.InvoiceInput) : Bool {
    switch (invoices.get(caller)) {
      case (?existing) {
        switch (existing.get(id)) {
          case (?invoice) {
            let balance = if (invoice.amountPaid > input.amount) { 0 } else { Nat.sub(input.amount, invoice.amountPaid) };
            existing.add(id, {
              invoice with
              invoiceNumber = input.invoiceNumber;
              buyer = input.buyer;
              linkedOrderId = input.linkedOrderId;
              amount = input.amount;
              balance;
              invoiceDate = input.invoiceDate;
              acceptanceDate = input.acceptanceDate;
              paymentTermsDays = input.paymentTermsDays;
              dueDate = input.dueDate;
              status = statusFor(input.amount, invoice.amountPaid, input.dueDate, input.invoiceDate);
              msmedApplicable = input.msmedApplicable;
              msmedDueDate = if (input.msmedApplicable) { ?input.dueDate } else { null };
            });
            true;
          };
          case null { false };
        };
      };
      case null { false };
    };
  };

  public func deleteInvoice(invoices : Map.Map<Principal, Map.Map<Nat, Types.Invoice>>, caller : Principal, id : Nat) : Bool {
    switch (invoices.get(caller)) {
      case (?existing) { existing.remove(id); true };
      case null { false };
    };
  };

  public func listPayments(payments : Map.Map<Principal, Map.Map<Nat, Types.Payment>>, caller : Principal, invoiceId : Nat) : [Types.Payment] {
    switch (payments.get(caller)) {
      case (?existing) {
        existing.values().toArray().filter(func(payment) = payment.invoiceId == invoiceId);
      };
      case null { [] };
    };
  };

  public func recordPayment(
    invoices : Map.Map<Principal, Map.Map<Nat, Types.Invoice>>,
    payments : Map.Map<Principal, Map.Map<Nat, Types.Payment>>,
    nextId : { var value : Nat },
    caller : Principal,
    input : Types.PaymentInput,
  ) : Nat {
    let id = nextId.value;
    nextId.value := id + 1;
    let payment : Types.Payment = {
      id;
      invoiceId = input.invoiceId;
      amount = input.amount;
      paidDate = input.paidDate;
      reference = input.reference;
      method = input.method;
    };
    userPayments(payments, caller).add(id, payment);
    switch (userInvoices(invoices, caller).get(input.invoiceId)) {
      case (?invoice) {
        let amountPaid = invoice.amountPaid + input.amount;
        let balance = if (amountPaid > invoice.amount) { 0 } else { Nat.sub(invoice.amount, amountPaid) };
        userInvoices(invoices, caller).add(input.invoiceId, {
          invoice with
          amountPaid;
          balance;
          status = statusFor(invoice.amount, amountPaid, invoice.dueDate, input.paidDate);
        });
      };
      case null {};
    };
    id;
  };

  public func estimateInterest(invoices : Map.Map<Principal, Map.Map<Nat, Types.Invoice>>, caller : Principal, id : Nat, annualRatePercent : Nat, asOfDate : Text) : ?Types.InterestEstimate {
    switch (invoices.get(caller)) {
      case (?existing) {
        switch (existing.get(id)) {
          case (?invoice) {
            let daysOverdue = daysBetween(invoice.dueDate, asOfDate);
            let estimatedInterest = invoice.balance * annualRatePercent * daysOverdue / 36500;
            ?{
              invoiceId = id;
              principal = invoice.balance;
              daysOverdue;
              annualRatePercent;
              estimatedInterest;
              asOfDate;
              assumptions = "Estimate only, not a guaranteed recovery or legal advice. Simple interest = balance x annual rate x days overdue / 36500, where days overdue counts whole days from the invoice due date to the as-of date. The MSMED Act 45-day reference is a monitoring indicator, not an automatic deadline: the statutory clock starts from the agreed acceptance date when one is recorded, otherwise from the invoice date, and only when the buyer is a covered buyer and the invoice is MSME-applicable.";
            };
          };
          case null { null };
        };
      };
      case null { null };
    };
  };
};
