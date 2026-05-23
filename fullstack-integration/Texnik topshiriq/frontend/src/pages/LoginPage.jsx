import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthShell from "../components/AuthShell.jsx";
import api from "../lib/api.js";
import { useAuthStore } from "../store/authStore.js";

function getMessage(error) {
  return error.response?.data?.message || "Unexpected error. Please try again.";
}

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [formValues, setFormValues] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!formValues.email || !formValues.password) {
      setError("Email va password kiritilishi shart.");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/auth/login", formValues);
      setAuth(response.data);
      navigate("/", { replace: true });
    } catch (submitError) {
      setError(getMessage(submitError));
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormValues((currentValues) => ({ ...currentValues, [name]: value }));
  }

  return (
    <AuthShell
      alternateLink={{ to: "/register", label: "Create account" }}
      alternateText="No profile yet?"
      subtitle="Dashboardga kirish uchun email va password bilan tizimga kiring."
      title="Sign in"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium">Email</label>
          <input
            className="field"
            name="email"
            onChange={handleChange}
            placeholder="you@example.com"
            type="email"
            value={formValues.email}
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-sm font-medium">Password</label>
            <Link className="text-sm text-[var(--muted)]" to="/register">
              Register instead
            </Link>
          </div>
          <input
            className="field"
            name="password"
            onChange={handleChange}
            placeholder="At least 6 characters"
            type="password"
            value={formValues.password}
          />
        </div>

        {error ? (
          <div className="rounded-2xl border border-[rgba(185,56,54,0.15)] bg-[rgba(185,56,54,0.1)] px-4 py-3 text-sm text-[var(--danger)]">
            {error}
          </div>
        ) : null}

        <button className="btn btn-primary w-full" disabled={loading} type="submit">
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </AuthShell>
  );
}
