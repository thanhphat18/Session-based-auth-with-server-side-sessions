import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import { useAuth } from "../hooks/useAuth";

function Login() {
  const navigate = useNavigate();
  const { login, user, loading } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(formData.email, formData.password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Access your thesis workspace"
      subtitle="Sign in with your account to continue to the protected dashboard."
      asideTitle="Session-based authentication"
      asideText="This Vite frontend talks to your Express backend with cookies enabled, so the session survives refreshes when the backend is configured correctly."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? "Signing in..." : "Log in"}
        </button>

        <p className="auth-switch">
          Need an account? <Link to="/register">Create one</Link>
        </p>
      </form>
    </AuthShell>
  );
}

export default Login;
