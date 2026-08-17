import { Link } from "react-router-dom";
import "./RegisterPage.css";

function RegisterPage() {
  function handleSubmit(event) {
    event.preventDefault();

    console.log("Registration submitted");
  }

  return (
    <main className="register-page">
      <div className="register-container">

        {/* Left Side - Brand / Product Information */}
        <section className="register-info">
          <div className="brand">
            <div className="brand-icon">
              M
            </div>

            <span>MeetFlow</span>
          </div>

          <div className="info-content">
            <span className="eyebrow">
              MODERN ONLINE MEETINGS
            </span>

            <h1>
              Connect.
              <br />
              Collaborate.
              <br />
              <span>Simply.</span>
            </h1>

            <p>
              Reliable online meetings designed for teams,
              classrooms, businesses, and remote collaboration.
            </p>

            <div className="feature-list">
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Simple and fast meeting experience</span>
              </div>

              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Reliable under poor network conditions</span>
              </div>

              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Secure professional communication</span>
              </div>
            </div>
          </div>

          <div className="info-footer">
            <span>Built for reliable communication.</span>
          </div>
        </section>

        {/* Right Side - Registration Form */}
        <section className="register-panel">
          <div className="register-card">

            <div className="register-header">
              <span className="mobile-brand">
                MeetFlow
              </span>

              <h2>
                Create your account
              </h2>

              <p>
                Start your first meeting in minutes.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="register-form"
            >

              <div className="form-group">
                <label htmlFor="fullName">
                  Full Name
                </label>

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  Email Address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  Password
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">
                  Confirm Password
                </label>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="terms">
                By creating an account, you agree to our
                terms of service and privacy policy.
              </div>

              <button
                type="submit"
                className="register-button"
              >
                Create Account
              </button>
            </form>

            <div className="register-footer">
              <span>
                Already have an account?
              </span>

              <Link to="/login">
                Login
              </Link>
            </div>

            <div className="back-home">
              <Link to="/">
                ← Back to Home
              </Link>
            </div>

          </div>
        </section>

      </div>
    </main>
  );
}

export default RegisterPage;