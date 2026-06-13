import { LogIn } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AuthCard from "../components/AuthCard.jsx";
import MessageBox from "../components/MessageBox.jsx";
import api, { getErrorMessage } from "../lib/api.js";
import { useAuthStore } from "../store/authStore.js";

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [values, setValues] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!values.email || !values.password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/auth/login", values);
      setAuth(response.data);
      navigate("/", { replace: true });
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      linkLabel="Create account"
      linkText="No account yet?"
      linkTo="/register"
      subtitle="Sign in with your registered email and password."
      title="Login"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-bold">
          Email
          <input
            className="field mt-1"
            name="email"
            onChange={(event) => setValues({ ...values, email: event.target.value })}
            type="email"
            value={values.email}
          />
        </label>
        <label className="block text-sm font-bold">
          Password
          <input
            className="field mt-1"
            name="password"
            onChange={(event) => setValues({ ...values, password: event.target.value })}
            type="password"
            value={values.password}
          />
        </label>
        {error ? <MessageBox>{error}</MessageBox> : null}
        <button className="btn btn-primary w-full" disabled={loading} type="submit">
          <LogIn size={16} />
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </AuthCard>
  );
}
