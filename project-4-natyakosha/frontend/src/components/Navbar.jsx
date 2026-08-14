import React from "react";
import PropTypes from "prop-types";
import "./Navbar.css";

function Navbar({ user, currentView, setView, onLogout }) {
  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <img src="/natraj.png" alt="Nataraja Logo" className="brand-logo" />
        <span className="brand-name">Natyakosha</span>
      </div>

      <div className="nav-links">
        {user.role === "teacher" ? (
          <>
            <button
              className={`nav-btn ${currentView === "curriculum_editor" ? "active" : ""}`}
              aria-current={
                currentView === "curriculum_editor" ? "page" : undefined
              }
              onClick={() => setView("curriculum_editor")}
            >
              Curriculum Editor
            </button>
            <button
              className={`nav-btn ${currentView === "batches" ? "active" : ""}`}
              aria-current={currentView === "batches" ? "page" : undefined}
              onClick={() => setView("batches")}
            >
              Roster Manager
            </button>
            <button
              className={`nav-btn ${currentView === "attendance" ? "active" : ""}`}
              aria-current={currentView === "attendance" ? "page" : undefined}
              onClick={() => setView("attendance")}
            >
              Mark Attendance
            </button>
            <button
              className={`nav-btn ${currentView === "fees" ? "active" : ""}`}
              aria-current={currentView === "fees" ? "page" : undefined}
              onClick={() => setView("fees")}
            >
              Fee Dashboard
            </button>
          </>
        ) : (
          <>
            <button
              className={`nav-btn ${currentView === "learning" ? "active" : ""}`}
              aria-current={currentView === "learning" ? "page" : undefined}
              onClick={() => setView("learning")}
            >
              Learning Area
            </button>
            <button
              className={`nav-btn ${currentView === "student_dashboard" ? "active" : ""}`}
              aria-current={
                currentView === "student_dashboard" ? "page" : undefined
              }
              onClick={() => setView("student_dashboard")}
            >
              Records
            </button>
          </>
        )}
      </div>

      <div className="nav-profile">
        <span className="profile-badge">
          <span className="profile-role-tag">
            {user.role === "teacher" ? "Teacher" : "Student"}
          </span>{" "}
          — {user.username}
        </span>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

Navbar.propTypes = {
  user: PropTypes.shape({
    role: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
  }),
  currentView: PropTypes.string.isRequired,
  setView: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default Navbar;
