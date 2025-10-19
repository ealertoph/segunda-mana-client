import React, { useState, useEffect } from "react";
import "../../css/styles.css";
import "../../css/adminsidebar.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem("sg_admin_token")) {
      window.location.replace("/dashboard");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid credentials");
        return;
      }

      // Store token & user info
      sessionStorage.setItem("sg_admin_token", data.token);
      sessionStorage.setItem("sg_admin_user", JSON.stringify(data.user));
      sessionStorage.setItem("sg_admin_role", data.user.role); // Store role for easy access

      window.location.replace("/dashboard");
    } catch (err) {
      setError("Server error. Please try again later.");
    }
  };

  return (
    <>
      <div className="admin-login-bg-wrap" aria-hidden="true"></div>

      <main className="admin-login-page">
        <section className="admin-login-hero">
          <h1>Welcome to Segunda Mana Admin Portal</h1>
          <p>
            Each action you take here strengthens Caritas Manila’s work of
            compassion and service.
          </p>
        </section>

        <section className="admin-login-card" aria-label="Login">
          <h2>Login to your account</h2>
          
          {/* Error Message */}
          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #ef4444',
              color: '#dc2626',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          <form className="admin-login-form" onSubmit={handleSubmit}>
            <div>
              <div className="admin-login-label">Email</div>
              <input
                className="admin-login-input"
                type="email"
                placeholder="caritas.manila@admin.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <div className="admin-login-label">Password</div>
              <div className="admin-login-password-wrap">
                <input
                  className="admin-login-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="admin-login-toggle-eye"
                  aria-label="Toggle password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    // Eye-off SVG
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    // Eye SVG
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button className="admin-login-btn" type="submit">
              Login
            </button>
          </form>
        </section>
      </main>
    </>
  );
}

export default Login;
