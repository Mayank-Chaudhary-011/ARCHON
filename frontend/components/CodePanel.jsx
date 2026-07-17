import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function CodePanel({ code, title = "Generated Code" }) {
  if (!code) return null;

  function copyCode() {
    navigator.clipboard.writeText(code);
    toast.success("Code copied!");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span>💻</span>
          <span
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--text-secondary)",
            }}
          >
            {title}
          </span>
        </div>
        <button
          onClick={copyCode}
          style={{
            padding: "6px 14px",
            borderRadius: "6px",
            border: "1px solid var(--border)",
            background: "var(--bg-hover)",
            color: "var(--text-secondary)",
            cursor: "pointer",
            fontSize: "12px",
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
          }}
        >
          📋 Copy
        </button>
      </div>

      {/* Code */}
      <SyntaxHighlighter
        language="python"
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: "20px",
          background: "transparent",
          fontSize: "13px",
          fontFamily: "JetBrains Mono, monospace",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </motion.div>
  );
}
