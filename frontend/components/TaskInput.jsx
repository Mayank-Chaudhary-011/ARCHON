import { useState } from "react";
import { motion } from "framer-motion";

export default function TaskInput({ onRun, onDebug, loading }) {
  const [mode, setMode] = useState("generate");
  const [task, setTask] = useState("");
  const [brokenCode, setBrokenCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  function handleSubmit() {
    if (mode === "generate") {
      if (!task.trim()) return;
      onRun(task);
    } else {
      if (!brokenCode.trim()) return;
      onDebug(brokenCode, errorMsg);
    }
  }

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "24px",
      }}
    >
      {/* Mode Toggle */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "20px",
        }}
      >
        {["generate", "debug"].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              padding: "8px 20px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: "14px",
              background: mode === m ? "var(--accent)" : "var(--bg-hover)",
              color: mode === m ? "#fff" : "var(--text-secondary)",
              transition: "all 0.2s",
            }}
          >
            {m === "generate" ? "⚡ Generate" : "🐛 Debug"}
          </button>
        ))}
      </div>

      {/* Generate Mode */}
      {mode === "generate" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <textarea
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Describe what you want to build... e.g. Write a Python function that finds the top 3 largest numbers in a list"
            rows={4}
            style={{
              width: "100%",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "14px",
              color: "var(--text-primary)",
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              resize: "vertical",
              outline: "none",
            }}
          />
        </motion.div>
      )}

      {/* Debug Mode */}
      {mode === "debug" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", flexDirection: "column", gap: "12px" }}
        >
          <textarea
            value={brokenCode}
            onChange={(e) => setBrokenCode(e.target.value)}
            placeholder="Paste your broken Python code here..."
            rows={6}
            style={{
              width: "100%",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "14px",
              color: "var(--text-primary)",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "13px",
              resize: "vertical",
              outline: "none",
            }}
          />
          <textarea
            value={errorMsg}
            onChange={(e) => setErrorMsg(e.target.value)}
            placeholder="Paste the error message here..."
            rows={3}
            style={{
              width: "100%",
              background: "var(--bg-secondary)",
              border: "1px solid var(--accent-red)33",
              borderRadius: "8px",
              padding: "14px",
              color: "var(--accent-red)",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "13px",
              resize: "vertical",
              outline: "none",
            }}
          />
        </motion.div>
      )}

      {/* Submit Button */}
      <motion.button
        onClick={handleSubmit}
        disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.02 }}
        whileTap={{ scale: loading ? 1 : 0.98 }}
        style={{
          marginTop: "16px",
          width: "100%",
          padding: "14px",
          borderRadius: "8px",
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          background: loading ? "var(--bg-hover)" : "var(--accent)",
          color: loading ? "var(--text-muted)" : "#fff",
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: "15px",
          transition: "all 0.2s",
        }}
      >
        {loading
          ? "⏳ Agents working..."
          : mode === "generate"
            ? "▶ Run MyCoder"
            : "🔧 Fix My Code"}
      </motion.button>
    </div>
  );
}
