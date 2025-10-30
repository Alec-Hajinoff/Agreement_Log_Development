// This is the file that allows a counter party to view and to counter sign the agreement.

import React, { useState, useEffect } from "react";
import "./CounterSignature.css";
import { counterSigned, agreementHashFunction } from "./ApiService";
import { useParams } from "react-router-dom";

function CounterSignature() {
  const [agreementHash, setAgreementHash] = useState("");
  const [agreementText, setAgreementText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [signed, setSigned] = useState(false);
  const [userName, setUserName] = useState("");
  const { hash } = useParams(); // from /CounterSignature/:hash

  useEffect(() => {
    const fetchAgreement = async () => {
      if (hash) {
        try {
          const data = await agreementHashFunction(hash); // agreementHashFunction() fetches the agreement text from the backend using the hash extracted from the URL. This allows the countersigner to view the agreement immediately upon visiting the link.
          if (data.status === "success") {
            setAgreementText(data.agreementText);
            setAgreementHash(hash); // Still needed for the countersign.
            setErrorMessage("");
          } else {
            setAgreementText("");
            setErrorMessage("Agreement not found. Please check the link.");
          }
        } catch (error) {
          setAgreementText("");
          setErrorMessage("Error loading agreement.");
        }
      }
    };
    fetchAgreement();
  }, [hash]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await counterSigned(agreementHash, userName); // The user clicks Countersign and this function sends to the backend a boolean true - the agreement is counter signed.
      if (data.success) {
        setSigned(true);
        // After a successful countersign response from the backend:
        const { downloadData } = data;

        // Convert the payload into a readable plain-text format
        const fileContent = JSON.stringify(downloadData, null, 2);
        const blob = new Blob([fileContent], { type: "text/plain" });
        const url = URL.createObjectURL(blob);

        // Auto-trigger file download
        const link = document.createElement("a");
        link.href = url;
        link.download = `countersigned-agreement-${downloadData.agreementHash}.txt`;
        document.body.appendChild(link);
        link.click();

        // Clean up temporary resources
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

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
        <div className="form-group row mb-3">
          <label className="col-sm-12">
            Step 1: This agreement was loaded automatically from the link you
            received. Please review the text below.
          </label>
        </div>

        {agreementText && (
          <div className="row justify-content-center mb-4">
            <div className="col-md-8">
              <div className="card">
                <div className="card-body">
                  <label className="card-title">Agreement Text:</label>
                  <p className="card-text">{agreementText}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="form-group row mb-3">
          <label className="col-sm-4 col-form-label text-end">
            Step 2: If you agree, enter your full name and click Countersign. A
            text file copy will then be downloaded to your computer.
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
            {loading && (
              <div className="text-info mb-2">
                Saving your agreement to the blockchain, please wait…
              </div>
            )}
            {signed && (
              <div className="text-success mb-2">
                Thank you, the agreement has been counter-signed!
              </div>
            )}
            <button
              type="submit"
              className="btn btn-secondary"
              id="loginBtnOne"
              disabled={!agreementText || signed || loading || !userName.trim()}
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
