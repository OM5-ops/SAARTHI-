import Common "common";

module {
  public type ChecklistItem = {
    id : Common.Id;
    text : Text;
    completed : Bool;
    category : Text;
  };

  public type BuyerRisk = {
    buyer : Text;
    riskScore : Common.Percentage;
    overdueInvoices : Nat;
    averageDelayDays : Nat;
    notes : Text;
  };

  public type ComplianceSummary = {
    msmeQuotaPercent : Common.Percentage;
    totalTenders : Nat;
    msmeEligibleTenders : Nat;
    pendingChecklistItems : Nat;
    overdueInvoiceCount : Nat;
    buyerRisks : [BuyerRisk];
    generatedAt : Common.Timestamp;
  };
};
