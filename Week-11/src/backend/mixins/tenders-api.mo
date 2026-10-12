import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Types "../types/tenders";
import TendersLib "../lib/tenders";

mixin (tenders : Map.Map<Principal, Map.Map<Nat, Types.Tender>>) {
  public query ({ caller }) func listTenders() : async [Types.Tender] {
    TendersLib.listTenders(tenders, caller);
  };

  public query ({ caller }) func getTender(id : Nat) : async ?Types.Tender {
    TendersLib.getTender(tenders, caller, id);
  };

  public shared ({ caller }) func saveTender(tender : Types.Tender) : async () {
    TendersLib.saveTender(tenders, caller, tender);
  };

  public shared ({ caller }) func setTenderSaved(id : Nat, saved : Bool) : async Bool {
    TendersLib.setSaved(tenders, caller, id, saved);
  };
};
