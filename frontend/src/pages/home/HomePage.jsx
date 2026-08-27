import { Link } from "react-router-dom";
import "./HomePage.css";

function HomePage() {
  return (
    <main className="home-page">

      {/* =========================
          NAVIGATION
      ========================= */}
      <nav className="home-navbar">

        <Link to="/" className="home-brand">
          <span className="brand-icon">
            M
          </span>

          <span className="brand-name">
            MeetFlow
          </span>
        </Link>

        <div className="nav-actions">
          <Link
            to="/login"
            className="nav-login"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="nav-register"
          >
            Create Account
          </Link>
        </div>

      </nav>


      {/* =========================
          HERO SECTION
      ========================= */}
      <section className="hero-section">

        <div className="hero-content">

          <div className="hero-badge">
            <span className="status-dot"></span>

            Reliable online meetings
          </div>

          <h1>
            Meetings that
            <span> simply work.</span>
          </h1>

          <p className="hero-description">
            Connect with your team, classmates, and clients
            through a modern meeting platform designed for
            simplicity, reliability, and secure communication.
          </p>

          <div className="hero-actions">

            <Link
              to="/register"
              className="primary-button"
            >
              Create Account
              <span>→</span>
            </Link>

            <Link
              to="/login"
              className="secondary-button"
            >
              Sign In
            </Link>

          </div>

          <p className="hero-note">
            No complicated setup. Join your meeting in seconds.
          </p>

        </div>


        {/* =========================
            MEETING PREVIEW
        ========================= */}
        <div className="meeting-preview">

          <div className="preview-window">

            <div className="preview-header">

              <div className="window-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>

              <span className="meeting-title">
                Team Meeting
              </span>

              <span className="secure-label">
                ● Secure
              </span>

            </div>


            <div className="video-area">

              <div className="participant participant-one">
                <div className="avatar">
                  Y
                </div>

                <span>
                  yosef
                </span>
              </div>

              <div className="participant participant-two">
                <div className="avatar avatar-two">
                  A
                </div>

                <span>
                  abidisa
                </span>
              </div>

              <div className="participant participant-three">
                <div className="avatar avatar-three">
                  S
                </div>

                <span>
                  Shemsu
                </span>
              </div>

              <div className="participant participant-four">
                <div className="avatar avatar-four">
                  B
                </div>

                <span>
                  binyam
                </span>
              </div>

            </div>


            <div className="meeting-controls">

              <button type="button">
                🎤
              </button>

              <button type="button">
                📹
              </button>

              <button
                type="button"
                className="end-button"
              >
                End
              </button>

              <button type="button">
                💬
              </button>

            </div>

          </div>

        </div>

      </section>


      {/* =========================
          FEATURES
      ========================= */}
      <section className="features-section">

        <div className="section-heading">

          <span>
            BUILT FOR REAL MEETINGS
          </span>

          <h2>
            Everything you need to connect.
          </h2>

          <p>
            Powerful meeting capabilities without
            unnecessary complexity.
          </p>

        </div>


        <div className="features-grid">

          <article className="feature-card">

            <div className="feature-icon">
              ⚡
            </div>

            <h3>
              Simple to Join
            </h3>

            <p>
              Join meetings quickly with a simple
              meeting link or code.
            </p>

          </article>


          <article className="feature-card">

            <div className="feature-icon">
              📶
            </div>

            <h3>
              Low-Bandwidth Ready
            </h3>

            <p>
              Designed to remain useful even when
              network conditions are not ideal.
            </p>

          </article>


          <article className="feature-card">

            <div className="feature-icon">
              🔒
            </div>

            <h3>
              Secure by Design
            </h3>

            <p>
              Built with professional communication
              and privacy in mind.
            </p>

          </article>


          <article className="feature-card">

            <div className="feature-icon">
              👥
            </div>

            <h3>
              Accurate Attendance
            </h3>

            <p>
              Keep useful meeting records and
              attendance information.
            </p>

          </article>

        </div>

      </section>


      {/* =========================
          FOOTER
      ========================= */}
      <footer className="home-footer">

        <div className="footer-brand">
          <span className="brand-icon">
            M
          </span>

          <span>
            MeetFlow
          </span>
        </div>

        <p>
          Modern communication for modern teams.
        </p>

      </footer>

    </main>
  );
}

export default HomePage;