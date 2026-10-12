import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Types "../types/compliance";

module {
  public func getSummary(
    checklists : Map.Map<Principal, [Types.ChecklistItem]>,
    risks : Map.Map<Principal, [Types.BuyerRisk]>,
    caller : Principal,
  ) : Types.ComplianceSummary {
    let items = checklists.get(caller) ?? [];
    let buyerRisks = risks.get(caller) ?? [];
    let pending = items.filter(func(item) = not item.completed).size();
    let overdue = buyerRisks.foldLeft(0, func(acc, risk) = acc + risk.overdueInvoices);
    {
      msmeQuotaPercent = 25;
      totalTenders = 0;
      msmeEligibleTenders = 0;
      pendingChecklistItems = pending;
      overdueInvoiceCount = overdue;
      buyerRisks;
      generatedAt = Time.now().toNat();
    };
  };

  public func listChecklist(checklists : Map.Map<Principal, [Types.ChecklistItem]>, caller : Principal) : [Types.ChecklistItem] {
    checklists.get(caller) ?? [];
  };

  public func saveChecklist(checklists : Map.Map<Principal, [Types.ChecklistItem]>, caller : Principal, items : [Types.ChecklistItem]) : () {
    checklists.add(caller, items);
  };

  public func listBuyerRisks(risks : Map.Map<Principal, [Types.BuyerRisk]>, caller : Principal) : [Types.BuyerRisk] {
    risks.get(caller) ?? [];
  };
};
