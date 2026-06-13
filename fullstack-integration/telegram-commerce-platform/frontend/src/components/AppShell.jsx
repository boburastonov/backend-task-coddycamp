import { LogOut, Moon, Send, Sun } from "lucide-react";
import { Outlet } from "react-router-dom";

import { useAuthStore } from "../store/authStore.js";

export default function AppShell({ theme, onToggleTheme }) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const botUrl = import.meta.env.VITE_TELEGRAM_BOT_URL || "https://t.me/your_bot_username";

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--line)] bg-[var(--panel)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-bold">Commerce Ops</h1>
            <p className="text-sm text-[var(--muted)]">{user?.email}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a className="btn btn-ghost" href={botUrl} rel="noreferrer" target="_blank">
              <Send size={16} />
              Bot
            </a>
            <button className="btn btn-ghost" onClick={onToggleTheme} title="Toggle theme" type="button">
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button className="btn btn-danger" onClick={logout} type="button">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <Outlet />
    </div>
  );
}
