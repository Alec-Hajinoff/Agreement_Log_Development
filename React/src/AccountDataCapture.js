import React, { useState } from "react";
import "./AccountDataCapture.css";
import { useNavigate } from "react-router-dom";
import LogoutComponent from "./LogoutComponent";
import { captureAccountData } from "./ApiService";

function AccountDataCapture() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    last_name: "",
    date_of_birth: "",
    phone: "",
    address: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await captureAccountData(formData);
      if (data.success) {
        navigate("/DataSubmittedThenClaim");
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
        <table className="table table-bordered">
          <tbody>
            <tr>
              <th scope="row" className="col-8 align-middle">
                <label htmlFor="surname">Surname</label>
              </th>
              <td className="col-8">
                <input
                  id="surname"
                  type="text"
                  className="form-control"
                  autoComplete="off"
                  pattern="[a-zA-Z ]+"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </td>
            </tr>
            <tr>
              <th scope="row" className="align-middle">
                Date of birth
              </th>
              <td>
                <input
                  type="date"
                  className="form-control"
                  autoComplete="off"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  required
                />
              </td>
            </tr>
            <tr>
              <th scope="row" className="align-middle">
                <label htmlFor="phone">Phone number</label>
              </th>
              <td>
                <input
                  id="phone"
                  type="tel"
                  className="form-control"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </td>
            </tr>
            <tr>
              <th scope="row" className="align-middle">
                Residential Address
              </th>
              <td>
                <input
                  type="text"
                  className="form-control"
                  placeholder="(including the post code or zip code)"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </td>
            </tr>
          </tbody>
        </table>
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

export default AccountDataCapture;
