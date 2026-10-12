import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Types "../types/orders";

module {
  func userOrders(orders : Map.Map<Principal, Map.Map<Nat, Types.PurchaseOrder>>, caller : Principal) : Map.Map<Nat, Types.PurchaseOrder> {
    switch (orders.get(caller)) {
      case (?existing) { existing };
      case null {
        let fresh = Map.empty<Nat, Types.PurchaseOrder>();
        orders.add(caller, fresh);
        fresh;
      };
    };
  };

  public func listOrders(orders : Map.Map<Principal, Map.Map<Nat, Types.PurchaseOrder>>, caller : Principal) : [Types.PurchaseOrder] {
    switch (orders.get(caller)) {
      case (?existing) { existing.values().toArray() };
      case null { [] };
    };
  };

  public func getOrder(orders : Map.Map<Principal, Map.Map<Nat, Types.PurchaseOrder>>, caller : Principal, id : Nat) : ?Types.PurchaseOrder {
    switch (orders.get(caller)) {
      case (?existing) { existing.get(id) };
      case null { null };
    };
  };

  public func createOrder(orders : Map.Map<Principal, Map.Map<Nat, Types.PurchaseOrder>>, nextId : { var value : Nat }, caller : Principal, input : Types.OrderInput) : Nat {
    let id = nextId.value;
    nextId.value := id + 1;
    let order : Types.PurchaseOrder = {
      id;
      orderNumber = input.orderNumber;
      buyer = input.buyer;
      description = input.description;
      quantity = input.quantity;
      unit = input.unit;
      value = input.value;
      orderDate = input.orderDate;
      deliveryDeadline = input.deliveryDeadline;
      status = input.status;
      dispatchedDate = null;
      deliveredDate = null;
      acceptedDate = null;
      proofOfDelivery = null;
      disputeReason = null;
      linkedInvoiceIds = [];
      documentIds = [];
    };
    userOrders(orders, caller).add(id, order);
    id;
  };

  public func updateOrder(orders : Map.Map<Principal, Map.Map<Nat, Types.PurchaseOrder>>, caller : Principal, id : Nat, input : Types.OrderInput) : Bool {
    switch (orders.get(caller)) {
      case (?existing) {
        switch (existing.get(id)) {
          case (?order) {
            existing.add(id, {
              order with
              orderNumber = input.orderNumber;
              buyer = input.buyer;
              description = input.description;
              quantity = input.quantity;
              unit = input.unit;
              value = input.value;
              orderDate = input.orderDate;
              deliveryDeadline = input.deliveryDeadline;
              status = input.status;
            });
            true;
          };
          case null { false };
        };
      };
      case null { false };
    };
  };

  public func deleteOrder(orders : Map.Map<Principal, Map.Map<Nat, Types.PurchaseOrder>>, caller : Principal, id : Nat) : Bool {
    switch (orders.get(caller)) {
      case (?existing) { existing.remove(id); true };
      case null { false };
    };
  };

  public func setOrderStatus(orders : Map.Map<Principal, Map.Map<Nat, Types.PurchaseOrder>>, caller : Principal, id : Nat, status : Types.OrderStatus) : Bool {
    switch (orders.get(caller)) {
      case (?existing) {
        switch (existing.get(id)) {
          case (?order) {
            existing.add(id, { order with status });
            true;
          };
          case null { false };
        };
      };
      case null { false };
    };
  };
};
