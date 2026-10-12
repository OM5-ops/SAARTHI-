import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Types "../types/documents";
import DocumentsLib "../lib/documents";

mixin (
  documents : Map.Map<Principal, Map.Map<Nat, Types.Document>>,
  escalations : Map.Map<Principal, [Types.EscalationStep]>,
  nextDocumentId : { var value : Nat },
) {
  public query ({ caller }) func listDocuments() : async [Types.Document] {
    DocumentsLib.listDocuments(documents, caller);
  };

  public query ({ caller }) func getDocument(id : Nat) : async ?Types.Document {
    DocumentsLib.getDocument(documents, caller, id);
  };

  public shared ({ caller }) func createDocument(input : Types.DocumentInput) : async Nat {
    DocumentsLib.createDocument(documents, nextDocumentId, caller, input);
  };

  public shared ({ caller }) func deleteDocument(id : Nat) : async Bool {
    DocumentsLib.deleteDocument(documents, caller, id);
  };

  public query ({ caller }) func listEscalationSteps() : async [Types.EscalationStep] {
    DocumentsLib.listEscalations(escalations, caller);
  };

  public query ({ caller }) func getEvidenceChecklist(documentId : Nat) : async ?Types.EvidenceChecklist {
    DocumentsLib.getEvidenceChecklist(documents, caller, documentId);
  };
};
