import { motion } from "framer-motion";

export default function SandboxResult({
  output,
  attempts,
  tokens,
  efficiency,
}) {
  if (!output) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--accent-green)44",
        borderRadius: "12px",
        padding: "20px",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          fontWeight: 600,
          color: "var(--accent-green)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "12px",
        }}
      >
        🐳 Sandbox Output
      </div>

      {/* Output */}
      <div
        style={{
          background: "var(--bg-secondary)",
          borderRadius: "8px",
          padding: "14px",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "14px",
          color: "var(--accent-green)",
          marginBottom: "16px",
          whiteSpace: "pre-wrap",
        }}
      >
        {output}
      </div>

      {/* Stats */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        {[
          { label: "Attempts", value: attempts },
          { label: "Tokens", value: tokens },
          { label: "Efficiency", value: efficiency },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "var(--bg-secondary)",
              borderRadius: "8px",
              padding: "10px 16px",
              flex: 1,
              minWidth: "100px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              {stat.value ?? "—"}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                marginTop: "2px",
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
