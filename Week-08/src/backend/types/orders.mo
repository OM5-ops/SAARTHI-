import Common "common";

module {
  public type OrderStatus = {
    #placed;
    #dispatched;
    #delivered;
    #accepted;
    #disputed;
  };

  public type PurchaseOrder = {
    id : Common.Id;
    orderNumber : Text;
    buyer : Text;
    description : Text;
    quantity : Nat;
    unit : Text;
    value : Common.Money;
    orderDate : Common.DateText;
    deliveryDeadline : Common.DateText;
    status : OrderStatus;
    dispatchedDate : ?Common.DateText;
    deliveredDate : ?Common.DateText;
    acceptedDate : ?Common.DateText;
    proofOfDelivery : ?Text;
    disputeReason : ?Text;
    linkedInvoiceIds : [Common.Id];
    documentIds : [Common.Id];
  };

  public type OrderInput = {
    orderNumber : Text;
    buyer : Text;
    description : Text;
    quantity : Nat;
    unit : Text;
    value : Common.Money;
    orderDate : Common.DateText;
    deliveryDeadline : Common.DateText;
    status : OrderStatus;
  };
};
