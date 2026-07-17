import { useState } from "react";
import { motion } from "framer-motion";

export default function InputPanel({ mode, loading, onRun, onDebug }) {
  const [task, setTask] = useState("");
  const [brokenCode, setBroken] = useState("");
  const [errorMsg, setError] = useState("");

  function handleSubmit() {
    if (loading) return;
    if (mode === "generate") {
      if (!task.trim()) return;
      onRun(task.trim());
      setTask("");
    } else {
      if (!errorMsg.trim()) return;
      onDebug(brokenCode.trim(), errorMsg.trim());
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  }

  return (
    <div
      style={{
        borderTop: "1px solid var(--border)",
        background: "var(--bg2)",
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      {mode === "generate" ? (
        <textarea
          value={task}
          onChange={(e) => setTask(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Describe what to build... (Ctrl+Enter to run)"
          rows={4}
          style={{
            width: "100%",
            background: "var(--bg3)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "12px 14px",
            color: "var(--text)",
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
            lineHeight: "1.6",
          }}
        />
      ) : (
        <div style={{ display: "flex", gap: "10px" }}>
          <textarea
            value={brokenCode}
            onChange={(e) => setBroken(e.target.value)}
            placeholder="Paste your file here (optional)..."
            rows={4}
            style={{
              flex: 1,
              background: "var(--bg3)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "12px 14px",
              color: "var(--text)",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "12px",
            }}
          />
          <textarea
            value={errorMsg}
            onChange={(e) => setError(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Paste error message here (required)..."
            rows={4}
            style={{
              flex: 1,
              background: "var(--bg3)",
              border: "1px solid var(--red)44",
              borderRadius: "8px",
              padding: "12px 14px",
              color: "var(--red)",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "12px",
            }}
          />
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            color: "var(--text3)",
          }}
        >
          Ctrl+Enter to run
        </span>

        <motion.button
          onClick={handleSubmit}
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.97 }}
          style={{
            padding: "9px 24px",
            borderRadius: "7px",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            background: loading ? "var(--bg3)" : "var(--accent)",
            color: loading ? "var(--text3)" : "#fff",
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: "13px",
            transition: "background 0.15s",
          }}
        >
          {loading ? "Running..." : mode === "generate" ? "Run" : "Fix"}
        </motion.button>
      </div>
    </div>
  );
}
