// When a user pastes agreement text into the text box - this is the file that is responsible.

import React, { useState } from "react";
import "./CreateAgreement.css";
import LogoutComponent from "./LogoutComponent";
import { createAgreementFunction } from "./ApiService";

function CreateAgreement() {
  const [textHash, setTextHash] = useState("");
  const [formData, setFormData] = useState({
    agreement_text: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
      </form>
    </div>
  );
}

export default CreateAgreement;

/*
// When a user pastes agreement text into the text box - this is the file that is responsible.

import React, { useState } from "react";
import "./CreateAgreement.css";
import LogoutComponent from "./LogoutComponent";
import { createAgreementFunction } from "./ApiService";

function CreateAgreement() {
  const [textHash, setTextHash] = useState("");
  const [formData, setFormData] = useState({
    agreement_text: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
          To comply with regulatory standards and ensure secure payouts, we
          require some basic information during registration to help us verify
          your identity and meet Know Your Customer (KYC) requirements. This
          protects against fraud, enables responsible use of the service, and
          ensures that any payouts reach the correct recipient. All information
          is handled securely and in accordance with applicable data protection
          laws.
        </p>
      </div>
      <div className="d-flex justify-content-end mb-3">
        <LogoutComponent />
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group mb-3">
          <label htmlFor="agreementText">Agreement Text</label>
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

        // Display hash if available
        {textHash && (
          <div className="alert alert-info">
            <strong>Document Hash (SHA-256):</strong>
            <br />
            <code>{textHash}</code>
          </div>
        )}

        <div className="d-flex justify-content-end mb-3">
          <div id="error-message" className="error" aria-live="polite">
            {errorMessage}
          </div>
          <button type="submit" className="btn btn-secondary" id="loginBtnOne">
            Submit
            <span
              role="status"
              aria-hidden="true"
              id="spinnerLogin"
              style={{ display: loading ? "inline-block" : "none" }}
            ></span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateAgreement;
*/
