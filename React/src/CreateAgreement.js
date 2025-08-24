// When a user pastes agreement text into the text box - this is the file that is responsible.

import React, { useState, useEffect } from "react";
import "./CreateAgreement.css";
import LogoutComponent from "./LogoutComponent";
import { createAgreementFunction, userDashboard } from "./ApiService";

function CreateAgreement() {
  const [textHash, setTextHash] = useState("");
  const [formData, setFormData] = useState({
    agreement_text: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreements, setAgreements] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await userDashboard();
        if (data.success) {
          setAgreements(data.agreements);
        }
      } catch (error) {
        setErrorMessage("Failed to load agreements");
      }
    };
    fetchDashboard();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setTextHash("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await createAgreementFunction(formData); // The API call to send the agreement text submitted by the user to the backend.
      if (data.success) {
        setTextHash(data.hash);
      } else {
        setErrorMessage("Submission failed. Please try again.");
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container text-center">
      <div>
        <p>
          Simply follow the steps below to get your contract countersigned, and
          the application will log the countersignature and timestamp on the
          blockchain as independent proof of existence and mutual acceptance.
        </p>
      </div>
      <div className="d-flex justify-content-end mb-3">
        <LogoutComponent />
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group mb-3">
          <label htmlFor="agreementText">
            Step 1: Copy the agreement from your email, paste it into the text
            box below, and click “Generate hash”.
          </label>
          <textarea
            id="agreementText"
            className="form-control"
            rows="10"
            name="agreement_text"
            value={formData.agreement_text}
            onChange={handleChange}
            required
          />
        </div>

        {/* Display hash if available */}
        {textHash && (
          <div className="alert alert-info">
            <strong>Agreement hash:</strong>
            <br />
            <code>{textHash}</code>
          </div>
        )}

        <div className="d-flex justify-content-end mb-3">
          <div id="error-message" className="error" aria-live="polite">
            {errorMessage}
          </div>
          <button type="submit" className="btn btn-secondary" id="loginBtnOne">
            Generate hash
            <span
              role="status"
              aria-hidden="true"
              id="spinnerLogin"
              style={{ display: loading ? "inline-block" : "none" }}
            ></span>
          </button>
        </div>
        <div className="form-group mb-3">
          <label>
            Step 2: Copy the agreement hash above and email it to the other
            party together with this link:{" "}
            <a
              href="http://localhost:3000/CounterSignature"
              target="_blank"
              rel="noopener noreferrer"
            >
              http://localhost:3000/CounterSignature
            </a>{" "}
            <br /> Ask them to open the link, enter the agreement hash, review
            the agreement text, and click “Countersign” if they agree. <br />{" "}
            Once they have countersigned, the agreement will appear as
            countersigned in the table below.
          </label>
        </div>
        <div className="form-group mb-3">

          <div className="mt-4">
            <label className="step-label">Agreements created but not yet countersigned</label>
            <table className="table">
              <thead>
                <tr>
                  <th>Agreement hash</th>
                </tr>
              </thead>
              <tbody>
                {agreements
                  .filter((agreement) => !agreement.counter_signed)
                  .map((agreement) => (
                    <tr key={agreement.agreement_hash}>
                      <td>{agreement.agreement_hash}</td>
                    </tr>
                  ))}
              </tbody>
            </table>

            <label className="table-label mt-4">Agreements countersigned</label>
            <table className="table">
              <thead>
                <tr>
                  <th>Countersigned by</th>
                  <th>Countersigned at</th>
                  <th>Agreement hash</th>
                </tr>
              </thead>
              <tbody>
                {agreements
                  .filter((agreement) => agreement.counter_signed)
                  .map((agreement) => (
                    <tr key={agreement.agreement_hash}>
                      <td>{agreement.countersigner_name}</td>
                      <td>{agreement.countersigned_timestamp}</td>
                      <td>{agreement.agreement_hash}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CreateAgreement;
