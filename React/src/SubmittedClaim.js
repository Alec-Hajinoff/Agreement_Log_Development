import React from "react";
import blue from "./blue.svg";
import "./SubmittedClaim.css";
import UserLogin from "./UserLogin.js";
import ClaimCalculations from "./ClaimCalculations.js";

function SubmittedClaim() {
  return (
    <div className="container text-center">
      <div className="row">
        <div className="col-12">
          <p>
            Welcome to your policy summary page. Here you can view the key
            details of your active coverage, including your premium, payout
            amounts, trigger conditions, and the latest weather data readings.
            This page updates automatically as new data is received, so you can
            stay informed about the status of your policy at a glance.
          </p>
          <ClaimCalculations />
        </div>
      </div>
    </div>
  );
}

export default SubmittedClaim;
