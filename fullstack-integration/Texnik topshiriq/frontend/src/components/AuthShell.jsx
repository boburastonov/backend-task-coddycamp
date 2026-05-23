import { Link } from "react-router-dom";

export default function AuthShell({ title, subtitle, alternateText, alternateLink, children }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="panel w-full max-w-5xl overflow-hidden">
        <div className="grid min-h-[680px] md:grid-cols-[1.1fr_0.9fr]">
          <div className="hidden flex-col justify-between bg-[rgba(0,0,0,0.08)] p-10 md:flex">
            <div className="space-y-5">
              <span className="tag">React + Express + MongoDB</span>
              <h1 className="max-w-md text-4xl leading-tight">
                Task Control Center
              </h1>
              <p className="max-w-md text-base text-[var(--muted)]">
                JWT auth, protected dashboard, project-task CRUD va qorong'i
                rejim bitta joyda jamlangan amaliy topshiriq yechimi.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="stat-card">
                <p className="text-sm text-[var(--muted)]">Backend</p>
                <p className="mt-1 text-xl font-bold">Express + MongoDB</p>
              </div>
              <div className="stat-card">
                <p className="text-sm text-[var(--muted)]">Frontend</p>
                <p className="mt-1 text-xl font-bold">React + Tailwind + Zustand</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-md space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-medium uppercase tracking-[0.3em] text-[var(--muted)]">
                  Welcome
                </p>
                <h2 className="text-3xl">{title}</h2>
                <p className="text-sm text-[var(--muted)]">{subtitle}</p>
              </div>

              {children}

              <p className="text-sm text-[var(--muted)]">
                {alternateText}{" "}
                <Link className="font-bold text-[var(--primary)]" to={alternateLink.to}>
                  {alternateLink.label}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
