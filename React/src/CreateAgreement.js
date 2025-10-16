// When a user pastes an agreement text into the text box - this is the file that is responsible. This is a user dashboard essentially.

import React, { useState, useEffect } from "react";
import "./CreateAgreement.css";
import LogoutComponent from "./LogoutComponent";
import {
  agreementHashUserDashboard,
  deleteAgreementFunction,
  createAgreementFunction,
  userDashboard
} from "./ApiService";

function CreateAgreement() {
  const [textHash, setTextHash] = useState("");
  const [formData, setFormData] = useState({
    agreement_text: "",
    category: "",
    needs_signature: 0,
    agreement_tag: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreements, setAgreements] = useState([]);
  const [activeTab, setActiveTab] = useState("Clients");
  const [activeTabTwo, setActiveTabTwo] = useState("Clients");
  const [agreementHash, setAgreementHash] = useState("");
  const [agreementText, setAgreementText] = useState("");
  const [deletingHash, setDeletingHash] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  const handleHashChange = async (e) => {
    const hash = e.target.value;
    setAgreementHash(hash);

    if (hash.length > 0) {
      try {
        const data = await agreementHashUserDashboard(hash); // Checks the hash as the user inserts and when that matches displays the agreement text.
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

  const filteredCountersignedAgreements = agreements
    .filter(
      (agreement) => agreement.counter_signed && agreement.needs_signature
    )
    .filter((agreement) => agreement.category === activeTab);

  const filteredNonsignedAgreements = agreements
    .filter(
      (agreement) => !agreement.counter_signed && !agreement.needs_signature
    )
    .filter((agreement) => agreement.category === activeTabTwo);

  const handleDeleteClick = (hash) => {
    setDeletingHash(hash);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const data = await deleteAgreementFunction(deletingHash);
      if (data.success) {
        // Remove the deleted agreement from the state
        setAgreements((prevAgreements) =>
          prevAgreements.filter(
            (agreement) => agreement.agreement_hash !== deletingHash
          )
        );
        setErrorMessage("");
      } else {
        setErrorMessage("Failed to delete agreement. Please try again.");
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setShowDeleteModal(false);
      setDeletingHash(null);
    }
  };

  return (
    <div className="container text-center">
      <div>
        <p>
          Whether your agreement needs a countersignature or not, the system
          securely logs it. Countersigned agreements are anchored on the
          blockchain, and agreements that don’t need a signature appear in their
          own dashboard view.
        </p>
      </div>
      <div className="d-flex justify-content-end mb-3">
        <LogoutComponent />
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group mb-3">
          <label htmlFor="agreementCategory">
            Step 1: Select the category your agreement relates to from the
            dropdown menu below:
          </label>
          <select
            required
            id="agreementCategory"
            className="form-control"
            name="category"
            value={formData.category || ""}
            onChange={handleChange}
          >
            <option value="" disabled>
              Select a category
            </option>
            <option value="Clients">Clients</option>
            <option value="Suppliers">Suppliers</option>
            <option value="Operations">Operations</option>
            <option value="HR">HR</option>
            <option value="Marketing">Marketing</option>
            <option value="Finance">Finance</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group mb-3">
          <label htmlFor="agreementText">
            Step 2: Copy the agreement from your email or file, paste it into
            the text box below, choose if your agreement needs a counter
            signature, then click “Generate hash”.
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

        <div className="form-group mb-3">
          <label>
            Some agreements need a countersignature — like those with clients or
            external partners. Others may not — like internal commitments
            between colleagues. Does your agreement need to be confirmed by the
            other party?
          </label>
          <div className="form-check form-check-inline">
            <input
              type="radio"
              className="form-check-input"
              id="needsSignatureYes"
              name="needs_signature"
              value={1}
              required
              checked={formData.needs_signature === 1}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  needs_signature: parseInt(e.target.value),
                });
                setTextHash("");
              }}
            />
            <label className="form-check-label" htmlFor="needsSignatureYes">
              Yes
            </label>
          </div>
          <div className="form-check form-check-inline">
            <input
              type="radio"
              className="form-check-input"
              id="needsSignatureNo"
              name="needs_signature"
              value={0}
              required
              checked={formData.needs_signature === 0}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  needs_signature: parseInt(e.target.value),
                });
                setTextHash("");
              }}
            />
            <label className="form-check-label" htmlFor="needsSignatureNo">
              No
            </label>
          </div>
        </div>

        {formData.needs_signature === 0 && (
          <div className="form-group mb-3">
            <label htmlFor="agreementTag">
              Agreement relates to (this is how you will find it in the
              dashboard):
            </label>
            <input
              type="text"
              id="agreementTag"
              className="form-control"
              name="agreement_tag"
              value={formData.agreement_tag || ""}
              onChange={handleChange}
              required
              placeholder="e.g. Marketing agreement with Mike"
            />
          </div>
        )}

        {/* Display hash if available */}
        {textHash && (
          <div className="alert alert-info">
            <strong>
              Agreement hash. To view this agreement in your dashboard, please
              refresh the page.
            </strong>
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

        {formData.needs_signature === 1 && (
          <div className="form-group mb-3">
            <label>
              Step 3: Copy the agreement hash above and email it to the other
              party together with this link:{" "}
              <a
                href="http://localhost:3000/CounterSignature"
                target="_blank"
                rel="noopener noreferrer"
              >
                http://localhost:3000/CounterSignature
              </a>{" "}
              <br /> Ask them to open the link, enter the agreement hash, review
              the agreement text, and click "Countersign" if they agree. <br />{" "}
              Once they have countersigned, the agreement will appear as
              countersigned in the table below.
            </label>
          </div>
        )}
        <div className="form-group mb-3">
          <div className="mt-4">
            <label className="step-label">
              Agreements created but not yet countersigned
            </label>
            <table className="table">
              <thead>
                <tr>
                  <th>Agreement hash</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {agreements
                  .filter(
                    (agreement) =>
                      !agreement.counter_signed && agreement.needs_signature
                  )
                  .map((agreement) => (
                    <tr key={agreement.agreement_hash}>
                      <td>{agreement.agreement_hash}</td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() =>
                            handleDeleteClick(agreement.agreement_hash)
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            <label className="table-label mt-4">Agreements countersigned</label>
            {/* Tabs for filtering countersigned agreements */}
            <div className="tabs-container mb-3">
              <div className="nav nav-tabs">
                {[
                  "Clients",
                  "Suppliers",
                  "Operations",
                  "HR",
                  "Marketing",
                  "Finance",
                  "Other",
                ].map((category) => (
                  <button
                    key={category}
                    className={`nav-link ${
                      activeTab === category ? "active" : ""
                    }`}
                    onClick={() => setActiveTab(category)}
                    type="button"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Countersigned by</th>
                  <th>Countersigned at</th>
                  <th>Agreement hash</th>
                </tr>
              </thead>
              <tbody>
                {filteredCountersignedAgreements.map((agreement) => (
                  <tr key={agreement.agreement_hash}>
                    <td>{agreement.countersigner_name}</td>
                    <td>{agreement.countersigned_timestamp}</td>
                    <td>{agreement.agreement_hash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <label className="table-label mt-4">
              Agreements not requiring countersignature
            </label>
            {/* Tabs for filtering agreements not needing a signature */}
            <div className="tabs-container mb-3">
              <div className="nav nav-tabs">
                {[
                  "Clients",
                  "Suppliers",
                  "Operations",
                  "HR",
                  "Marketing",
                  "Finance",
                  "Other",
                ].map((category) => (
                  <button
                    key={category}
                    className={`nav-link ${
                      activeTabTwo === category ? "active" : ""
                    }`}
                    onClick={() => setActiveTabTwo(category)}
                    type="button"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Relating to</th>
                  <th>Created at</th>
                  <th>Agreement hash</th>
                </tr>
              </thead>
              <tbody>
                {filteredNonsignedAgreements.map((agreement) => (
                  <tr key={agreement.agreement_hash}>
                    <td>{agreement.agreement_tag}</td>
                    <td>{agreement.created_timestamp}</td>
                    <td>{agreement.agreement_hash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {showDeleteModal && (
              <div
                className="modal"
                style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
                onClick={() => setShowDeleteModal(false)}
              >
                <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Confirm Deletion</h5>
                      <button
                        type="button"
                        className="close"
                        onClick={() => setShowDeleteModal(false)}
                      >
                        <span>&times;</span>
                      </button>
                    </div>
                    <div className="modal-body">
                      <p>Are you sure you want to delete this agreement?</p>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowDeleteModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={confirmDelete}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
      <div className="form-group row mb-3">
        <label className="col-sm-4 col-form-label text-end">
          To view agreement text just enter the agreement hash:
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
    </div>
  );
}

export default CreateAgreement;

/*
import React, { useState, useEffect } from "react";
import "./CreateAgreement.css";
import LogoutComponent from "./LogoutComponent";
import { agreementHashUserDashboard } from "./ApiService"; // When a user enters agreement hash, this function fetches agreement text from the database.
import { createAgreementFunction, userDashboard } from "./ApiService";

function CreateAgreement() {
  const [textHash, setTextHash] = useState("");
  const [formData, setFormData] = useState({
    agreement_text: "",
    category: "",
    needs_signature: 0,
    agreement_tag: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreements, setAgreements] = useState([]);
  const [activeTab, setActiveTab] = useState("Clients");
  const [activeTabTwo, setActiveTabTwo] = useState("Clients");
  const [agreementHash, setAgreementHash] = useState("");
  const [agreementText, setAgreementText] = useState("");

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

  const handleHashChange = async (e) => {
    const hash = e.target.value;
    setAgreementHash(hash);

    if (hash.length > 0) {
      try {
        const data = await agreementHashUserDashboard(hash); // Checks the hash as the user inserts and when that matches displays the agreement text.
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

  const filteredCountersignedAgreements = agreements
    .filter(
      (agreement) => agreement.counter_signed && agreement.needs_signature
    )
    .filter((agreement) => agreement.category === activeTab);

  const filteredNonsignedAgreements = agreements
    .filter(
      (agreement) => !agreement.counter_signed && !agreement.needs_signature
    )
    .filter((agreement) => agreement.category === activeTabTwo);

  return (
    <div className="container text-center">
      <div>
        <p>
          Whether your agreement needs a countersignature or not, the system
          securely logs it. Countersigned agreements are anchored on the
          blockchain, and agreements that don’t need a signature appear in their
          own dashboard view.
        </p>
      </div>
      <div className="d-flex justify-content-end mb-3">
        <LogoutComponent />
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group mb-3">
          <label htmlFor="agreementCategory">
            Step 1: Select the category your agreement relates to from the
            dropdown menu below:
          </label>
          <select
            required
            id="agreementCategory"
            className="form-control"
            name="category"
            value={formData.category || ""}
            onChange={handleChange}
          >
            <option value="" disabled>
              Select a category
            </option>
            <option value="Clients">Clients</option>
            <option value="Suppliers">Suppliers</option>
            <option value="Operations">Operations</option>
            <option value="HR">HR</option>
            <option value="Marketing">Marketing</option>
            <option value="Finance">Finance</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group mb-3">
          <label htmlFor="agreementText">
            Step 2: Copy the agreement from your email or file, paste it into
            the text box below, choose if your agreement needs a counter
            signature, then click “Generate hash”.
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

        <div className="form-group mb-3">
          <label>
            Some agreements need a countersignature — like those with clients or
            external partners. Others may not — like internal commitments
            between colleagues. Does your agreement need to be confirmed by the
            other party?
          </label>
          <div className="form-check form-check-inline">
            <input
              type="radio"
              className="form-check-input"
              id="needsSignatureYes"
              name="needs_signature"
              value={1}
              required
              checked={formData.needs_signature === 1}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  needs_signature: parseInt(e.target.value),
                });
                setTextHash("");
              }}
            />
            <label className="form-check-label" htmlFor="needsSignatureYes">
              Yes
            </label>
          </div>
          <div className="form-check form-check-inline">
            <input
              type="radio"
              className="form-check-input"
              id="needsSignatureNo"
              name="needs_signature"
              value={0}
              required
              checked={formData.needs_signature === 0}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  needs_signature: parseInt(e.target.value),
                });
                setTextHash("");
              }}
            />
            <label className="form-check-label" htmlFor="needsSignatureNo">
              No
            </label>
          </div>
        </div>

        {formData.needs_signature === 0 && (
          <div className="form-group mb-3">
            <label htmlFor="agreementTag">
              Agreement relates to (this is how you will find it in the
              dashboard):
            </label>
            <input
              type="text"
              id="agreementTag"
              className="form-control"
              name="agreement_tag"
              value={formData.agreement_tag || ""}
              onChange={handleChange}
              required
              placeholder="e.g. Marketing agreement with Mike"
            />
          </div>
        )}

        // Display hash if available 
        {textHash && (
          <div className="alert alert-info">
            <strong>
              Agreement hash. To view this agreement in your dashboard, please
              refresh the page.
            </strong>
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

        {formData.needs_signature === 1 && (
          <div className="form-group mb-3">
            <label>
              Step 3: Copy the agreement hash above and email it to the other
              party together with this link:{" "}
              <a
                href="http://localhost:3000/CounterSignature"
                target="_blank"
                rel="noopener noreferrer"
              >
                http://localhost:3000/CounterSignature
              </a>{" "}
              <br /> Ask them to open the link, enter the agreement hash, review
              the agreement text, and click "Countersign" if they agree. <br />{" "}
              Once they have countersigned, the agreement will appear as
              countersigned in the table below.
            </label>
          </div>
        )}
        <div className="form-group mb-3">
          <div className="mt-4">
            <label className="step-label">
              Agreements created but not yet countersigned
            </label>
            <table className="table">
              <thead>
                <tr>
                  <th>Agreement hash</th>
                </tr>
              </thead>
              <tbody>
                {agreements
                  .filter(
                    (agreement) =>
                      !agreement.counter_signed && agreement.needs_signature
                  )
                  .map((agreement) => (
                    <tr key={agreement.agreement_hash}>
                      <td>{agreement.agreement_hash}</td>
                    </tr>
                  ))}
              </tbody>
            </table>

            <label className="table-label mt-4">Agreements countersigned</label>
            // Tabs for filtering countersigned agreements 
            <div className="tabs-container mb-3">
              <div className="nav nav-tabs">
                {[
                  "Clients",
                  "Suppliers",
                  "Operations",
                  "HR",
                  "Marketing",
                  "Finance",
                  "Other",
                ].map((category) => (
                  <button
                    key={category}
                    className={`nav-link ${
                      activeTab === category ? "active" : ""
                    }`}
                    onClick={() => setActiveTab(category)}
                    type="button"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Countersigned by</th>
                  <th>Countersigned at</th>
                  <th>Agreement hash</th>
                </tr>
              </thead>
              <tbody>
                {filteredCountersignedAgreements.map((agreement) => (
                  <tr key={agreement.agreement_hash}>
                    <td>{agreement.countersigner_name}</td>
                    <td>{agreement.countersigned_timestamp}</td>
                    <td>{agreement.agreement_hash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <label className="table-label mt-4">
              Agreements not requiring countersignature
            </label>
            // Tabs for filtering agreements not needing a signature 
            <div className="tabs-container mb-3">
              <div className="nav nav-tabs">
                {[
                  "Clients",
                  "Suppliers",
                  "Operations",
                  "HR",
                  "Marketing",
                  "Finance",
                  "Other",
                ].map((category) => (
                  <button
                    key={category}
                    className={`nav-link ${
                      activeTabTwo === category ? "active" : ""
                    }`}
                    onClick={() => setActiveTabTwo(category)}
                    type="button"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Relating to</th>
                  <th>Created at</th>
                  <th>Agreement hash</th>
                </tr>
              </thead>
              <tbody>
                {filteredNonsignedAgreements.map((agreement) => (
                  <tr key={agreement.agreement_hash}>
                    <td>{agreement.agreement_tag}</td>
                    <td>{agreement.created_timestamp}</td>
                    <td>{agreement.agreement_hash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </form>
      <div className="form-group row mb-3">
        <label className="col-sm-4 col-form-label text-end">
          To view agreement text just enter the agreement hash:
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
    </div>
  );
}

export default CreateAgreement;
*/
