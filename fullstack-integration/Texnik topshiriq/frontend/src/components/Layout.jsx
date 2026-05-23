import { Outlet } from "react-router-dom";

import { useAuthStore } from "../store/authStore.js";

export default function Layout({ theme, onToggleTheme }) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="panel flex flex-col gap-5 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-[var(--muted)]">
              Control Room
            </p>
            <h1 className="mt-2 text-3xl">Project and Task Dashboard</h1>
          </div>

          <div className="flex flex-col gap-3 md:items-end">
            <div className="text-sm text-[var(--muted)]">
              <span className="font-semibold text-[var(--text)]">{user?.name}</span>
              {" "}
              <span>{user?.email}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="btn btn-secondary" onClick={onToggleTheme} type="button">
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </button>
              <button className="btn btn-danger" onClick={logout} type="button">
                Logout
              </button>
            </div>
          </div>
        </header>

        <Outlet />
      </div>
    </div>
  );
}
