import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Types "../types/reports";
import OrderTypes "../types/orders";
import InvoiceTypes "../types/invoices";
import TenderTypes "../types/tenders";

module {
  func orderValues(orders : Map.Map<Principal, Map.Map<Nat, OrderTypes.PurchaseOrder>>, caller : Principal) : [OrderTypes.PurchaseOrder] {
    switch (orders.get(caller)) {
      case (?existing) { existing.values().toArray() };
      case null { [] };
    };
  };

  func invoiceValues(invoices : Map.Map<Principal, Map.Map<Nat, InvoiceTypes.Invoice>>, caller : Principal) : [InvoiceTypes.Invoice] {
    switch (invoices.get(caller)) {
      case (?existing) { existing.values().toArray() };
      case null { [] };
    };
  };

  func paymentValues(payments : Map.Map<Principal, Map.Map<Nat, InvoiceTypes.Payment>>, caller : Principal) : [InvoiceTypes.Payment] {
    switch (payments.get(caller)) {
      case (?existing) { existing.values().toArray() };
      case null { [] };
    };
  };

  func tenderValues(tenders : Map.Map<Principal, Map.Map<Nat, TenderTypes.Tender>>, caller : Principal) : [TenderTypes.Tender] {
    switch (tenders.get(caller)) {
      case (?existing) { existing.values().toArray() };
      case null { [] };
    };
  };

  func daysBetween(from : Text, to : Text) : Nat {
    let a = from.toInt() ?? 0;
    let b = to.toInt() ?? 0;
    if (b > a) { (b - a).toNat() } else { 0 };
  };

  func monthOf(date : Text) : Text {
    let parts = date.split(#text "-").toArray();
    if (parts.size() >= 2) { parts[0] # "-" # parts[1] } else { date };
  };

  public func getDashboardMetrics(
    orders : Map.Map<Principal, Map.Map<Nat, OrderTypes.PurchaseOrder>>,
    invoices : Map.Map<Principal, Map.Map<Nat, InvoiceTypes.Invoice>>,
    tenders : Map.Map<Principal, Map.Map<Nat, TenderTypes.Tender>>,
    caller : Principal,
  ) : Types.DashboardMetrics {
    let userOrders = orderValues(orders, caller);
    let userInvoices = invoiceValues(invoices, caller);
    let userTenders = tenderValues(tenders, caller);
    let outstanding = userInvoices.foldLeft(0, func(acc, invoice) = acc + invoice.balance);
    let overdue = userInvoices.filter(func(invoice) = invoice.status == #overdue).size();
    let upcoming = userTenders.filter(func(tender) = tender.status == #closingSoon).size();
    let pending = userOrders.filter(func(order) = order.status == #placed or order.status == #dispatched).size();
    {
      totalOrders = userOrders.size();
      activeTenders = userTenders.filter(func(tender) = tender.status == #open or tender.status == #closingSoon).size();
      outstandingPayments = outstanding;
      overdueInvoices = overdue;
      upcomingDeadlines = upcoming;
      pendingDeliveries = pending;
      generatedAt = Time.now().toNat();
    };
  };

  public func getMonthlyFinancials(
    invoices : Map.Map<Principal, Map.Map<Nat, InvoiceTypes.Invoice>>,
    payments : Map.Map<Principal, Map.Map<Nat, InvoiceTypes.Payment>>,
    caller : Principal,
  ) : [Types.MonthlyFinancial] {
    let userInvoices = invoiceValues(invoices, caller);
    let userPayments = paymentValues(payments, caller);
    let months = userInvoices.map(func(invoice) = monthOf(invoice.invoiceDate));
    let unique = months.foldLeft([] : [Text], func(acc, month) {
      if (acc.contains(month)) { acc } else { acc.concat([month]) };
    });
    let sorted = unique.sort();
    sorted.map(func(month) {
      let invoiced = userInvoices.filter(func(invoice) = monthOf(invoice.invoiceDate) == month).foldLeft(0, func(acc, invoice) = acc + invoice.amount);
      let received = userPayments.filter(func(payment) = monthOf(payment.paidDate) == month).foldLeft(0, func(acc, payment) = acc + payment.amount);
      let outstanding = userInvoices.filter(func(invoice) = monthOf(invoice.invoiceDate) == month).foldLeft(0, func(acc, invoice) = acc + invoice.balance);
      { month; invoiced; received; outstanding };
    });
  };

  public func getBuyerDelayReport(
    invoices : Map.Map<Principal, Map.Map<Nat, InvoiceTypes.Invoice>>,
    caller : Principal,
  ) : [Types.BuyerDelayReport] {
    let userInvoices = invoiceValues(invoices, caller);
    let buyers = userInvoices.map(func(invoice) = invoice.buyer);
    let unique = buyers.foldLeft([] : [Text], func(acc, buyer) {
      if (acc.contains(buyer)) { acc } else { acc.concat([buyer]) };
    });
    unique.map(func(buyer) {
      let buyerInvoices = userInvoices.filter(func(invoice) = invoice.buyer == buyer);
      let outstanding = buyerInvoices.foldLeft(0, func(acc, invoice) = acc + invoice.balance);
      let delays = buyerInvoices.map(func(invoice) = daysBetween(invoice.dueDate, invoice.invoiceDate));
      let average = if (delays.size() == 0) { 0 } else { delays.foldLeft(0, func(acc, d) = acc + d) / delays.size() };
      let oldest = buyerInvoices.foldLeft("9999-12-31", func(acc, invoice) {
        if (invoice.dueDate < acc) { invoice.dueDate } else { acc };
      });
      { buyer; invoiceCount = buyerInvoices.size(); totalOutstanding = outstanding; averageDelayDays = average; oldestDueDate = oldest };
    });
  };

  public func getWorkingCapitalEstimate(
    invoices : Map.Map<Principal, Map.Map<Nat, InvoiceTypes.Invoice>>,
    enteredExpenses : Nat,
    caller : Principal,
  ) : Types.WorkingCapitalEstimate {
    let userInvoices = invoiceValues(invoices, caller);
    let unpaid = userInvoices.foldLeft(0, func(acc, invoice) = acc + invoice.balance);
    {
      unpaidInvoiceTotal = unpaid;
      enteredExpenses;
      estimatedGap = unpaid + enteredExpenses;
      assumptions = "Estimate only, not a live financing integration or a loan approval. The estimated gap is the total unpaid invoice balance plus the expenses you entered; it does not model credit limits, eligibility, or lender decisions.";
      generatedAt = Time.now().toNat();
    };
  };

  public func listActivity(activity : Map.Map<Principal, [Types.ActivityEntry]>, caller : Principal) : [Types.ActivityEntry] {
    activity.get(caller) ?? [];
  };
};
