import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <main className="dashboard-shell">
      <section className="dashboard-hero">
        <div>
          <p className="dashboard-eyebrow">Protected area</p>
          <h1>Authentication is active for this account.</h1>
          <p className="dashboard-copy">
            You are inside the private dashboard. This page renders only when a
            valid session exists on the backend.
          </p>
        </div>
        <button className="secondary-button" onClick={handleLogout}>
          Log out
        </button>
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-card">
          <p className="card-label">Signed in as</p>
          <h2>{user?.username || "Unknown user"}</h2>
          <p>{user?.email || "No email available"}</p>
        </article>

        <article className="dashboard-card">
          <p className="card-label">Debug status</p>
          <h2>Frontend ready</h2>
          <p>The Vite app is wired to the auth endpoints and guarded routes.</p>
        </article>

        <article className="dashboard-card dashboard-card-wide">
          <p className="card-label">Session details</p>
          <dl className="detail-list">
            <div>
              <dt>User ID</dt>
              <dd>{user?.id || "Unavailable"}</dd>
            </div>
            <div>
              <dt>Route protection</dt>
              <dd>`ProtectedRoute` blocks unauthenticated access.</dd>
            </div>
            <div>
              <dt>Cookie mode</dt>
              <dd>`withCredentials` is enabled for auth requests.</dd>
            </div>
          </dl>
        </article>
      </section>
    </main>
  );
}

export default Dashboard;
