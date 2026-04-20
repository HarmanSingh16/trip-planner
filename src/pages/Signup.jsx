import { useState, useCallback, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const nameRef = useRef(null);

  const [form, setForm] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError("");

      if (form.password !== form.confirmPassword) {
        return setError("Passwords do not match.");
      }
      if (form.password.length < 6) {
        return setError("Password must be at least 6 characters.");
      }

      setLoading(true);
      try {
        await signup(form.email, form.password, form.displayName);
        navigate("/dashboard");
      } catch (err) {
        setError(
          err.code === "auth/email-already-in-use"
            ? "This email is already registered."
            : err.message
        );
      } finally {
        setLoading(false);
      }
    },
    [form, signup, navigate]
  );

  return (
    <div className="auth-page" id="signup-page">
      <div className="auth-backdrop">
        <div className="auth-orb auth-orb-1"></div>
        <div className="auth-orb auth-orb-2"></div>
        <div className="auth-orb auth-orb-3"></div>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-logo">✈️</span>
          <h1>Create Account</h1>
          <p>Start planning your next adventure</p>
        </div>

        {error && (
          <div className="alert alert-error" id="signup-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="displayName">Full Name</label>
            <input
              ref={nameRef}
              type="text"
              id="displayName"
              name="displayName"
              value={form.displayName}
              onChange={handleChange}
              placeholder="John Doe"
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="form-input"
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="form-input"
              required
              autoComplete="new-password"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="form-input"
              required
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
            id="btn-signup"
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
