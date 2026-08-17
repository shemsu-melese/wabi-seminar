import { useNavigate } from "react-router-dom";
import useMeeting from "../hooks/useMeeting.js";
import "./DashboardPage.css";

function DashboardPage() {
  const navigate = useNavigate();

  const {
    meetings,
    addMeeting,
  } = useMeeting();

  function handleCreateMeeting() {
    const meeting = addMeeting("Instant Meeting");

    console.log("Created meeting:", meeting);

    if (!meeting || !meeting.code) {
      console.error("Meeting was not created correctly.");
      return;
    }

    navigate(`/meeting/${meeting.code}`);
  }

  function handleJoinMeeting(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const code = formData.get("meetingCode")?.trim();

    if (!code) {
      return;
    }

    navigate(`/meeting/${code}`);
  }

  return (
    <div className="dashboard-page">

      <header className="dashboard-header">
        <div className="dashboard-header-inner">

          <div className="brand">
            <div className="brand-mark">
              W
            </div>

            <span className="brand-name">
              Wabi Meeting
            </span>
          </div>

          <button
            onClick={() => navigate("/login")}
            className="logout-button"
          >
            Logout
          </button>

        </div>
      </header>

      <main className="dashboard-main">

        <section className="dashboard-welcome">

          <p className="dashboard-eyebrow">
            Your workspace
          </p>

          <h1 className="dashboard-title">
            Make space for
            <br />
            better conversations.
          </h1>

          <p className="dashboard-subtitle">
            Start a meeting, invite your team, and connect
            without the noise.
          </p>

        </section>

        <section className="meeting-actions">

          <div className="meeting-card">

            <div className="meeting-card-icon">
              🎥
            </div>

            <h3>
              Start a meeting
            </h3>

            <p>
              Create a private meeting room and invite
              people with a simple meeting code.
            </p>

            <button
              onClick={handleCreateMeeting}
              className="primary-button"
            >
              Create meeting
            </button>

          </div>

          <div className="meeting-card">

            <div className="meeting-card-icon">
              ↗
            </div>

            <h3>
              Join a meeting
            </h3>

            <p>
              Already have a meeting code?
              Enter it below to join.
            </p>

            <form onSubmit={handleJoinMeeting}>

              <input
                name="meetingCode"
                type="text"
                placeholder="ABC-123-XYZ"
                className="meeting-input"
              />

              <button
                type="submit"
                className="secondary-button"
              >
                Join meeting
              </button>

            </form>

          </div>

        </section>

        <section className="recent-section">

          <div className="section-header">

            <h2 className="section-title">
              Recent meetings
            </h2>

            <button
              onClick={() => navigate("/meeting-history")}
              className="history-button"
            >
              View history →
            </button>

          </div>

          {meetings.length === 0 ? (

            <div className="empty-meetings">
              <p>
                Your recent meetings will appear here.
              </p>
            </div>

          ) : (

            <div className="meeting-list">

              {meetings.map((meeting) => (

                <div
                  key={meeting.id}
                  className="meeting-row"
                >

                  <div className="meeting-info">

                    <h4>
                      {meeting.title}
                    </h4>

                    <p className="meeting-code">
                      {meeting.code}
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      navigate(`/meeting/${meeting.code}`)
                    }
                    className="open-button"
                  >
                    Open
                  </button>

                </div>

              ))}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default DashboardPage;