import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return "just now";
}

const LANG_COLORS = {
  py: "#3dd68c",
  js: "#fbbf24",
  jsx: "#61dafb",
  html: "#f87171",
  css: "#a78bfa",
  json: "#94a3b8",
  md: "#e8e8e8",
};

function fileColor(filename) {
  const ext = filename.split(".").pop();
  return LANG_COLORS[ext] || "#888";
}


export default function Sidebar({
  mode,
  setMode,
  implementation,
  generatedFiles,
  activeFile,
  onFileClick,
  agentLog,
  loading,
  output,
  taskChecklist = [],
  tokenStats = null,
  buildHistory = [],
  onRestoreRun,
  onClearHistory,
}) {
  const [showHistory, setShowHistory] = useState(false);
  return (
    <div
      style={{
        background: "var(--bg2)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "30px",
            height: "30px",
            background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 10px rgba(37,99,235,0.3)",
          }}
        >
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "8px", fontWeight: 900, color: "#93c5fd", letterSpacing: "-0.5px" }}>&lt;/&gt;</span>
        </div>
        <span style={{
          fontWeight: 700, fontSize: "15px", letterSpacing: "0.08em",
          fontFamily: "'Outfit', sans-serif",
          background: "linear-gradient(135deg, #c7d2fe, #818cf8)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>ARCHON</span>
        <div
          style={{
            marginLeft: "auto",
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: loading ? "var(--yellow)" : "var(--green)",
          }}
        />
      </div>

      {/* Mode Toggle */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          gap: "6px",
        }}
      >
        {["generate", "debug"].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              flex: 1,
              padding: "7px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 600,
              fontFamily: "Inter, sans-serif",
              background: mode === m ? "var(--accent)" : "var(--bg3)",
              color: mode === m ? "#fff" : "var(--text2)",
              transition: "all 0.15s",
            }}
          >
            {m === "generate" ? "Generate" : "Debug"}
          </button>
        ))}
      </div>

      {/* Task Checklist */}
      {taskChecklist.length > 0 && (
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              fontWeight: 600,
              color: "var(--text3)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Task Progress</span>
            <span style={{ color: "var(--accent)", fontVariantNumeric: "tabular-nums" }}>
              {taskChecklist.filter((t) => t.status === "done").length}/{taskChecklist.length}
            </span>
          </div>
          {taskChecklist.map((task, i) => (
            <motion.div
              key={task.filename}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "5px 0",
                fontSize: "11px",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              {/* Status indicator */}
              {task.status === "done" && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{ color: "var(--green)", flexShrink: 0, fontSize: "13px" }}
                >
                  ✓
                </motion.span>
              )}
              {task.status === "building" && (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  style={{
                    display: "inline-block",
                    width: "12px",
                    height: "12px",
                    border: "2px solid var(--border)",
                    borderTop: "2px solid var(--yellow)",
                    borderRadius: "50%",
                    flexShrink: 0,
                  }}
                />
              )}
              {task.status === "pending" && (
                <span style={{ color: "var(--text3)", flexShrink: 0, fontSize: "13px" }}>○</span>
              )}
              <span
                style={{
                  color:
                    task.status === "done"
                      ? "var(--text)"
                      : task.status === "building"
                      ? "var(--yellow)"
                      : "var(--text3)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {task.filename}
              </span>
            </motion.div>
          ))}
        </div>
      )}


      {/* Implementation Plan */}
      {implementation && (
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              fontWeight: 600,
              color: "var(--text3)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            Implementation Plan
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "var(--accent)",
              fontWeight: 600,
              marginBottom: "4px",
            }}
          >
            {implementation.project_name}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "var(--text2)",
              marginBottom: "8px",
              lineHeight: "1.5",
            }}
          >
            {implementation.description}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
            {implementation.tech_stack?.map((tech) => (
              <span
                key={tech}
                style={{
                  padding: "2px 8px",
                  borderRadius: "4px",
                  background: "var(--bg3)",
                  border: "1px solid var(--border)",
                  fontSize: "10px",
                  color: "var(--text2)",
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Files */}
      {Object.keys(generatedFiles).length > 0 && (
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid var(--border)",
            flex: 1,
            overflowY: "auto",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              fontWeight: 600,
              color: "var(--text3)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            Files
          </div>
          <AnimatePresence>
            {Object.keys(generatedFiles).map((filename, i) => (
              <motion.div
                key={filename}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onFileClick(filename)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "7px 10px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  background:
                    activeFile === filename ? "var(--bg3)" : "transparent",
                  marginBottom: "2px",
                  transition: "background 0.1s",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: fileColor(filename),
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: "12px",
                    color:
                      activeFile === filename ? "var(--text)" : "var(--text2)",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  {filename}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Agent Log */}
      <div
        style={{
          padding: "14px 16px",
          borderTop: "1px solid var(--border)",
          maxHeight: "200px",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            fontWeight: 600,
            color: "var(--text3)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: "8px",
          }}
        >
          Agent Log
        </div>
        {agentLog.length === 0 && !loading && (
          <div
            style={{
              fontSize: "11px",
              color: "var(--text3)",
            }}
          >
            No activity yet
          </div>
        )}
        <AnimatePresence>
          {agentLog.map((log, i) => {
            // Pick color per agent type
            const agentColors = {
              PLANNER:  "var(--agent-planner)",
              CODER:    "var(--agent-coder)",
              CRITIC:   log.message?.includes("PASS") ? "var(--agent-pass)" : "var(--agent-critic)",
              EXECUTOR: "var(--agent-executor)",
              HUMAN:    "var(--agent-human)",
              HISTORY:  "var(--agent-history)",
              ERROR:    "var(--agent-error)",
              DEBUGGER: "var(--agent-executor)",
            };
            const color = agentColors[log.agent?.toUpperCase()] || "var(--accent-light)";
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                style={{
                  fontSize: "11px",
                  fontFamily: "JetBrains Mono, monospace",
                  marginBottom: "5px",
                  display: "flex",
                  gap: "8px",
                  alignItems: "flex-start",
                }}
              >
                <span style={{
                  color,
                  flexShrink: 0,
                  fontSize: "10px",
                  fontWeight: 700,
                  padding: "1px 5px",
                  borderRadius: "3px",
                  background: color.replace("var(", "").replace(")", ""),
                  border: `1px solid ${color}`,
                  backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
                }}>{log.agent}</span>
                <span style={{ color: "var(--text2)", lineHeight: 1.5 }}>{log.message}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {loading && (
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            style={{
              fontSize: "11px",
              color: "var(--text3)",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            processing...
          </motion.div>
        )}
      </div>

      {/* Output */}
      {output && (
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid var(--border)",
            background: "var(--bg)",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              fontWeight: 600,
              color: "var(--text3)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "6px",
            }}
          >
            Output
          </div>
          <div
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "12px",
              color: "var(--green)",
              whiteSpace: "pre-wrap",
            }}
          >
            {output}
          </div>
        </div>
      )}

      {/* Token Stats */}
      {tokenStats && (() => {
        // Cost estimation based on tracked token split
        // GPT-4o:      $2.50/1M input, $10.00/1M output
        // GPT-4o-mini: $0.15/1M input,  $0.60/1M output
        // We attribute planner/critic tokens to GPT-4o and coder to GPT-4o-mini.
        // Without a split we use a blended average as a reasonable approximation.
        const total = tokenStats.total_tokens || 0;
        const prompt = tokenStats.prompt_tokens || Math.round(total * 0.6);
        const completion = tokenStats.completion_tokens || Math.round(total * 0.4);
        // Blended rate: ~60% GPT-4o-mini calls (coder), ~40% GPT-4o (planner+critic)
        const estCost = (
          (prompt     * 0.6 * 0.00015  + prompt     * 0.4 * 0.0025) +
          (completion * 0.6 * 0.0006   + completion * 0.4 * 0.01)
        ) / 1000;
        return (
          <div
            style={{
              padding: "10px 16px",
              borderTop: "1px solid var(--border)",
              background: "var(--bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "10px", color: "var(--text3)", fontFamily: "JetBrains Mono, monospace" }}>
              ⚡ {total.toLocaleString()} tokens
            </span>
            <span style={{ fontSize: "10px", color: "var(--green)", fontFamily: "JetBrains Mono, monospace" }}>
              ~${estCost.toFixed(4)}
            </span>
            {tokenStats.efficiency_score > 0 && (
              <span
                style={{
                  fontSize: "10px",
                  color: "var(--accent)",
                  fontFamily: "JetBrains Mono, monospace",
                  background: "var(--accent-bg)",
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                η {tokenStats.efficiency_score}
              </span>
            )}
          </div>
        );
      })()}


      {/* Build History Panel */}
      <div style={{ borderTop: "1px solid var(--border)", flexShrink: 0 }}>
        {/* Header toggle */}
        <div
          onClick={() => setShowHistory((v) => !v)}
          style={{
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <span style={{ fontSize: "10px", fontWeight: 600, color: "var(--text3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            📂 History
            {buildHistory.length > 0 && (
              <span style={{ marginLeft: "6px", background: "var(--accent)", color: "#fff", borderRadius: "10px", padding: "1px 6px", fontSize: "9px" }}>
                {buildHistory.length}
              </span>
            )}
          </span>
          <span style={{ fontSize: "10px", color: "var(--text3)" }}>{showHistory ? "▲" : "▼"}</span>
        </div>

        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: "hidden" }}
            >
              {buildHistory.length === 0 ? (
                <div style={{ padding: "8px 16px 12px", fontSize: "11px", color: "var(--text3)" }}>
                  No past builds yet
                </div>
              ) : (
                <div style={{ maxHeight: "220px", overflowY: "auto", padding: "0 8px 8px" }}>
                  {buildHistory.map((run) => (
                    <motion.div
                      key={run.id}
                      whileHover={{ background: "var(--bg3)" }}
                      onClick={() => onRestoreRun?.(run)}
                      style={{
                        padding: "8px", borderRadius: "6px",
                        cursor: "pointer", marginBottom: "4px",
                        transition: "background 0.1s",
                      }}
                    >
                      <div style={{ fontSize: "12px", color: "var(--text)", fontWeight: 500, marginBottom: "3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {run.project_name}
                      </div>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <span style={{ fontSize: "10px", color: "var(--text3)" }}>{timeAgo(run.timestamp)}</span>
                        {run.tokens > 0 && (
                          <span style={{ fontSize: "10px", color: "var(--text3)", fontFamily: "JetBrains Mono, monospace" }}>
                            ⚡{run.tokens.toLocaleString()}
                          </span>
                        )}
                        <div style={{ display: "flex", gap: "3px", marginLeft: "auto" }}>
                          {run.tech_stack?.slice(0, 3).map((t) => (
                            <span key={t} style={{ fontSize: "9px", padding: "1px 5px", borderRadius: "3px", background: "var(--bg2)", color: "var(--text3)", border: "1px solid var(--border)" }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <button
                    onClick={(e) => { e.stopPropagation(); onClearHistory?.(); }}
                    style={{
                      width: "100%", marginTop: "4px", padding: "5px",
                      borderRadius: "5px", border: "1px solid var(--border)",
                      background: "transparent", color: "var(--text3)",
                      cursor: "pointer", fontSize: "10px", fontFamily: "Inter, sans-serif",
                    }}
                  >
                    Clear history
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
