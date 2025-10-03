import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./PasswordReset.css";
import { updatePassword } from "./ApiService";

function PasswordReset() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // Extract token from URL query parameter

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if token is present on component mount
  useEffect(() => {
    if (!token) {
      setErrorMessage("Invalid reset link.");
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    setErrorMessage(""); // Clear any previous error

    try {
      const data = await updatePassword(token, formData.newPassword);

      if (data.success) {
        // On success, navigate to home page
        navigate("/MainRegLog");
      } else {
        setErrorMessage(
          data.message || "Failed to reset password. Please try again."
        );
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="password-reset-container">
      {" "}
      <h2>Reset Your Password</h2>
      <form className="row g-2" onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="password"
            className="form-control"
            name="newPassword"
            required
            placeholder="New Password"
            value={formData.newPassword}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            className="form-control"
            name="confirmPassword"
            required
            placeholder="Re-enter New Password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </div>
        <div id="error-message-one" className="error" aria-live="polite">
          {errorMessage}
        </div>

        <button
          type="submit"
          className="btn btn-secondary"
          disabled={loading || !token} // Disable if loading or no token
        >
          {loading ? "Resetting..." : "Reset Password"}
          {loading && (
            <span
              className="spinner-border spinner-border-sm ms-2"
              role="status"
              aria-hidden="true"
            ></span>
          )}
        </button>
      </form>
    </div>
  );
}

export default PasswordReset;
