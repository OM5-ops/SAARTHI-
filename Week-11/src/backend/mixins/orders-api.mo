import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Types "../types/orders";
import OrdersLib "../lib/orders";

mixin (
  orders : Map.Map<Principal, Map.Map<Nat, Types.PurchaseOrder>>,
  nextOrderId : { var value : Nat },
) {
  public query ({ caller }) func listOrders() : async [Types.PurchaseOrder] {
    OrdersLib.listOrders(orders, caller);
  };

  public query ({ caller }) func getOrder(id : Nat) : async ?Types.PurchaseOrder {
    OrdersLib.getOrder(orders, caller, id);
  };

  public shared ({ caller }) func createOrder(input : Types.OrderInput) : async Nat {
    OrdersLib.createOrder(orders, nextOrderId, caller, input);
  };

  public shared ({ caller }) func updateOrder(id : Nat, input : Types.OrderInput) : async Bool {
    OrdersLib.updateOrder(orders, caller, id, input);
  };

  public shared ({ caller }) func deleteOrder(id : Nat) : async Bool {
    OrdersLib.deleteOrder(orders, caller, id);
  };

  public shared ({ caller }) func setOrderStatus(id : Nat, status : Types.OrderStatus) : async Bool {
    OrdersLib.setOrderStatus(orders, caller, id, status);
  };
};
