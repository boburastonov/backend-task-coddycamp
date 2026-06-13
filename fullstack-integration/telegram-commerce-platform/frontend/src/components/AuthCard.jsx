import { Link } from "react-router-dom";

export default function AuthCard({ title, subtitle, linkLabel, linkTo, linkText, children }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <section className="grid w-full max-w-5xl overflow-hidden panel md:grid-cols-[0.85fr_1.15fr]">
        <aside className="hidden border-r border-[var(--line)] bg-[var(--panel-muted)] p-8 md:flex md:flex-col md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Commerce Ops</h1>
            <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">
              Products, orders, users and Telegram admin workflow in one dashboard.
            </p>
          </div>
          <div className="grid gap-3 text-sm">
            <div className="panel p-3">
              <span className="badge">JWT</span>
              <p className="mt-2 font-bold">Protected account access</p>
            </div>
            <div className="panel p-3">
              <span className="badge">Telegram</span>
              <p className="mt-2 font-bold">Bot alerts and broadcasts</p>
            </div>
          </div>
        </aside>

        <div className="p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">{subtitle}</p>
          </div>

          {children}

          <p className="mt-5 text-sm text-[var(--muted)]">
            {linkText}{" "}
            <Link className="font-bold text-[var(--primary)]" to={linkTo}>
              {linkLabel}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
