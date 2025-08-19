import React from "react";
import "./AccountPage.css";
import CreateAgreement from "./CreateAgreement.js";

function AccountPage() {
  return (
    <div className="container text-center">
      <div className="row">
        <div className="col-12">
          <p>
            Thank you for logging in and welcome to your account page! Please
            fill in the form below to start your insurance policy. You can save
            your progress and fill in the form in several sittings.
          </p>
          <CreateAgreement />
        </div>
      </div>
    </div>
  );
}

export default AccountPage;


