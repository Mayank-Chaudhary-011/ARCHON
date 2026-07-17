import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "react-hot-toast";
import VisualGraph from "./VisualGraph";

function getLang(filename) {
  const ext = filename?.split(".").pop();
  const map = {
    py: "python",
    js: "javascript",
    jsx: "jsx",
    html: "html",
    css: "css",
    json: "json",
    md: "markdown",
  };
  return map[ext] || "text";
}

export default function Editor({
  openTabs,
  activeFile,
  generatedFiles,
  onTabClick,
  onTabClose,
  appState,
  agentLog,
}) {
  const code = activeFile && activeFile !== "Agent Pipeline" ? generatedFiles[activeFile] : null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "var(--bg)",
        height: "100%"
      }}
    >
      {/* Tabs */}
      {openTabs.length > 0 && (
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--border)",
            background: "var(--bg2)",
            overflowX: "auto",
            flexShrink: 0,
          }}
        >
          {openTabs.map((tab) => (
            <div
              key={tab}
              onClick={() => onTabClick(tab)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "9px 16px",
                cursor: "pointer",
                borderRight: "1px solid var(--border)",
                borderBottom:
                  activeFile === tab
                    ? "2px solid var(--accent)"
                    : "2px solid transparent",
                background: activeFile === tab ? "var(--bg)" : "transparent",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  color: activeFile === tab ? "var(--text)" : "var(--text2)",
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
                {tab}
              </span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(tab);
                }}
                style={{
                  fontSize: "14px",
                  color: "var(--text3)",
                  lineHeight: 1,
                  padding: "0 2px",
                  borderRadius: "3px",
                  cursor: "pointer",
                }}
              >
                ×
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Code Area / Graph View */}
      <div style={{ flex: 1, overflowY: "auto", position: "relative", display: "flex", flexDirection: "column" }}>
        {activeFile === "Agent Pipeline" || openTabs.length === 0 ? (
          <VisualGraph appState={appState} agentLog={agentLog} />
        ) : code !== null ? (
          <>
            {/* Copy + Download buttons */}
            <div style={{ position: "absolute", top: "12px", right: "16px", zIndex: 10, display: "flex", gap: "6px" }}>
              <button
                onClick={() => {
                  const blob = new Blob([code], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url; a.download = activeFile; a.click();
                  URL.revokeObjectURL(url);
                  toast.success(`Downloaded ${activeFile}`);
                }}
                style={{
                  padding: "5px 12px", borderRadius: "5px",
                  border: "1px solid var(--border)", background: "var(--bg2)",
                  color: "var(--text2)", cursor: "pointer",
                  fontSize: "11px", fontFamily: "Inter, sans-serif",
                }}
              >
                ↓ Save
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText(code); toast.success("Copied"); }}
                style={{
                  padding: "5px 12px", borderRadius: "5px",
                  border: "1px solid var(--border)", background: "var(--bg2)",
                  color: "var(--text2)", cursor: "pointer",
                  fontSize: "11px", fontFamily: "Inter, sans-serif",
                }}
              >
                Copy
              </button>
            </div>

            <SyntaxHighlighter
              language={getLang(activeFile)}
              style={vscDarkPlus}
              showLineNumbers
              customStyle={{
                margin: 0,
                padding: "20px",
                background: "transparent",
                fontSize: "13px",
                fontFamily: "JetBrains Mono, monospace",
                minHeight: "100%",
              }}
            >
              {code}
            </SyntaxHighlighter>
          </>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div
              style={{
                fontSize: "32px",
                opacity: 0.15,
                fontWeight: 700,
                color: "var(--text)",
              }}
            >
              ARCHON
            </div>
            <div
              style={{
                fontSize: "13px",
                color: "var(--text3)",
              }}
            >
              Describe what you want to build
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
