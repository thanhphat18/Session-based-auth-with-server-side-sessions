function AuthShell({
  eyebrow,
  title,
  subtitle,
  asideTitle,
  asideText,
  children,
}) {
  return (
    <main className="auth-shell">
      <section className="auth-shell__panel">
        <div className="auth-shell__content">
          <p className="auth-shell__eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="auth-shell__subtitle">{subtitle}</p>
          {children}
        </div>

        <aside className="auth-shell__aside">
          <div>
            <p className="auth-shell__eyebrow">Debug-first structure</p>
            <h2>{asideTitle}</h2>
            <p>{asideText}</p>
          </div>

          <div className="auth-shell__stats">
            <div className="auth-shell__stat">
              <strong>Vite + React</strong>
              <span>Fast rebuilds and a simple folder structure for auth pages.</span>
            </div>
            <div className="auth-shell__stat">
              <strong>Context state</strong>
              <span>Session checks and auth actions stay centralized in one provider.</span>
            </div>
            <div className="auth-shell__stat">
              <strong>Route guard</strong>
              <span>Protected routes redirect cleanly instead of crashing on missing files.</span>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default AuthShell;
