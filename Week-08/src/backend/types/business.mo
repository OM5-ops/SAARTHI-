import Common "common";

module {
  public type BusinessProfile = {
    id : Common.Id;
    companyName : Text;
    ownerName : Text;
    udyamNumber : Text;
    gstin : Text;
    pan : Text;
    category : Text;
    products : [Text];
    monthlyCapacity : Text;
    address : Text;
    contactEmail : Text;
    contactPhone : Text;
    updatedAt : Common.Timestamp;
  };

  public type StaffRole = {
    id : Common.Id;
    name : Text;
    role : Text;
    email : Text;
  };
};
