function LoginPage() {
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1>Login</h1>

        <p style={styles.subtitle}>
          Login to your meeting account
        </p>

        <form style={styles.form}>
          <input
            type="email"
            placeholder="Email address"
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Password"
            style={styles.input}
          />

          <button type="submit" style={styles.button}>
            Login
          </button>
        </form>
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
    padding: "20px",
  },

  card: {
    width: "100%",
    maxWidth: "450px",
    backgroundColor: "white",
    borderRadius: "20px",
    padding: "40px",
    boxSizing: "border-box",
    boxShadow: "0 5px 25px rgba(0, 0, 0, 0.08)",
  },

  subtitle: {
    color: "#666",
    marginBottom: "30px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  input: {
    padding: "15px",
    fontSize: "16px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    outline: "none",
  },

  button: {
    padding: "15px",
    backgroundColor: "#202938",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "17px",
    cursor: "pointer",
  },
};

export default LoginPage;