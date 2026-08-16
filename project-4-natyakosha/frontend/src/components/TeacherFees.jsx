import React, { useState, useEffect } from "react";
import "./TeacherFees.css";

function TeacherFees() {
  const [feesData, setFeesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedBatch, setSelectedBatch] = useState(""); // Batch timing filter
  const [studentSearch, setStudentSearch] = useState(""); // Student search filter

  const fetchFeesData = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/fees/dashboard");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch fee dashboard data.");
      }
      setFeesData(data);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeesData();
  }, []);

  const handleMarkAsPaid = async (paymentId, username, monthName) => {
    if (
      !window.confirm(
        `Are you sure you want to mark payment for '${username}' (${monthName}) as PAID?`,
      )
    )
      return;
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(`/api/fees/${paymentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paid" }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to update payment record.");
      }

      setSuccessMessage(
        `Marked payment for student '${username}' (${monthName}) as PAID.`,
      );
      fetchFeesData();
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  if (loading && !feesData) {
    return <p className="loading-text">Loading fees summary dashboard...</p>;
  }

  const { unpaidList, ledger, batches } = feesData || {
    unpaidList: [],
    ledger: [],
    batches: [],
  };

  // Dynamic filtering based on selectedBatch and studentSearch
  const filteredLedger = ledger.filter((p) => {
    const matchesBatch = selectedBatch ? p.batchId === selectedBatch : true;
    const studentFullName = p.firstName && p.lastName 
      ? `${p.firstName} ${p.lastName} ${p.username}`.toLowerCase()
      : p.username.toLowerCase();
    const matchesStudent = studentSearch 
      ? studentFullName.includes(studentSearch.toLowerCase().trim())
      : true;
    return matchesBatch && matchesStudent;
  });

  const filteredUnpaid = unpaidList.filter((p) => {
    const matchesBatch = selectedBatch ? p.batchId === selectedBatch : true;
    const studentFullName = p.firstName && p.lastName 
      ? `${p.firstName} ${p.lastName} ${p.username}`.toLowerCase()
      : p.username.toLowerCase();
    const matchesStudent = studentSearch 
      ? studentFullName.includes(studentSearch.toLowerCase().trim())
      : true;
    return matchesBatch && matchesStudent;
  });

  // Recalculate dashboard stats based on filter
  let totalCollected = 0;
  let totalOutstanding = 0;
  let unpaidCount = 0;

  filteredLedger.forEach((p) => {
    if (p.status === "paid") {
      totalCollected += p.amount;
    } else {
      totalOutstanding += p.amount;
      unpaidCount++;
    }
  });

  return (
    <div className="teacher-fees animate-fade-in">
      <header className="section-header">
        <h2>Fee Management Dashboard</h2>
      </header>

      {errorMessage && (
        <div className="alert error">
          <span>{errorMessage}</span>
          <button
            type="button"
            className="alert-close-btn"
            aria-label="Dismiss message"
            onClick={() => setErrorMessage("")}
          >
            ✕
          </button>
        </div>
      )}
      {successMessage && (
        <div className="alert success">
          <span>{successMessage}</span>
          <button
            type="button"
            className="alert-close-btn"
            aria-label="Dismiss message"
            onClick={() => setSuccessMessage("")}
          >
            ✕
          </button>
        </div>
      )}

      {/* Filters (Batch and Student Search) */}
      <div
        className="card filter-card"
        style={{ marginBottom: "2rem", padding: "1.25rem" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2rem",
            flexWrap: "wrap",
          }}
        >
          {batches && batches.length > 0 && (
            <div
              className="form-group"
              style={{
                marginBottom: 0,
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <label
                htmlFor="fees-batch-filter"
                style={{
                  margin: 0,
                  fontWeight: "600",
                  color: "var(--text-secondary)",
                }}
              >
                Batch Timing:
              </label>
              <select
                id="fees-batch-filter"
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                style={{ maxWidth: "260px", margin: 0 }}
              >
                <option value="">-- All Batches --</option>
                {batches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name} ({b.timeSlot})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div
            className="form-group"
            style={{
              marginBottom: 0,
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              flexGrow: 1,
              maxWidth: "400px",
            }}
          >
            <label
              htmlFor="fees-student-search"
              style={{
                margin: 0,
                fontWeight: "600",
                color: "var(--text-secondary)",
                whiteSpace: "nowrap",
              }}
            >
              Search Student:
            </label>
            <input
              id="fees-student-search"
              type="text"
              placeholder="Type name or username..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              style={{ margin: 0, width: "100%" }}
            />
          </div>
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="stats-grid">
        <div className="card stat-card border-success">
          <h3>Total Collected</h3>
          <p className="stat-number text-success">${totalCollected}</p>
          <span className="stat-desc">Total tuition fees received</span>
        </div>

        <div className="card stat-card border-warning">
          <h3>Total Outstanding</h3>
          <p className="stat-number text-warning">${totalOutstanding}</p>
          <span className="stat-desc">Dues yet to be collected</span>
        </div>

        <div className="card stat-card border-danger">
          <h3>Unpaid Invoices</h3>
          <p className="stat-number text-danger">{unpaidCount}</p>
          <span className="stat-desc">Bills pending payment</span>
        </div>
      </div>

      <div className="two-column-layout">
        {/* Unpaid Roster */}
        <div className="card list-card">
          <h3>Outstanding Dues List ({filteredUnpaid.length})</h3>
          <div className="table-container">
            {filteredUnpaid.length === 0 ? (
              <p className="no-data">
                All dues have been collected successfully!
              </p>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th scope="col">Student</th>
                    <th scope="col">Billing Cycle</th>
                    <th scope="col">Due Date</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUnpaid.map((item) => (
                    <tr key={item._id}>
                      <td>
                        {item.firstName || item.lastName
                          ? `${item.firstName} ${item.lastName} (${item.username})`
                          : item.username}
                      </td>
                      <td>{item.monthName || "Monthly"}</td>
                      <td>{item.dueDate}</td>
                      <td className="text-warning">${item.amount}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() =>
                            handleMarkAsPaid(
                              item._id,
                              item.username,
                              item.monthName,
                            )
                          }
                        >
                          Mark Paid
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Ledger */}
        <div className="card list-card">
          <h3>Full Payment Ledger ({filteredLedger.length})</h3>
          <div className="table-container">
            {filteredLedger.length === 0 ? (
              <p className="no-data">No transactions found.</p>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th scope="col">Student</th>
                    <th scope="col">Cycle</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLedger.map((item) => (
                    <tr key={item._id}>
                      <td>
                        {item.firstName || item.lastName
                          ? `${item.firstName} ${item.lastName} (${item.username})`
                          : item.username}
                      </td>
                      <td>{item.monthName || "Monthly"}</td>
                      <td>${item.amount}</td>
                      <td>
                        <span className={`status-pill ${item.status}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherFees;
