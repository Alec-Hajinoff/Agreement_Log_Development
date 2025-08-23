// This is the file that allows a counter party to view and to counter signs the agreement.

import React, { useState } from "react";
import "./CounterSignature.css";
import { counterSigned, agreementHashFunction } from "./ApiService";

function CounterSignature() {
  const [agreementHash, setAgreementHash] = useState("");
  const [agreementText, setAgreementText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [signed, setSigned] = useState(false);
  const [userName, setUserName] = useState("");

  const handleHashChange = async (e) => {
    const hash = e.target.value;
    setAgreementHash(hash);

    if (hash.length > 0) {
      try {
        const data = await agreementHashFunction(hash); // Checks the hash as the user types and when that matches displays the agreement text.
        if (data.status === "success") {
          setAgreementText(data.agreementText);
          setErrorMessage("");
        } else {
          setAgreementText("");
          setErrorMessage(
            "Incorrect hash, please ask the agreement owner for the correct hash"
          );
        }
      } catch (error) {
        setErrorMessage(error.message);
        setAgreementText("");
      }
    } else {
      setAgreementText("");
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await counterSigned(agreementHash, userName); // The user clicks 'Start Policy' and this function sends to the backend a boolean true - the agreement is counter signed.
      if (data.success) {
        setSigned(true);
        setErrorMessage("");
      } else {
        setErrorMessage(data.message || "Failed to sign agreement");
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container text-center">
      <p>To countersign an agreement, please follow the steps below.</p>
      <form onSubmit={handleSubmit}>
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="form-group row mb-3">
              <label className="col-sm-4 col-form-label text-end">
                Please enter the agreement hash:
              </label>
              <div className="col-sm-8">
                <input
                  type="text"
                  className="form-control"
                  value={agreementHash}
                  onChange={handleHashChange}
                  placeholder="Agreement hash"
                />
              </div>
            </div>
          </div>
        </div>

        {agreementText && (
          <div className="row justify-content-center mb-4">
            <div className="col-md-8">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Agreement Text</h5>
                  <p className="card-text">{agreementText}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="form-group row mb-3">
          <label className="col-sm-4 col-form-label text-end">
            Please enter your full name:
          </label>
          <div className="col-sm-8">
            <input
              type="text"
              className="form-control"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Your full name"
              required
            />
          </div>
        </div>

        <div className="d-flex justify-content-end mb-3">
          <div className="align-middle">
            <div id="error-message" className="error" aria-live="polite">
              {errorMessage}
            </div>
            {signed && (
              <div className="text-success mb-2">
                Thank you, the agreement has been counter-signed
              </div>
            )}
            <button
              type="submit"
              className="btn btn-secondary"
              id="loginBtnOne"
              disabled={!agreementText || signed || !userName.trim()}
            >
              Countersign
              <span
                role="status"
                aria-hidden="true"
                id="spinnerLogin"
                style={{ display: loading ? "inline-block" : "none" }}
              ></span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CounterSignature;
