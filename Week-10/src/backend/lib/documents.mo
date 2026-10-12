import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Types "../types/documents";

module {
  func userDocuments(documents : Map.Map<Principal, Map.Map<Nat, Types.Document>>, caller : Principal) : Map.Map<Nat, Types.Document> {
    switch (documents.get(caller)) {
      case (?existing) { existing };
      case null {
        let fresh = Map.empty<Nat, Types.Document>();
        documents.add(caller, fresh);
        fresh;
      };
    };
  };

  public func listDocuments(documents : Map.Map<Principal, Map.Map<Nat, Types.Document>>, caller : Principal) : [Types.Document] {
    switch (documents.get(caller)) {
      case (?existing) { existing.values().toArray() };
      case null { [] };
    };
  };

  public func getDocument(documents : Map.Map<Principal, Map.Map<Nat, Types.Document>>, caller : Principal, id : Nat) : ?Types.Document {
    switch (documents.get(caller)) {
      case (?existing) { existing.get(id) };
      case null { null };
    };
  };

  public func createDocument(documents : Map.Map<Principal, Map.Map<Nat, Types.Document>>, nextId : { var value : Nat }, caller : Principal, input : Types.DocumentInput) : Nat {
    let id = nextId.value;
    nextId.value := id + 1;
    let document : Types.Document = {
      id;
      name = input.name;
      category = input.category;
      mimeType = input.mimeType;
      sizeBytes = input.sizeBytes;
      uploadedAt = Time.now().toNat();
      linkedInvoiceId = input.linkedInvoiceId;
      linkedOrderId = input.linkedOrderId;
      notes = input.notes;
    };
    userDocuments(documents, caller).add(id, document);
    id;
  };

  public func deleteDocument(documents : Map.Map<Principal, Map.Map<Nat, Types.Document>>, caller : Principal, id : Nat) : Bool {
    switch (documents.get(caller)) {
      case (?existing) { existing.remove(id); true };
      case null { false };
    };
  };

  public func listEscalations(escalations : Map.Map<Principal, [Types.EscalationStep]>, caller : Principal) : [Types.EscalationStep] {
    escalations.get(caller) ?? [];
  };

  public func getEvidenceChecklist(documents : Map.Map<Principal, Map.Map<Nat, Types.Document>>, caller : Principal, documentId : Nat) : ?Types.EvidenceChecklist {
    switch (documents.get(caller)) {
      case (?existing) {
        switch (existing.get(documentId)) {
          case (?document) {
            let required = ["Invoice copy", "Purchase order", "Delivery challan", "Acceptance record"];
            let present = switch (document.category) {
              case (#invoice) { ["Invoice copy"] };
              case (#purchaseOrder) { ["Purchase order"] };
              case (#deliveryChallan) { ["Delivery challan"] };
              case (#acceptanceRecord) { ["Acceptance record"] };
              case (#correspondence) { ["Correspondence"] };
              case (#other) { [] };
            };
            ?{
              documentId;
              requiredItems = required;
              presentItems = present;
              complete = present.size() >= required.size();
            };
          };
          case null { null };
        };
      };
      case null { null };
    };
  };
};
