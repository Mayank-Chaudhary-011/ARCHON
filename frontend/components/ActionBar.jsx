import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ActionBar({
  appState,
  mode,
  setMode,
  filesRemaining,
  pendingReview,
  onPlan,
  onDebug,
  onBuildStart,
  onBuildNext,
  onAutoAll,
  onNeverAsk,
  onCancel,
  onReset,
  onApprove,
  onReject,
  onDownloadZip,
}) {
  const [task, setTask] = useState("");
  const [broken, setBroken] = useState("");
  const [error, setError] = useState("");

  function handleKey(e) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      if (mode === "generate") onPlan(task.trim());
      else onDebug(broken.trim(), error.trim());
    }
  }

  return (
    <div
      style={{
        borderTop: "1px solid var(--border)",
        background: "var(--bg2)",
        padding: "14px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        overflow: "hidden",
      }}
    >
      <AnimatePresence mode="wait">
        {/* IDLE — input */}
        {appState === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {mode === "generate" ? (
              <textarea
                value={task}
                onChange={(e) => setTask(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Describe what to build... (Ctrl+Enter)"
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
                  lineHeight: 1.6,
                }}
              />
            ) : (
              <div style={{ display: "flex", gap: "10px" }}>
                <textarea
                  value={broken}
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
                  value={error}
                  onChange={(e) => setError(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Paste error message here (required)..."
                  rows={4}
                  style={{
                    flex: 1,
                    background: "var(--bg3)",
                    border: "1px solid #f8717122",
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
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "11px", color: "var(--text3)" }}>
                Ctrl+Enter to run
              </span>
              <button
                onClick={() => {
                  if (mode === "generate") onPlan(task.trim());
                  else onDebug(broken.trim(), error.trim());
                }}
                style={{
                  padding: "9px 28px",
                  borderRadius: "7px",
                  border: "none",
                  cursor: "pointer",
                  background: "var(--accent)",
                  color: "#fff",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  fontSize: "13px",
                }}
              >
                {mode === "generate" ? "Plan" : "Fix"}
              </button>
            </div>
          </motion.div>
        )}

        {/* PLANNING */}
        {appState === "planning" && (
          <motion.div
            key="planning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              color: "var(--text2)",
              fontSize: "13px",
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              style={{
                width: "16px",
                height: "16px",
                border: "2px solid var(--border)",
                borderTop: "2px solid var(--accent)",
                borderRadius: "50%",
              }}
            />
            Generating plan...
          </motion.div>
        )}

        {/* PLAN READY */}
        {appState === "plan_ready" && (
          <motion.div
            key="plan_ready"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "13px",
                  color: "var(--text)",
                  fontWeight: 600,
                  marginBottom: "2px",
                }}
              >
                Plan ready — {filesRemaining} files to generate
              </div>
              <div style={{ fontSize: "11px", color: "var(--text3)" }}>
                Review the plan, then start building
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={onCancel}
                style={{
                  padding: "8px 16px",
                  borderRadius: "7px",
                  border: "1px solid var(--border)",
                  background: "transparent",
                  color: "var(--text2)",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Cancel
              </button>
              <button
                onClick={onBuildStart}
                style={{
                  padding: "8px 20px",
                  borderRadius: "7px",
                  border: "none",
                  background: "var(--accent)",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                }}
              >
                Build It
              </button>
            </div>
          </motion.div>
        )}

        {/* BUILDING — show after each file */}
        {appState === "building" && filesRemaining > 0 && (
          <motion.div
            key="building"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ fontSize: "12px", color: "var(--text2)" }}>
              {filesRemaining} file{filesRemaining > 1 ? "s" : ""} remaining
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={onBuildNext}
                style={{
                  padding: "7px 14px",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                  background: "var(--bg3)",
                  color: "var(--text)",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                }}
              >
                Build Next File
              </button>
              <button
                onClick={onAutoAll}
                style={{
                  padding: "7px 14px",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                  background: "var(--bg3)",
                  color: "var(--text)",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                }}
              >
                Auto-build All
              </button>
              <button
                onClick={onNeverAsk}
                style={{
                  padding: "7px 14px",
                  borderRadius: "6px",
                  border: "none",
                  background: "var(--accent)",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                }}
              >
                Auto-build & Don't Ask Again
              </button>
            </div>
          </motion.div>
        )}

        {/* HUMAN REVIEW GATE */}
        {appState === "human_review" && (
          <motion.div
            key="human_review"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13px", color: "var(--yellow)", fontWeight: 600, marginBottom: "4px" }}>
                  ⚠️ Human review required — {pendingReview?.filename}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text3)", fontFamily: "JetBrains Mono, monospace", lineHeight: 1.5 }}>
                  {pendingReview?.feedback?.slice(0, 120)}...
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                <button
                  onClick={onReject}
                  style={{
                    padding: "8px 16px", borderRadius: "7px",
                    border: "1px solid var(--border)", background: "transparent",
                    color: "var(--red)", cursor: "pointer",
                    fontSize: "12px", fontFamily: "Inter, sans-serif",
                  }}
                >
                  Reject
                </button>
                <button
                  onClick={onApprove}
                  style={{
                    padding: "8px 20px", borderRadius: "7px",
                    border: "none", background: "var(--yellow)",
                    color: "#000", cursor: "pointer",
                    fontSize: "12px", fontFamily: "Inter, sans-serif", fontWeight: 600,
                  }}
                >
                  Approve & Continue
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* COMPLETE */}
        {appState === "complete" && (
          <motion.div
            key="complete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                color: "var(--green)",
                fontWeight: 600,
              }}
            >
              ✓ Build complete
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={onDownloadZip}
                style={{
                  padding: "7px 16px", borderRadius: "6px",
                  border: "1px solid var(--accent)", background: "var(--accent-bg)",
                  color: "var(--accent)", cursor: "pointer",
                  fontSize: "12px", fontFamily: "Inter, sans-serif", fontWeight: 600,
                }}
              >
                ↓ Download ZIP
              </button>
              <button
                onClick={onReset}
                style={{
                  padding: "7px 16px", borderRadius: "6px",
                  border: "1px solid var(--border)", background: "transparent",
                  color: "var(--text2)", cursor: "pointer",
                  fontSize: "12px", fontFamily: "Inter, sans-serif",
                }}
              >
                New Project
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
