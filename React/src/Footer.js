import React from "react";
import blue from "./blue.svg";
import "./Footer.css";

function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <div className="container text-center">
      <br />
      <div className="row">
        <p className="footer">
          <em>
            &copy; Copyright 2024 - {currentYear}. All rights reserved. Company
            address: 4 Bridge Gate, London, N21 2AH, United Kingdom. Email
            address:<span> </span>
            <a href="mailto:team@climatebind.com">team@climatebind.com</a>
          </em>
        </p>
      </div>
    </div>
  );
}

export default Footer;
