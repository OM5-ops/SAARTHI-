import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Types "../types/reports";
import OrderTypes "../types/orders";
import InvoiceTypes "../types/invoices";
import TenderTypes "../types/tenders";
import ReportsLib "../lib/reports";

mixin (
  orders : Map.Map<Principal, Map.Map<Nat, OrderTypes.PurchaseOrder>>,
  invoices : Map.Map<Principal, Map.Map<Nat, InvoiceTypes.Invoice>>,
  payments : Map.Map<Principal, Map.Map<Nat, InvoiceTypes.Payment>>,
  tenders : Map.Map<Principal, Map.Map<Nat, TenderTypes.Tender>>,
  activity : Map.Map<Principal, [Types.ActivityEntry]>,
) {
  public query ({ caller }) func getDashboardMetrics() : async Types.DashboardMetrics {
    ReportsLib.getDashboardMetrics(orders, invoices, tenders, caller);
  };

  public query ({ caller }) func getMonthlyFinancials() : async [Types.MonthlyFinancial] {
    ReportsLib.getMonthlyFinancials(invoices, payments, caller);
  };

  public query ({ caller }) func getBuyerDelayReport() : async [Types.BuyerDelayReport] {
    ReportsLib.getBuyerDelayReport(invoices, caller);
  };

  public query ({ caller }) func getWorkingCapitalEstimate(enteredExpenses : Nat) : async Types.WorkingCapitalEstimate {
    ReportsLib.getWorkingCapitalEstimate(invoices, enteredExpenses, caller);
  };

  public query ({ caller }) func listActivity() : async [Types.ActivityEntry] {
    ReportsLib.listActivity(activity, caller);
  };
};
