import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import { useAuth } from "../hooks/useAuth";

function Register() {
  const navigate = useNavigate();
  const { register, user, loading } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
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
      await register(formData.username, formData.email, formData.password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Create account"
      title="Set up a clean auth flow"
      subtitle="Register a new user and immediately create a session with the backend."
      asideTitle="Current backend checklist"
      asideText="Make sure the backend entry file and route import paths are correct, otherwise the frontend form will submit into a server that never started."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="your_username"
            value={formData.username}
            onChange={handleChange}
            autoComplete="username"
            minLength={3}
            required
          />
        </div>

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
            placeholder="At least 6 characters"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            minLength={6}
            required
          />
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? "Creating account..." : "Register"}
        </button>

        <p className="auth-switch">
          Already registered? <Link to="/login">Go to login</Link>
        </p>
      </form>
    </AuthShell>
  );
}

export default Register;
