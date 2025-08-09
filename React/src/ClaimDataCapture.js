import React, { useState, useEffect } from "react";
import "./ClaimDataCapture.css";
import LogoutComponent from "./LogoutComponent";
import PremiumPaymentRequest from "./PremiumPaymentRequest";
import { useNavigate } from "react-router-dom";
import { createPolicy, fetchPremiumPayout } from "./ApiService";

function ClaimDataCapture() {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [payout, setPayout] = useState(null);
  const [premium, setPremium] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [temperatureThreshold, setTemperatureThreshold] = useState("40");

  useEffect(() => {
    if (selectedEvent && latitude && longitude) {
      // fetchPremiumPayout pulls premium and payout data from the database to update the interface when a user changes coordinates or selected event.
      fetchPremiumPayout(selectedEvent, latitude, longitude)
        .then((data) => {
          if (data.status === "success") {
            setPayout(data.payout);
            setPremium(data.premium);
            setErrorMessage(""); // Clears any previous error messages
          } else {
            setPayout(null); // Resets payout on error
            setPremium(null); // Resets premium on error
            setErrorMessage(
              data.message || "An error occurred while fetching data"
            );
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          setPayout(null); // Resets payout on error
          setPremium(null); // Resets premium on error
          setErrorMessage("Failed to fetch premium and payout data");
        });
    }
  }, [selectedEvent, latitude, longitude]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      //createPolicy() submits the policy data to the database and sends the user to the policy summary page.
      const data = await createPolicy({
        latitude,
        longitude,
        premium,
        payout,
        event: selectedEvent,
        temperatureThreshold:
          selectedEvent === "temperature" ? temperatureThreshold : null,
      });
      if (data.success) {
        navigate("/SubmittedClaim");
      } else {
        setErrorMessage(data.message || "Submission failed. Please try again.");
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container text-center">
      <div className="d-flex justify-content-end mb-3">
        <LogoutComponent />
      </div>
      <form onSubmit={handleSubmit}>
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="form-group row mb-3">
              <label className="col-sm-4 col-form-label text-end">
                Latitude:{" "}
                {/*Latitude and longitude are used so that anyone in the world could insure a precise location. 
                Latitude and longitude are used to calculate a premium (see database tables 'locations' and 'cover_pricing').
                Latitude and longitude are stored with each policy, see table 'policies'.*/}
              </label>
              <div className="col-sm-8">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter latitude of location you are insuring"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group row mb-3">
              <label className="col-sm-4 col-form-label text-end">
                Longitude:
              </label>
              <div className="col-sm-8">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter longitude of location you are insuring"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="col-md-8">
            <p className="mb-3">
              Select events you'd like your policy to cover:
            </p>
            <div className="d-flex justify-content-center mb-2">
              <div className="form-check mb-2" style={{ width: "400px" }}>
                <label className="form-check-label" htmlFor="wind">
                  Wind &gt; 50 km/h
                </label>
                <input
                  className="form-check-input float-end"
                  type="checkbox"
                  id="wind"
                  checked={selectedEvent === "wind"}
                  onChange={() =>
                    setSelectedEvent(selectedEvent === "wind" ? null : "wind")
                  }
                />
              </div>
            </div>
            <div className="d-flex justify-content-center mb-2">
              <div className="form-check mb-2" style={{ width: "400px" }}>
                <label className="form-check-label" htmlFor="rain">
                  Rainfall &gt; 100 mm in 24h
                </label>
                <input
                  className="form-check-input float-end"
                  type="checkbox"
                  id="rain"
                  checked={selectedEvent === "rain"}
                  onChange={() =>
                    setSelectedEvent(selectedEvent === "rain" ? null : "rain")
                  }
                />
              </div>
            </div>
            <div className="d-flex justify-content-center mb-2">
              <div className="form-check mb-2" style={{ width: "400px" }}>
                <label className="form-check-label" htmlFor="drought">
                  Drought (No rain &gt; 90 days)
                </label>
                <input
                  className="form-check-input float-end"
                  type="checkbox"
                  id="drought"
                  checked={selectedEvent === "drought"}
                  onChange={() =>
                    setSelectedEvent(
                      selectedEvent === "drought" ? null : "drought"
                    )
                  }
                />
              </div>
            </div>
            <div className="d-flex justify-content-center mb-4">
              <div className="form-check mb-2" style={{ width: "400px" }}>
                <label className="form-check-label" htmlFor="temperature">
                  Temperature &gt;
                  <select
                    value={temperatureThreshold}
                    onChange={(e) => setTemperatureThreshold(e.target.value)}
                    style={{ marginLeft: "5px", marginRight: "5px" }}
                  >
                    <option value="40">40°C</option>
                    <option value="0">0°C</option>
                  </select>
                </label>
                <input
                  className="form-check-input float-end"
                  type="checkbox"
                  id="temperature"
                  checked={selectedEvent === "temperature"}
                  onChange={() =>
                    setSelectedEvent(
                      selectedEvent === "temperature" ? null : "temperature"
                    )
                  }
                />
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="row mb-3">
              <div className="col text-center">
                <p>The payout amount for this cover will be USDC:</p>
                <p className="lead mb-0">
                  {payout !== null ? `${payout}` : "—"}
                </p>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col text-center">
                <p>The monthly premium for this cover is USDC:</p>
                <p className="lead mb-0">
                  {premium !== null ? `${premium}` : "—"}
                </p>
              </div>
            </div>
            <PremiumPaymentRequest premiumAmount={premium} /> {/*Brings up Metamask for payment & passes the premium prop. This premium prop is used to charge a user the correct premium*/}
          </div>
        </div>
        <div className="d-flex justify-content-end mb-3">
          <th scope="row" className="align-middle">
            <div id="error-message" className="error" aria-live="polite">
              {errorMessage}
            </div>
            <button
              type="submit"
              className="btn btn-secondary"
              id="loginBtnOne"
            >
              Start policy            <span
                role="status"
                aria-hidden="true"
                id="spinnerLogin"
                style={{ display: loading ? "inline-block" : "none" }}
              ></span>
            </button>
          </th>
        </div>
      </form>
    </div>
  );
}

export default ClaimDataCapture;
