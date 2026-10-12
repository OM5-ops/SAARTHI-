import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Types "../types/business";

module {
  public func getProfile(profiles : Map.Map<Principal, Types.BusinessProfile>, caller : Principal) : ?Types.BusinessProfile {
    profiles.get(caller);
  };

  public func saveProfile(profiles : Map.Map<Principal, Types.BusinessProfile>, caller : Principal, profile : Types.BusinessProfile) : () {
    profiles.add(caller, { profile with id = 1; updatedAt = Time.now().toNat() });
  };

  public func listStaff(staff : Map.Map<Principal, [Types.StaffRole]>, caller : Principal) : [Types.StaffRole] {
    staff.get(caller) ?? [];
  };

  public func saveStaff(staff : Map.Map<Principal, [Types.StaffRole]>, caller : Principal, roles : [Types.StaffRole]) : () {
    staff.add(caller, roles);
  };
};
