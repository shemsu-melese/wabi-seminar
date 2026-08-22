import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/home");
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>
          Modern Online Meeting
          <br />
          Platform
        </h1>

        <p style={styles.subtitle}>
          Simple to join. Easy to use. Reliable under poor network conditions.
        </p>

        <button
          onClick={handleGetStarted}
          style={styles.button}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f5f7fa",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "24px",
  },

  card: {
    width: "100%",
    maxWidth: "1100px",
    minHeight: "430px",
    backgroundColor: "white",
    borderRadius: "24px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    padding: "40px",
    boxSizing: "border-box",
  },

  title: {
    fontSize: "60px",
    lineHeight: "1.15",
    color: "#202938",
    margin: "0 0 30px 0",
    fontWeight: "700",
  },

  subtitle: {
    fontSize: "24px",
    color: "#172031",
    marginBottom: "40px",
  },

  button: {
    backgroundColor: "#eeeeee",
    border: "none",
    borderRadius: "12px",
    padding: "18px 36px",
    fontSize: "24px",
    cursor: "pointer",
  },
};

export default LandingPage;