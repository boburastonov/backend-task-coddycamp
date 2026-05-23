import { Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "../store/authStore.js";

export default function GuestRoute() {
  const token = useAuthStore((state) => state.token);

  if (token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
