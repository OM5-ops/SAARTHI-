import Common "common";

module {
  public type DocumentCategory = {
    #invoice;
    #purchaseOrder;
    #deliveryChallan;
    #acceptanceRecord;
    #correspondence;
    #other;
  };

  public type Document = {
    id : Common.Id;
    name : Text;
    category : DocumentCategory;
    mimeType : Text;
    sizeBytes : Nat;
    uploadedAt : Common.Timestamp;
    linkedInvoiceId : ?Common.Id;
    linkedOrderId : ?Common.Id;
    notes : Text;
  };

  public type DocumentInput = {
    name : Text;
    category : DocumentCategory;
    mimeType : Text;
    sizeBytes : Nat;
    linkedInvoiceId : ?Common.Id;
    linkedOrderId : ?Common.Id;
    notes : Text;
  };

  public type EscalationStep = {
    id : Common.Id;
    text : Text;
    dueDate : Common.DateText;
    completed : Bool;
    description : Text;
  };

  public type EvidenceChecklist = {
    documentId : Common.Id;
    requiredItems : [Text];
    presentItems : [Text];
    complete : Bool;
  };
};
