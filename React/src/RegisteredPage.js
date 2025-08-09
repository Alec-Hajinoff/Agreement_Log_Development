import React from "react";
import blue from "./blue.svg";
import "./RegisteredPage.css";
import UserLogin from "./UserLogin.js";

function RegisteredPage() {
  return (
    <div className="container text-center">
      <div className="row">
        <div className="col-12 col-md-8">
          <p>
            Thank you for registering! Please log in using your credentials.
          </p>
        </div>
        <div className="col-12 col-md-4">
          <p className="footer">Registered user login:</p>
          <UserLogin />
        </div>
      </div>
    </div>
  );
}

export default RegisteredPage;
