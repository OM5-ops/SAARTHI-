import Common "common";

module {
  public type InvoiceStatus = {
    #draft;
    #issued;
    #partiallyPaid;
    #paid;
    #overdue;
  };

  public type Invoice = {
    id : Common.Id;
    invoiceNumber : Text;
    buyer : Text;
    linkedOrderId : ?Common.Id;
    amount : Common.Money;
    amountPaid : Common.Money;
    balance : Common.Money;
    invoiceDate : Common.DateText;
    acceptanceDate : ?Common.DateText;
    paymentTermsDays : Nat;
    dueDate : Common.DateText;
    status : InvoiceStatus;
    msmedApplicable : Bool;
    msmedDueDate : ?Common.DateText;
    reminderSentAt : ?Common.Timestamp;
  };

  public type InvoiceInput = {
    invoiceNumber : Text;
    buyer : Text;
    linkedOrderId : ?Common.Id;
    amount : Common.Money;
    invoiceDate : Common.DateText;
    acceptanceDate : ?Common.DateText;
    paymentTermsDays : Nat;
    dueDate : Common.DateText;
    msmedApplicable : Bool;
  };

  public type Payment = {
    id : Common.Id;
    invoiceId : Common.Id;
    amount : Common.Money;
    paidDate : Common.DateText;
    reference : Text;
    method : Text;
  };

  public type PaymentInput = {
    invoiceId : Common.Id;
    amount : Common.Money;
    paidDate : Common.DateText;
    reference : Text;
    method : Text;
  };

  public type InterestEstimate = {
    invoiceId : Common.Id;
    principal : Common.Money;
    daysOverdue : Nat;
    annualRatePercent : Common.Percentage;
    estimatedInterest : Common.Money;
    asOfDate : Common.DateText;
    assumptions : Text;
  };
};
