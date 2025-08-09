import React from "react";
import blue from "./blue.svg";
import "./DataSubmittedThenClaim.css";
import UserLogin from "./UserLogin.js";
import ClaimDataCapture from "./ClaimDataCapture.js";

function DataSubmittedThenClaim() {
  return (
    <div className="container text-center">
      <div className="row">
        <div className="col-12">
          <p>
            Please complete the form below to set up your policy. Select the
            type of cover you need, specify the location you wish to protect,
            and click Submit to begin. Once submitted, the system will generate
            your policy terms based on your selected parameters and prepare it
            for activation. Cover begins 30 days from the start of the policy.
          </p>
          <ClaimDataCapture />
        </div>
      </div>
    </div>
  );
}

export default DataSubmittedThenClaim;
