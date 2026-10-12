import Common "common";

module {
  public type TenderStatus = {
    #open;
    #closingSoon;
    #closed;
    #awarded;
  };

  public type Tender = {
    id : Common.Id;
    title : Text;
    buyer : Text;
    referenceNumber : Text;
    estimatedValue : Common.Money;
    emdAmount : Common.Money;
    publishedDate : Common.DateText;
    submissionDeadline : Common.DateText;
    eligibility : Text;
    msmeEligible : Bool;
    status : TenderStatus;
    saved : Bool;
    applicationStage : Text;
  };
};
