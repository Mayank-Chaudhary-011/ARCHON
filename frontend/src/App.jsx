import { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { v4 as uuid } from "uuid";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import Sidebar from "../components/Sidebar";
import Editor from "../components/Editor";
import ActionBar from "../components/ActionBar";

const API = "http://localhost:8000/api";

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
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem("archon_api_key") || ""
  );
  const [showKeyInput, setShowKeyInput] = useState(
    () => !localStorage.getItem("archon_api_key")
  );

  function saveApiKey(key) {
    const trimmed = key.trim();
    localStorage.setItem("archon_api_key", trimmed);
    setApiKey(trimmed);
    setShowKeyInput(false);
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

  // Auto build loop — only fires when there are files still remaining.
  // filesRemaining > 0 guard prevents a second buildNext() when the last
  // file finishes (buildNext already calls itself in that branch).
  useEffect(() => {
    if (autoMode && appState === "building" && filesRemaining > 0) {
      const timer = setTimeout(() => buildNext(), 800);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoMode, appState, filesRemaining]);

  async function handlePlan(task) {
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
      });
      const data = res.data;

      setImpl(data.implementation);
      setRemaining(data.total_files);
      setFiles({
        "Agent Pipeline": "",
        "plan.md": data.plan_md
      });
      setOpenTabs(["Agent Pipeline", "plan.md"]);
      setActiveFile("Agent Pipeline");
      setAppState("plan_ready");

      // Initialise task checklist from the file list
      const files = data.implementation?.files || [];
      setTaskChecklist(files.map((f) => ({ filename: f.filename, description: f.description, status: "pending" })));

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

  // ── History helpers ──────────────────────────────────────────────
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

  async function buildNext() {
    setAppState("building");
    log("CODER", "Generating next file...");

    // Mark next pending file as 'building' in the checklist
    setTaskChecklist((prev) => {
      const nextIdx = prev.findIndex((t) => t.status === "pending");
      if (nextIdx === -1) return prev;
      return prev.map((t, i) => (i === nextIdx ? { ...t, status: "building" } : t));
    });

    try {
      const res = await axios.post(`${API}/build/next`, {
        session_id: sessionId,
        api_key: apiKey,
      });
      const data = res.data;

      if (data.tokens) setTokenStats(data.tokens);

      // Log inner coder/critic self-healing details in the UI
      if (data.logs && data.logs.length > 0) {
        data.logs.forEach((item) => {
          log(item.agent, item.message);
        });
      }

      // Human review escalation — critic failed 3 times
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
        // Save to local history — zero extra tokens
        saveToHistory(implementation, finalFiles, data.tokens || tokenStats, data.output);
        log("EXECUTOR", `Done. Output: ${data.output || "no output"}`);
        toast.success("Project built successfully ✨");
        return;
      }

      if (data.status === "file_ready") {
        setFiles((prev) => ({ ...prev, [data.filename]: data.code }));
        openTab(data.filename);
        setRemaining(data.files_remaining);
        // Mark this file as done
        setTaskChecklist((prev) =>
          prev.map((t) => (t.filename === data.filename ? { ...t, status: "done" } : t))
        );
        log("CODER", `${data.filename} ready`);

        if (data.files_remaining === 0) {
          // Last file done — call buildNext ONCE to trigger sandbox execution.
          // Do NOT set autoMode here; the useEffect guard (filesRemaining > 0)
          // ensures it won't also fire a duplicate call.
          buildNext();
        } else if (!autoMode) {
          // Manual mode: pause and wait for user to click Build Next
          setAppState("plan_ready");
        }
        // autoMode && files_remaining > 0 → useEffect will schedule next call
      }
    } catch (e) {
      log("ERROR", e.message);
      toast.error("Build failed");
      setAppState("plan_ready");
    }
  }

  function handleAutoAll() {
    // Start immediately. autoMode=true is set after the first buildNext call
    // so the useEffect doesn't also fire a concurrent second request.
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
      });
      const data = res.data;

      const files = { "fixed_code.py": data.fixed_code };
      setFiles(files);
      openTab("fixed_code.py");
      setOutput(data.output);

      if (data.tokens) setTokenStats(data.tokens);
      setAppState("complete");

      // Save debug run to history list
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
      {/* ── API Key Banner ───────────────────────────── */}
      {showKeyInput && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999,
          background: "#0d1117", borderBottom: "1px solid #30363d",
          padding: "10px 20px", display: "flex", alignItems: "center", gap: "10px"
        }}>
          <span style={{ color: "#e6edf3", fontSize: "13px", fontFamily: "Inter,sans-serif", whiteSpace: "nowrap" }}>
            🔑 Enter your OpenAI API key to use ARCHON:
          </span>
          <input
            id="api-key-input"
            type="password"
            placeholder="sk-proj-..."
            defaultValue={apiKey}
            style={{
              flex: 1, maxWidth: "420px", padding: "6px 12px",
              borderRadius: "6px", border: "1px solid #30363d",
              background: "#161b22", color: "#e6edf3",
              fontFamily: "monospace", fontSize: "13px", outline: "none"
            }}
            onKeyDown={e => e.key === "Enter" && saveApiKey(e.target.value)}
          />
          <button
            onClick={() => saveApiKey(document.getElementById("api-key-input").value)}
            style={{
              padding: "6px 16px", borderRadius: "6px", border: "none",
              background: "#238636", color: "#fff", fontFamily: "Inter,sans-serif",
              fontSize: "13px", cursor: "pointer", fontWeight: 600
            }}
          >Save</button>
          <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer"
            style={{ color: "#58a6ff", fontSize: "12px", fontFamily: "Inter,sans-serif", marginLeft: "4px" }}>
            Get a key ↗
          </a>
        </div>
      )}
      {!showKeyInput && (
        <button
          onClick={() => setShowKeyInput(true)}
          title="Change API key"
          style={{
            position: "fixed", top: "10px", right: "14px", zIndex: 9999,
            background: "#161b22", border: "1px solid #30363d", borderRadius: "6px",
            color: "#8b949e", padding: "4px 10px", fontSize: "11px",
            cursor: "pointer", fontFamily: "Inter,sans-serif"
          }}
        >🔑 API Key</button>
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
