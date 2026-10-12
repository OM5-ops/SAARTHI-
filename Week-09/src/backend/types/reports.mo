import Common "common";

module {
  public type DashboardMetrics = {
    totalOrders : Nat;
    activeTenders : Nat;
    outstandingPayments : Common.Money;
    overdueInvoices : Nat;
    upcomingDeadlines : Nat;
    pendingDeliveries : Nat;
    generatedAt : Common.Timestamp;
  };

  public type MonthlyFinancial = {
    month : Text; // "YYYY-MM"
    invoiced : Common.Money;
    received : Common.Money;
    outstanding : Common.Money;
  };

  public type BuyerDelayReport = {
    buyer : Text;
    invoiceCount : Nat;
    totalOutstanding : Common.Money;
    averageDelayDays : Nat;
    oldestDueDate : Common.DateText;
  };

  public type WorkingCapitalEstimate = {
    unpaidInvoiceTotal : Common.Money;
    enteredExpenses : Common.Money;
    estimatedGap : Common.Money;
    assumptions : Text;
    generatedAt : Common.Timestamp;
  };

  public type ActivityEntry = {
    id : Common.Id;
    timestamp : Common.Timestamp;
    kind : Text;
    message : Text;
  };
};
