import React from "react";
import blue from "./blue.svg";
import "./MainRegLog.css";
import Main from "./Main.js";
import UserRegistration from "./UserRegistration.js";
import UserLogin from "./UserLogin.js";

function MainRegLog() {
  return (
    <div className="container text-center">
      <div className="row">
        <div className="col-12 col-md-8">
          <Main />
        </div>
        <div className="col-12 col-md-4">
          <p className="footer">New user? Please register:</p>
          <UserRegistration />
          <p className="footer">Existing user? Please login:</p>
          <UserLogin />
        </div>
      </div>
    </div>
  );
}

export default MainRegLog;
