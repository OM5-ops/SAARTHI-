import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Types "../types/compliance";
import ComplianceLib "../lib/compliance";

mixin (
  checklists : Map.Map<Principal, [Types.ChecklistItem]>,
  risks : Map.Map<Principal, [Types.BuyerRisk]>,
) {
  public query ({ caller }) func getComplianceSummary() : async Types.ComplianceSummary {
    ComplianceLib.getSummary(checklists, risks, caller);
  };

  public query ({ caller }) func listChecklistItems() : async [Types.ChecklistItem] {
    ComplianceLib.listChecklist(checklists, caller);
  };

  public shared ({ caller }) func saveChecklistItems(items : [Types.ChecklistItem]) : async () {
    ComplianceLib.saveChecklist(checklists, caller, items);
  };

  public query ({ caller }) func listBuyerRisks() : async [Types.BuyerRisk] {
    ComplianceLib.listBuyerRisks(risks, caller);
  };
};
