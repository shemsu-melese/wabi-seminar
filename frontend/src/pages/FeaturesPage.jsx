import "./FeaturesPage.css";

function FeaturesPage() {
  const features = [
    {
      icon: "🎥",
      title: "HD Video",
      description: "Enjoy clear and reliable video meetings with your team and clients.",
    },
    {
      icon: "💬",
      title: "Real-time Chat",
      description: "Communicate instantly with participants without leaving the meeting.",
    },
    {
      icon: "🖥️",
      title: "Screen Sharing",
      description: "Share your screen, presentations, documents, and ideas effortlessly.",
    },
    {
      icon: "👍",
      title: "Reactions",
      description: "React and interact with participants without interrupting the meeting.",
    },
    {
      icon: "📋",
      title: "Attendance System",
      description: "Track who attended your meeting and keep an accurate attendance record.",
    },
  ];

  return (
    <div className="features-page">
      <section className="features-hero">
        <span className="features-badge">WABI MEETING</span>

        <h1>
          Everything you need for
          <span> better meetings.</span>
        </h1>

        <p>
          Powerful tools designed to make online meetings simple,
          productive, and professional.
        </p>
      </section>

      <section className="features-grid">
        {features.map((feature, index) => (
          <div className="feature-card" key={index}>
            <div className="feature-icon">{feature.icon}</div>

            <h2>{feature.title}</h2>

            <p>{feature.description}</p>

            <div className="feature-number">
              0{index + 1}
            </div>
          </div>
        ))}
      </section>

      <section className="features-bottom">
        <h2>Built for better conversations.</h2>

        <p>
          Wabi Meeting brings communication, collaboration, and
          attendance management together in one simple platform.
        </p>
      </section>
    </div>
  );
}

export default FeaturesPage;