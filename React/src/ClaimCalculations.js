import React, { useState, useEffect } from "react";
import "./ClaimCalculations.css";
import LogoutComponent from "./LogoutComponent";
import { fetchClaimCalculations } from "./ApiService";

function ClaimCalculations() {
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchClaimCalculations();
        setTableData(data);
      } catch (error) {
        console.error("Error fetching table data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container text-center">
      <div className="d-flex justify-content-end mb-3">
        <LogoutComponent />
      </div>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Your monthly premium amount is USDC:</th>
            <th>Automatic payout to you is USDC:</th>
            <th>When the following parameters are met:</th>
            <th>The most recent parameter reading is:</th>
            <th>The amount paid out to you is USDC:</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, index) => (
            <tr key={index}>
              <td>{row.premium_amount}</td>
              <td>{row.payout_amount}</td>
              <td>
                {row.event_type} {row.comparison_operator} {row.threshold_value}{" "}
                {row.threshold_unit}
              </td>
              <td>{row.reading_value}</td>
              <td>{row.resolved_payout}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ClaimCalculations;
