export default function MessageBox({ type = "error", children }) {
  const color = type === "success" ? "var(--success)" : "var(--danger)";

  return (
    <div
      className="rounded-md border px-3 py-2 text-sm"
      style={{
        borderColor: `color-mix(in srgb, ${color} 30%, transparent)`,
        color,
      }}
    >
      {children}
    </div>
  );
}
