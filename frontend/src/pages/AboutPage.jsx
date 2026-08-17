import "./AboutPage.css";

function AboutPage() {
  return (
    <div className="about-page">

      <section className="about-hero">
        <span className="about-badge">ABOUT WABI</span>

        <h1>
          Simple meetings.
          <span> Better connections.</span>
        </h1>

        <p>
          Wabi is a modern online meeting platform designed
          to make communication simple, reliable, and accessible
          even with poor bandwidth.
        </p>
      </section>

      <section className="about-content">

        <div className="about-card">
          <h2>About Wabi</h2>

          <p>
            Wabi helps people connect, communicate, and collaborate
            through simple and reliable online meetings.
          </p>
        </div>

        <div className="about-card mission-card">
          <h2>Our Mission</h2>

          <p>
            We want to make online conversations feel natural,
            simple, and connected — regardless of where people are
            or the quality of their internet connection.
          </p>
        </div>

      </section>

      <section className="about-bottom">
        <h2>Built to keep people connected.</h2>

        <p>
          From meetings and real-time communication to attendance
          management, Wabi brings the essential tools together
          in one simple platform.
        </p>
      </section>

    </div>
  );
}

export default AboutPage;