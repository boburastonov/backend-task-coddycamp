import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AuthShell from "../components/AuthShell.jsx";
import api from "../lib/api.js";
import { useAuthStore } from "../store/authStore.js";

function getMessage(error) {
  return error.response?.data?.message || "Unexpected error. Please try again.";
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!formValues.name || !formValues.email || !formValues.password) {
      setError("Barcha maydonlar to'ldirilishi kerak.");
      return;
    }

    if (formValues.password.length < 6) {
      setError("Password kamida 6 ta belgidan iborat bo'lishi kerak.");
      return;
    }

    if (formValues.password !== formValues.confirmPassword) {
      setError("Passwordlar mos kelmadi.");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/auth/register", {
        name: formValues.name,
        email: formValues.email,
        password: formValues.password,
      });
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
      alternateLink={{ to: "/login", label: "Go to login" }}
      alternateText="Already have an account?"
      subtitle="Yangi foydalanuvchi yarating va shu zahoti protected dashboardga kiring."
      title="Create account"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium">Full name</label>
          <input
            className="field"
            name="name"
            onChange={handleChange}
            placeholder="Ali Valiyev"
            value={formValues.name}
          />
        </div>

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

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Password</label>
            <input
              className="field"
              name="password"
              onChange={handleChange}
              placeholder="Minimum 6 chars"
              type="password"
              value={formValues.password}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Confirm password</label>
            <input
              className="field"
              name="confirmPassword"
              onChange={handleChange}
              placeholder="Repeat password"
              type="password"
              value={formValues.confirmPassword}
            />
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-[rgba(185,56,54,0.15)] bg-[rgba(185,56,54,0.1)] px-4 py-3 text-sm text-[var(--danger)]">
            {error}
          </div>
        ) : null}

        <button className="btn btn-primary w-full" disabled={loading} type="submit">
          {loading ? "Creating..." : "Register"}
        </button>
      </form>
    </AuthShell>
  );
}
