import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UserLogin.css";
import { loginUser } from "./ApiService";

function UserLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
    </form>
  );
}

export default UserLogin;