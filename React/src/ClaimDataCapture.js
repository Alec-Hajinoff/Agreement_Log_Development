import React, { useState } from "react";
import "./ClaimDataCapture.css";
import { createPolicy, fetchPremiumPayout } from "./ApiService";

function ClaimDataCapture() {
  const [agreementHash, setAgreementHash] = useState("");
  const [agreementText, setAgreementText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [signed, setSigned] = useState(false);
  
  const handleHashChange = async (e) => {
    const hash = e.target.value;
    setAgreementHash(hash);
    
    if (hash.length > 0) {
      try {
        const data = await fetchPremiumPayout(hash); // Checking the hash as the user types
        if (data.status === "success") {
          setAgreementText(data.agreementText);
          setErrorMessage("");
        } else {
          setAgreementText("");
          setErrorMessage("Incorrect hash, please ask the agreement owner for the correct hash");
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
      const data = await createPolicy(agreementHash); // Sends to the backend boolean true once the agreement is counter signed
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
                  placeholder="Enter agreement hash"
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
              disabled={!agreementText || signed}
            >
              Start policy
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

export default ClaimDataCapture;
