import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const location = useLocation();

  // Don't show the main website navbar inside a meeting.
  if (location.pathname.startsWith("/meeting/")) {
    return null;
  }

  const isDashboard = location.pathname === "/dashboard";

  return (
    <header className="navbar">
      <div className="navbar-container">

        {/* Logo */}
        <Link to="/" className="navbar-brand">
          <div className="navbar-logo">W</div>
          <span>Wabi</span>
        </Link>

        {/* Main navigation */}
        <nav className="navbar-links">

          {!isDashboard ? (
            <>
              <Link
                to="/home"
                className={
                  location.pathname === "/home"
                    ? "nav-link active"
                    : "nav-link"
                }
              >
                Home
              </Link>

              <Link
    to="/Dashboard"
    className={
      location.pathname === "/Dashboard"
        ? "nav-link active"
        : "nav-link"
    }
  >
   Dashboard
  </Link>
              <Link
    to="/about"
    className={
      location.pathname === "/about"
        ? "nav-link active"
        : "nav-link"
    }
  >
    About
  </Link>
         <Link
    to="/Meeting"
    className={
      location.pathname === "/Meeting"
        ? "nav-link active"
        : "nav-link"
    }
  >
   Meeting
  </Link>
            </>
          ) : (
            <>
      <Link
    to="/features"
    className={
      location.pathname === "/features"
        ? "nav-link active"
        : "nav-link"
    }
  >
    Features
  </Link>

       

              <Link
    to="/History"
    className={
      location.pathname === "/History"
        ? "nav-link active"
        : "nav-link"
    }
  >
    History
  </Link>
            </>
          )}

        </nav>

        {/* Right side */}
        <div className="navbar-actions">

          {!isDashboard ? (
            <>
              <Link to="/login" className="login-link">
                Log in
              </Link>

              <Link to="/register" className="signup-button">
                Get started
              </Link>
            </>
          ) : (
            <>
              <div className="user-profile">
                <div className="user-avatar">
                  U
                </div>

                <span>Account</span>
              </div>

              {/* <Link to="/login" className="logout-button">
                Logout
              </Link> */}
            </>
          )}

        </div>

      </div>
    </header>
  );
}

export default Navbar;