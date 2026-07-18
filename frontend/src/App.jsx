import { useState, useEffect, useCallback } from "react";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { v4 as uuid } from "uuid";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import Sidebar from "../components/Sidebar";
import Editor from "../components/Editor";
import ActionBar from "../components/ActionBar";

const API = "http://localhost:8000/api";

// SVG key icon — no emoji, no ESLint warning
function KeyIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8b949e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="M21 2l-9.6 9.6" />
      <path d="M15.5 7.5l3 3L22 7l-3-3" />
    </svg>
  );
}

function HelpDropdown({ showDropdown, setShowDropdown }) {
  useEffect(() => {
    if (!showDropdown) return;
    const handleClose = () => setShowDropdown(false);
    window.addEventListener("click", handleClose);
    return () => window.removeEventListener("click", handleClose);
  }, [showDropdown]);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowDropdown(!showDropdown);
        }}
        style={{
          padding: "6px 14px",
          borderRadius: "8px",
          border: "1px solid rgba(48, 54, 61, 0.8)",
          background: "rgba(22, 27, 34, 0.6)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          color: "#e6edf3",
          fontFamily: "Inter, sans-serif",
          fontSize: "13px",
          fontWeight: 500,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          transition: "all 0.2s ease-in-out",
          outline: "none",
          boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = "rgba(33, 38, 45, 0.8)";
          e.currentTarget.style.borderColor = "var(--accent)";
          e.currentTarget.style.boxShadow = "0 0 10px var(--accent-glow)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = "rgba(22, 27, 34, 0.6)";
          e.currentTarget.style.borderColor = "rgba(48, 54, 61, 0.8)";
          e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.1)";
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span style={{ fontWeight: 600 }}>Demos & Links</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8b949e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform 0.2s ease", transform: showDropdown ? "rotate(180deg)" : "rotate(0)" }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {showDropdown && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: "240px",
            background: "rgba(15, 15, 24, 0.95)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid var(--border2)",
            borderRadius: "10px",
            boxShadow: "0 12px 30px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(255, 255, 255, 0.05)",
            zIndex: 10000,
            padding: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            animation: "fadeInUp 0.15s ease-out"
          }}
        >
          <div style={{ padding: "6px 10px", fontSize: "10px", fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--border)", marginBottom: "4px" }}>
            Resources
          </div>
          
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 12px",
              borderRadius: "6px",
              color: "var(--text)",
              textDecoration: "none",
              fontSize: "13px",
              fontFamily: "Inter, sans-serif",
              transition: "all 0.15s ease",
              fontWeight: 500
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "var(--accent-bg)";
              e.currentTarget.style.color = "var(--accent-light)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--text)";
            }}
          >
            <KeyIcon />
            <span>Get API Key ↗</span>
          </a>

          <a
            href="https://www.loom.com/share/14aabde31d33410b9842fe900de06637"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 12px",
              borderRadius: "6px",
              color: "var(--text)",
              textDecoration: "none",
              fontSize: "13px",
              fontFamily: "Inter, sans-serif",
              transition: "all 0.15s ease",
              fontWeight: 500
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(52, 211, 153, 0.1)";
              e.currentTarget.style.color = "var(--green)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--text)";
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
              <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
            </svg>
            <span>Watch Build Demo 📺</span>
          </a>

          <a
            href="https://www.loom.com/share/d35d5eda4a13437c972a946c64343b2e"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 12px",
              borderRadius: "6px",
              color: "var(--text)",
              textDecoration: "none",
              fontSize: "13px",
              fontFamily: "Inter, sans-serif",
              transition: "all 0.15s ease",
              fontWeight: 500
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(34, 211, 238, 0.1)";
              e.currentTarget.style.color = "var(--cyan)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--text)";
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
              <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
            </svg>
            <span>Watch Debug Demo 📺</span>
          </a>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [appState, setAppState] = useState("idle");
  const [sessionId] = useState(() => uuid());
  const [implementation, setImpl] = useState(null);
  const [generatedFiles, setFiles] = useState({});
  const [activeFile, setActiveFile] = useState(null);
  const [openTabs, setOpenTabs] = useState([]);
  const [output, setOutput] = useState("");
  const [agentLog, setAgentLog] = useState([]);
  const [filesRemaining, setRemaining] = useState(0);
  const [autoMode, setAutoMode] = useState(
    () => localStorage.getItem("mycoder_auto") === "true",
  );
  const [mode, setMode] = useState("generate");

  // ── API key & model settings — sessionStorage so they clear on tab close ──
  const [apiKey, setApiKey] = useState(
    () => sessionStorage.getItem("archon_api_key") || ""
  );
  const baseUrl = "";
  const [modelPlanner, setModelPlanner] = useState(
    () => sessionStorage.getItem("archon_model_planner") || ""
  );
  const [modelCoder, setModelCoder] = useState(
    () => sessionStorage.getItem("archon_model_coder") || ""
  );

  const [showKeyInput, setShowKeyInput] = useState(
    () => !sessionStorage.getItem("archon_api_key")
  );

  // Temp state while the banner is open — initialised lazily from sessionStorage
  const [tempKey, setTempKey] = useState(
    () => sessionStorage.getItem("archon_api_key") || ""
  );
  const [tempModel, setTempModel] = useState(
    () => sessionStorage.getItem("archon_model_planner") || "gpt-4o"
  );
  const [showDropdown, setShowDropdown] = useState(false);

  // Auto-focus the key input when banner opens
  useEffect(() => {
    if (!showKeyInput) return;
    const tryFocus = () => {
      const el = document.getElementById("api-key-input");
      if (el) el.focus();
    };
    tryFocus();
    const t = setTimeout(tryFocus, 60);
    return () => clearTimeout(t);
  }, [showKeyInput]);

  function saveSettings() {
    const trimmedKey = tempKey.trim();
    if (!trimmedKey) {
      toast.error("API Key cannot be empty");
      return;
    }
    // Derive coder model: same as planner unless user typed something different
    const plannerModel = tempModel.trim() || "gpt-4o";
    const coderModel = plannerModel.includes("4o") ? plannerModel.replace("gpt-4o", "gpt-4o-mini") : plannerModel;

    sessionStorage.setItem("archon_api_key", trimmedKey);
    sessionStorage.removeItem("archon_base_url");
    sessionStorage.setItem("archon_model_planner", plannerModel);
    sessionStorage.setItem("archon_model_coder", coderModel);

    setApiKey(trimmedKey);
    setModelPlanner(plannerModel);
    setModelCoder(coderModel);
    setShowKeyInput(false);
    toast.success("Settings saved for this session");
  }

  function handleModeChange(newMode) {
    setMode(newMode);
    setAppState("idle");
    setImpl(null);
    setFiles({});
    setActiveFile(null);
    setOpenTabs([]);
    setOutput("");
    setAgentLog([]);
    setTaskChecklist([]);
    setTokenStats(null);
    setHumanReviewPending(false);
  }

  const [taskChecklist, setTaskChecklist] = useState([]);
  const [tokenStats, setTokenStats] = useState(null);
  const [humanReviewPending, setHumanReviewPending] = useState(false);
  const [pendingReview, setPendingReview] = useState(null);
  const [buildHistory, setBuildHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("archon_history") || "[]"); }
    catch { return []; }
  });

  function log(agent, message) {
    setAgentLog((prev) => [...prev, { agent, message }]);
  }

  function openTab(filename) {
    setOpenTabs((prev) =>
      prev.includes(filename) ? prev : [...prev, filename],
    );
    setActiveFile(filename);
  }

  function closeTab(filename) {
    const newTabs = openTabs.filter((t) => t !== filename);
    setOpenTabs(newTabs);
    if (activeFile === filename) {
      setActiveFile(newTabs[newTabs.length - 1] || null);
    }
  }

  // ── Auto build loop ─────────────────────────────────────────────────────────
  const buildNext = useCallback(async () => {
    setAppState("building");
    log("CODER", "Generating next file...");

    setTaskChecklist((prev) => {
      const nextIdx = prev.findIndex((t) => t.status === "pending");
      if (nextIdx === -1) return prev;
      return prev.map((t, i) => (i === nextIdx ? { ...t, status: "building" } : t));
    });

    try {
      const res = await axios.post(`${API}/build/next`, {
        session_id: sessionId,
        api_key: apiKey,
        llm_provider: "custom",
        base_url: baseUrl,
        model_planner: modelPlanner,
        model_coder: modelCoder,
      });
      const data = res.data;

      if (data.tokens) setTokenStats(data.tokens);

      if (data.logs && data.logs.length > 0) {
        data.logs.forEach((item) => log(item.agent, item.message));
      }

      if (data.status === "human_review") {
        setPendingReview({ filename: data.filename, code: data.code, feedback: data.feedback });
        setTaskChecklist((prev) =>
          prev.map((t) => (t.filename === data.filename ? { ...t, status: "building" } : t))
        );
        setAppState("human_review");
        log("HUMAN", `Review needed: ${data.filename} failed critic`);
        toast("👀 Agent needs your review", { duration: 4000 });
        return;
      }

      if (data.status === "complete") {
        const finalFiles = { ...generatedFiles, ...data.generated_files };
        setFiles(finalFiles);
        setOutput(data.output);
        setRemaining(0);
        setTaskChecklist((prev) => prev.map((t) => ({ ...t, status: "done" })));
        setAppState("complete");
        saveToHistory(implementation, finalFiles, data.tokens || tokenStats, data.output);
        log("EXECUTOR", `Done. Output: ${data.output || "no output"}`);
        toast.success("Project built successfully ✨");
        return;
      }

      if (data.status === "file_ready") {
        setFiles((prev) => ({ ...prev, [data.filename]: data.code }));
        openTab(data.filename);
        setRemaining(data.files_remaining);
        setTaskChecklist((prev) =>
          prev.map((t) => (t.filename === data.filename ? { ...t, status: "done" } : t))
        );
        log("CODER", `${data.filename} ready`);

        if (data.files_remaining === 0) {
          buildNext();
        } else if (!autoMode) {
          setAppState("plan_ready");
        }
      }
    } catch (e) {
      log("ERROR", e.message);
      toast.error("Build failed");
      setAppState("plan_ready");
    }
  }, [sessionId, apiKey, baseUrl, modelPlanner, modelCoder, autoMode, generatedFiles, implementation, tokenStats]);

  useEffect(() => {
    if (autoMode && appState === "building" && filesRemaining > 0) {
      const timer = setTimeout(() => buildNext(), 800);
      return () => clearTimeout(timer);
    }
  }, [autoMode, appState, filesRemaining, buildNext]);

  // ── History helpers ──────────────────────────────────────────────────────────
  function saveToHistory(impl, files, tokens, out, runMode = "generate") {
    const entry = {
      id: uuid(),
      timestamp: Date.now(),
      project_name: runMode === "debug" ? "Debug Fix" : (impl?.project_name || "Untitled"),
      task: runMode === "debug" ? "Code Correction Fix" : (impl?.description || ""),
      tech_stack: runMode === "debug" ? ["Debug"] : (impl?.tech_stack || []),
      implementation: impl,
      generatedFiles: files,
      tokens: tokens?.total_tokens || 0,
      output: out || "",
      mode: runMode,
    };
    setBuildHistory((prev) => {
      const updated = [entry, ...prev].slice(0, 15);
      localStorage.setItem("archon_history", JSON.stringify(updated));
      return updated;
    });
  }

  function handleRestoreRun(run) {
    setImpl(run.implementation);
    setFiles(run.generatedFiles);
    const tabs = Object.keys(run.generatedFiles);
    setOpenTabs(tabs);
    setActiveFile(tabs[0] || null);
    setOutput(run.output || "");
    setAgentLog([{ agent: "HISTORY", message: `Restored — ${run.project_name}` }]);

    if (run.mode === "debug") {
      setMode("debug");
      setTaskChecklist([]);
    } else {
      setMode("generate");
      setTaskChecklist(
        run.implementation?.files?.map((f) => ({ ...f, status: "done" })) || []
      );
    }

    setTokenStats({ total_tokens: run.tokens, efficiency_score: 0 });
    setRemaining(0);
    setAppState("complete");
    toast.success(`↩ Restored: ${run.project_name}`);
  }

  function handleClearHistory() {
    setBuildHistory([]);
    localStorage.removeItem("archon_history");
    toast("History cleared");
  }

  async function handleBurnSessions() {
    try {
      const res = await axios.post(`${API}/sessions/burn`);
      toast.success(res.data.message || "SSD Sessions burned successfully");
    } catch {
      toast.error("Failed to burn local sessions");
    }
  }

  async function handlePlan(task) {
    if (!apiKey.trim()) {
      log("ERROR", "API Key is required — click the key icon (top-right) to set it.");
      toast.error("API Key is required");
      setShowKeyInput(true);
      return;
    }
    setAppState("planning");
    setImpl(null);
    setFiles({});
    setActiveFile(null);
    setOpenTabs([]);
    setOutput("");
    setAgentLog([]);
    setTaskChecklist([]);
    setTokenStats(null);
    setHumanReviewPending(false);

    log("PLANNER", "Generating implementation plan...");

    try {
      const res = await axios.post(`${API}/plan`, {
        task,
        session_id: sessionId,
        api_key: apiKey,
        llm_provider: "custom",
        base_url: baseUrl,
        model_planner: modelPlanner,
        model_coder: modelCoder,
      });
      const data = res.data;

      setImpl(data.implementation);
      setRemaining(data.total_files);
      setFiles({ "Agent Pipeline": "", "plan.md": data.plan_md });
      setOpenTabs(["Agent Pipeline", "plan.md"]);
      setActiveFile("Agent Pipeline");
      setAppState("plan_ready");

      const planFiles = data.implementation?.files || [];
      setTaskChecklist(planFiles.map((f) => ({ filename: f.filename, description: f.description, status: "pending" })));

      log("PLANNER", `Plan ready — ${data.total_files} files to generate`);
      if (data.tracing_active) {
        log("SYSTEM", "LangSmith Observability active — traces streaming to dashboard");
      } else {
        log("SYSTEM", "LangSmith Observability offline");
      }
      toast.success("Implementation plan ready");
    } catch (e) {
      log("ERROR", e.message);
      toast.error("Planning failed");
      setAppState("idle");
    }
  }

  function handleAutoAll() {
    buildNext();
    setAutoMode(true);
  }

  function handleNeverAsk() {
    localStorage.setItem("mycoder_auto", "true");
    buildNext();
    setAutoMode(true);
  }

  async function handleApprove() {
    if (!pendingReview) return;
    log("HUMAN", `Approved ${pendingReview.filename}`);
    try {
      const res = await axios.post(`${API}/build/approve`, {
        session_id: sessionId,
        filename: pendingReview.filename,
        code: pendingReview.code,
      });
      setFiles((prev) => ({ ...prev, [pendingReview.filename]: pendingReview.code }));
      openTab(pendingReview.filename);
      setTaskChecklist((prev) =>
        prev.map((t) => (t.filename === pendingReview.filename ? { ...t, status: "done" } : t))
      );
      const remaining = res.data.files_remaining;
      setRemaining(remaining);
      setPendingReview(null);
      toast.success(`${pendingReview.filename} approved`);
      if (remaining === 0) buildNext();
      else setAppState("building");
    } catch (e) {
      log("ERROR", e.message);
      toast.error("Approval failed");
    }
  }

  function handleReject() {
    log("HUMAN", "Build rejected");
    setPendingReview(null);
    setAppState("idle");
    toast.error("Build cancelled");
  }

  async function handleDownloadZip() {
    const zip = new JSZip();
    Object.entries(generatedFiles).forEach(([name, code]) => {
      if (name !== "plan.md") zip.file(name, code);
    });
    const blob = await zip.generateAsync({ type: "blob" });
    const projectName = implementation?.project_name?.replace(/\s+/g, "_") || "archon_project";
    saveAs(blob, `${projectName}.zip`);
    toast.success("ZIP downloaded!");
  }

  async function handleDebug(brokenCode, errorMessage) {
    if (!apiKey.trim()) {
      log("ERROR", "API Key is required — click the key icon (top-right) to set it.");
      toast.error("API Key is required");
      setShowKeyInput(true);
      return;
    }
    setAppState("planning");
    setFiles({});
    setActiveFile(null);
    setOpenTabs([]);
    setOutput("");
    setAgentLog([]);

    log("DEBUGGER", "Analyzing error...");

    try {
      const res = await axios.post(`${API}/debug`, {
        broken_code: brokenCode,
        error_message: errorMessage,
        api_key: apiKey,
        llm_provider: "custom",
        base_url: baseUrl,
        model_planner: modelPlanner,
        model_coder: modelCoder,
      });
      const data = res.data;

      const files = { "fixed_code.py": data.fixed_code };
      setFiles(files);
      openTab("fixed_code.py");
      setOutput(data.output);

      if (data.tokens) setTokenStats(data.tokens);
      setAppState("complete");

      saveToHistory(null, files, data.tokens, data.output, "debug");

      log("DEBUGGER", "Fix ready");
      log("EXECUTOR", `Output: ${data.output}`);
      toast.success("Code fixed");
    } catch (e) {
      log("ERROR", e.message);
      toast.error("Debug failed");
      setAppState("idle");
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", height: "100vh", overflow: "hidden" }}>

      {/* ── API Key / Model Banner ─────────────────────────── */}
      {showKeyInput && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999,
          background: "#0d1117", borderBottom: "1px solid #30363d",
          padding: "10px 20px", display: "flex", flexWrap: "wrap",
          alignItems: "center", gap: "10px"
        }}>
          <KeyIcon />
          <span style={{ color: "#8b949e", fontSize: "12px", fontFamily: "Inter,sans-serif", whiteSpace: "nowrap" }}>
            API Key
          </span>
          <input
            id="api-key-input"
            type="password"
            placeholder="sk-... or xai-... or any key"
            value={tempKey}
            onChange={(e) => setTempKey(e.target.value)}
            autoComplete="new-password"
            data-lpignore="true"
            data-1pignore="true"
            onKeyDown={(e) => e.key === "Enter" && saveSettings()}
            style={{
              flex: "1 1 180px", maxWidth: "260px", padding: "6px 12px",
              borderRadius: "6px", border: "1px solid #30363d",
              background: "#161b22", color: "#e6edf3",
              fontFamily: "monospace", fontSize: "13px", outline: "none"
            }}
          />
          <span style={{ color: "#8b949e", fontSize: "12px", fontFamily: "Inter,sans-serif", whiteSpace: "nowrap" }}>
            Model
          </span>
          <input
            type="text"
            placeholder="gpt-4o / grok-2 / claude-3-5-sonnet..."
            value={tempModel}
            onChange={(e) => setTempModel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveSettings()}
            style={{
              flex: "1 1 160px", maxWidth: "220px", padding: "6px 12px",
              borderRadius: "6px", border: "1px solid #30363d",
              background: "#161b22", color: "#e6edf3",
              fontSize: "13px", outline: "none"
            }}
          />
          <button
            onClick={saveSettings}
            style={{
              padding: "6px 18px", borderRadius: "6px", border: "none",
              background: "#238636", color: "#fff", fontFamily: "Inter,sans-serif",
              fontSize: "13px", cursor: "pointer", fontWeight: 600, marginRight: "10px"
            }}
          >Save</button>

          <div style={{ marginLeft: "auto" }}>
            <HelpDropdown showDropdown={showDropdown} setShowDropdown={setShowDropdown} />
          </div>
        </div>
      )}

      {/* ── Small key button shown when banner is collapsed ── */}
      {!showKeyInput && (
        <div style={{
          position: "fixed", top: "10px", right: "14px", zIndex: 9999,
          display: "flex", alignItems: "center", gap: "8px"
        }}>
          <HelpDropdown showDropdown={showDropdown} setShowDropdown={setShowDropdown} />
          <button
            onClick={() => setShowKeyInput(true)}
            title="Configure API key & model"
            style={{
              background: "#161b22", border: "1px solid #30363d", borderRadius: "6px",
              color: "#8b949e", padding: "6px 12px", fontSize: "12px",
              cursor: "pointer", fontFamily: "Inter,sans-serif",
              display: "flex", alignItems: "center", gap: "5px"
            }}
          >
            <KeyIcon />
            API Key
          </button>
        </div>
      )}

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1a1a1a",
            color: "#e8e8e8",
            border: "1px solid #2a2a2a",
            fontSize: "13px",
          },
        }}
      />

      <Sidebar
        appState={appState}
        mode={mode}
        setMode={handleModeChange}
        implementation={implementation}
        generatedFiles={generatedFiles}
        activeFile={activeFile}
        onFileClick={openTab}
        agentLog={agentLog}
        output={output}
        filesRemaining={filesRemaining}
        taskChecklist={taskChecklist}
        tokenStats={tokenStats}
        humanReviewPending={humanReviewPending}
        buildHistory={buildHistory}
        onRestoreRun={handleRestoreRun}
        onClearHistory={handleClearHistory}
        onBurnSessions={handleBurnSessions}
      />

      <div
        style={{
          display: "grid",
          gridTemplateRows:
            appState === "idle" || appState === "planning"
              ? "1fr 220px"
              : appState === "plan_ready"
                ? "1fr 120px"
                : appState === "building"
                  ? "1fr 100px"
                  : appState === "human_review"
                    ? "1fr 140px"
                    : "1fr 60px",
          overflow: "hidden",
          borderLeft: "1px solid var(--border)",
          transition: "grid-template-rows 0.3s",
        }}
      >
        <Editor
          openTabs={openTabs}
          activeFile={activeFile}
          generatedFiles={generatedFiles}
          onTabClick={setActiveFile}
          onTabClose={closeTab}
          appState={appState}
          agentLog={agentLog}
        />

        <ActionBar
          appState={appState}
          mode={mode}
          setMode={handleModeChange}
          filesRemaining={filesRemaining}
          pendingReview={pendingReview}
          onPlan={handlePlan}
          onDebug={handleDebug}
          onBuildStart={() => buildNext()}
          onBuildNext={() => buildNext()}
          onAutoAll={handleAutoAll}
          onNeverAsk={handleNeverAsk}
          onCancel={() => setAppState("idle")}
          onReset={() => setAppState("idle")}
          onApprove={handleApprove}
          onReject={handleReject}
          onDownloadZip={handleDownloadZip}
        />
      </div>
    </div>
  );
}
