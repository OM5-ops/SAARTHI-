import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Types "../types/business";
import BusinessLib "../lib/business";

mixin (
  profiles : Map.Map<Principal, Types.BusinessProfile>,
  staff : Map.Map<Principal, [Types.StaffRole]>,
) {
  public query ({ caller }) func getBusinessProfile() : async ?Types.BusinessProfile {
    BusinessLib.getProfile(profiles, caller);
  };

  public shared ({ caller }) func saveBusinessProfile(profile : Types.BusinessProfile) : async () {
    BusinessLib.saveProfile(profiles, caller, profile);
  };

  public query ({ caller }) func listStaffRoles() : async [Types.StaffRole] {
    BusinessLib.listStaff(staff, caller);
  };

  public shared ({ caller }) func saveStaffRoles(roles : [Types.StaffRole]) : async () {
    BusinessLib.saveStaff(staff, caller, roles);
  };
};
