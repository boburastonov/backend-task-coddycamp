import { UserPlus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AuthCard from "../components/AuthCard.jsx";
import MessageBox from "../components/MessageBox.jsx";
import api, { getErrorMessage } from "../lib/api.js";
import { useAuthStore } from "../store/authStore.js";

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    telegramId: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!values.name || !values.email || !values.password) {
      setError("Name, email and password are required.");
      return;
    }

    if (values.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (values.password !== values.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/auth/register", {
        name: values.name,
        email: values.email,
        phone: values.phone,
        telegramId: values.telegramId,
        password: values.password,
      });
      setAuth(response.data);
      navigate("/", { replace: true });
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setLoading(false);
    }
  }

  function setField(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  return (
    <AuthCard
      linkLabel="Login"
      linkText="Already registered?"
      linkTo="/login"
      subtitle="The first registered user automatically becomes admin."
      title="Create account"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-bold">
            Name
            <input className="field mt-1" onChange={(event) => setField("name", event.target.value)} value={values.name} />
          </label>
          <label className="block text-sm font-bold">
            Email
            <input className="field mt-1" onChange={(event) => setField("email", event.target.value)} type="email" value={values.email} />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-bold">
            Phone
            <input className="field mt-1" onChange={(event) => setField("phone", event.target.value)} value={values.phone} />
          </label>
          <label className="block text-sm font-bold">
            Telegram ID
            <input className="field mt-1" onChange={(event) => setField("telegramId", event.target.value)} value={values.telegramId} />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-bold">
            Password
            <input className="field mt-1" onChange={(event) => setField("password", event.target.value)} type="password" value={values.password} />
          </label>
          <label className="block text-sm font-bold">
            Confirm
            <input className="field mt-1" onChange={(event) => setField("confirmPassword", event.target.value)} type="password" value={values.confirmPassword} />
          </label>
        </div>
        {error ? <MessageBox>{error}</MessageBox> : null}
        <button className="btn btn-primary w-full" disabled={loading} type="submit">
          <UserPlus size={16} />
          {loading ? "Creating..." : "Register"}
        </button>
      </form>
    </AuthCard>
  );
}
