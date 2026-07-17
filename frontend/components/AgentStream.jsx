import { motion, AnimatePresence } from "framer-motion";

const AGENTS = [
  { key: "planner", label: "Planner", icon: "🧠", color: "#6366f1" },
  { key: "coder", label: "Coder", icon: "💻", color: "#22c55e" },
  { key: "critic", label: "Critic", icon: "🔍", color: "#f59e0b" },
  { key: "executor", label: "Executor", icon: "🐳", color: "#06b6d4" },
  { key: "debugger", label: "Debugger", icon: "🐛", color: "#ef4444" },
];

export default function AgentStream({ steps, loading }) {
  if (!steps.length && !loading) return null;

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "24px",
      }}
    >
      <h3
        style={{
          color: "var(--text-secondary)",
          fontSize: "12px",
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "16px",
        }}
      >
        Agent Activity
      </h3>

      <AnimatePresence>
        {steps.map((step, i) => {
          const agent = AGENTS.find((a) => a.key === step.agent) || {
            icon: "⚡",
            color: "#6366f1",
          };
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                padding: "12px",
                marginBottom: "8px",
                background: "var(--bg-secondary)",
                borderRadius: "8px",
                borderLeft: `3px solid ${agent.color}`,
              }}
            >
              <span style={{ fontSize: "18px" }}>{agent.icon}</span>
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: agent.color,
                    marginBottom: "4px",
                  }}
                >
                  {step.agent.toUpperCase()}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "var(--text-secondary)",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  {step.message}
                </div>
              </div>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: "16px",
                }}
              >
                {step.status === "done" ? "✅" : "⏳"}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {loading && (
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          style={{
            padding: "12px",
            color: "var(--text-muted)",
            fontSize: "13px",
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          ● agents processing...
        </motion.div>
      )}
    </div>
  );
}
