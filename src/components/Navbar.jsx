import { useState, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }, [logout, navigate]);

  const toggleMobile = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  const isActive = (path) => location.pathname === path;

  if (!currentUser) return null;

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/dashboard" className="navbar-brand" id="navbar-brand">
          <span className="brand-icon">✈️</span>
          <span className="brand-text">TripPlanner</span>
        </Link>

        {/* Desktop nav */}
        <div className="navbar-links desktop-only">
          <Link
            to="/dashboard"
            className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}
            id="nav-dashboard"
          >
            Dashboard
          </Link>
        </div>

        {/* User section */}
        <div className="navbar-user desktop-only">
          <span className="user-email">
            {currentUser.displayName || currentUser.email}
          </span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleLogout}
            id="btn-logout"
          >
            Log out
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="hamburger mobile-only"
          onClick={toggleMobile}
          id="hamburger-btn"
          aria-label="Toggle navigation"
        >
          <span className={`hamburger-line ${mobileOpen ? "open" : ""}`}></span>
          <span className={`hamburger-line ${mobileOpen ? "open" : ""}`}></span>
          <span className={`hamburger-line ${mobileOpen ? "open" : ""}`}></span>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="mobile-menu" id="mobile-menu">
          <Link
            to="/dashboard"
            className="mobile-link"
            onClick={() => setMobileOpen(false)}
          >
            Dashboard
          </Link>
          <div className="mobile-user-info">
            {currentUser.displayName || currentUser.email}
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setMobileOpen(false);
              handleLogout();
            }}
          >
            Log out
          </button>
        </div>
      )}
    </nav>
  );
}
