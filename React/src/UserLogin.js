import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UserLogin.css";
import { loginUser, passwordReset } from "./ApiService";

function UserLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginUser(formData);
      if (data.status === "success") {
        navigate("/CreateAgreement");
      } else {
        setErrorMessage("Sign in failed. Please try again.");
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!formData.email.trim()) {
      setForgotMessage(
        "Please enter your email address to reset your password."
      );
      return;
    }
    setForgotLoading(true);
    setForgotMessage("");
    try {
      await passwordReset(formData.email); // Call the backend, but ignore response details
      setForgotMessage(
        "If we have an account for that email, we've sent a password reset link. Please check your inbox and spam folder."
      );
      setForgotSuccess(true);
    } catch (error) {
      setForgotMessage(
        "An error occurred while sending the reset email. Please try again."
      );
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <form className="row g-2" onSubmit={handleSubmit}>
      <div className="form-group">
        <input
          autoComplete="off"
          type="email"
          pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$"
          className="form-control"
          id="yourEmailLogin"
          name="email"
          required
          placeholder="Email address"
          value={formData.email}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <input
          autoComplete="off"
          type="password"
          className="form-control"
          id="yourPasswordLogin"
          name="password"
          required
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />
      </div>
      <div id="error-message-one" className="error" aria-live="polite">
        {errorMessage}
      </div>

      <button type="submit" className="btn btn-secondary" id="loginBtn">
        Login
        <span
          className="spinner-border spinner-border-sm"
          role="status"
          aria-hidden="true"
          id="spinnerLogin"
          style={{ display: loading ? "inline-block" : "none" }}
        ></span>
      </button>
      <div id="liveAlertPlaceholder"></div>
      <div className="forgot-password-link">
        <a
          href="#"
          onClick={handleForgotPassword}
          className={forgotSuccess ? "disabled" : ""}
        >
          {forgotLoading
            ? "Sending..."
            : forgotSuccess
            ? "Password reset email sent"
            : "Forgot password?"}
        </a>
        {forgotLoading && (
          <span
            className="spinner-border spinner-border-sm ms-2"
            role="status"
            aria-hidden="true"
          ></span>
        )}
      </div>
      <div
        className={`forgot-message ${forgotMessage ? "show" : ""}`}
        aria-live="polite"
      >
        {forgotMessage}
      </div>
    </form>
  );
}

export default UserLogin;
