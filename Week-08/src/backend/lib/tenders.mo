import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Types "../types/tenders";

module {
  public func listTenders(tenders : Map.Map<Principal, Map.Map<Nat, Types.Tender>>, caller : Principal) : [Types.Tender] {
    switch (tenders.get(caller)) {
      case (?userTenders) { userTenders.values().toArray() };
      case null { [] };
    };
  };

  public func getTender(tenders : Map.Map<Principal, Map.Map<Nat, Types.Tender>>, caller : Principal, id : Nat) : ?Types.Tender {
    switch (tenders.get(caller)) {
      case (?userTenders) { userTenders.get(id) };
      case null { null };
    };
  };

  public func saveTender(tenders : Map.Map<Principal, Map.Map<Nat, Types.Tender>>, caller : Principal, tender : Types.Tender) : () {
    let userTenders = switch (tenders.get(caller)) {
      case (?existing) { existing };
      case null {
        let fresh = Map.empty<Nat, Types.Tender>();
        tenders.add(caller, fresh);
        fresh;
      };
    };
    userTenders.add(tender.id, tender);
  };

  public func setSaved(tenders : Map.Map<Principal, Map.Map<Nat, Types.Tender>>, caller : Principal, id : Nat, saved : Bool) : Bool {
    switch (tenders.get(caller)) {
      case (?userTenders) {
        switch (userTenders.get(id)) {
          case (?tender) {
            userTenders.add(id, { tender with saved });
            true;
          };
          case null { false };
        };
      };
      case null { false };
    };
  };
};
