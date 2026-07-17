import { useEffect, useState } from "react";

// SVG Icons to replace emojis professionally
const Icons = {
  trigger: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  orchestrator: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  critic: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  executor: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  ),
  debugger: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  gpt: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      <path d="M2 12h20" />
    </svg>
  ),
  supabase: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
    </svg>
  ),
  docker: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
    </svg>
  )
};

export default function VisualGraph({ appState, agentLog = [] }) {
  const [activeNode, setActiveNode] = useState(null);
  const [pathState, setPathState] = useState("idle");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (appState === "idle") {
        setActiveNode(null);
        setPathState("idle");
        return;
      }

      if (appState === "planning") {
        setActiveNode("trigger");
        setPathState("planning");
        return;
      }

      if (appState === "complete") {
        setActiveNode("executor");
        setPathState("complete");
        return;
      }

      if (appState === "human_review") {
        setActiveNode("critic");
        setPathState("healing");
        return;
      }

      if (appState === "building" && agentLog.length > 0) {
        const lastEntry = agentLog[agentLog.length - 1];
        const agent = lastEntry.agent?.toUpperCase();
        const message = lastEntry.message?.toLowerCase() || "";

        if (agent === "PLANNER") {
          setActiveNode("orchestrator");
          setPathState("planning");
        } else if (agent === "CODER") {
          setActiveNode("orchestrator");
          setPathState("coding");
        } else if (agent === "CRITIC") {
          setActiveNode("critic");
          setPathState("reviewing");
        } else if (agent === "SYSTEM" && message.includes("self-healing")) {
          setActiveNode("debugger");
          setPathState("healing");
        } else {
          if (message.includes("generate") || message.includes("coder")) {
            setActiveNode("orchestrator");
            setPathState("coding");
          } else if (message.includes("review") || message.includes("critic")) {
            setActiveNode("critic");
            setPathState("reviewing");
          }
        }
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [appState, agentLog]);

  const isNodeActive = (id) => activeNode === id;
  const isNodeDone = (id) => {
    if (appState === "complete") return true;
    if (id === "trigger" && ["building", "complete", "human_review"].includes(appState)) return true;
    return false;
  };

  // Coordinates matching the workflow structure
  const triggerNode = { x: 30, y: 110, w: 100, h: 70, label: "On Request", desc: "Trigger Input", color: "#60a5fa", key: "trigger" };
  const orchestratorNode = { x: 210, y: 100, w: 150, h: 90, label: "ARCHON Agent", desc: "Orchestration Engine", color: "#fbbf24", key: "orchestrator" };
  const criticNode = { x: 440, y: 110, w: 110, h: 70, label: "Is Code Valid?", desc: "Self-Heal Router", color: "#a78bfa", key: "critic" };
  const executorNode = { x: 620, y: 50, w: 120, h: 70, label: "Sandbox Run", desc: "Execute Tests", color: "#34d399", key: "executor" };
  const debuggerNode = { x: 620, y: 170, w: 120, h: 70, label: "Auto Debugger", desc: "Code Correction", color: "#f87171", key: "debugger" };

  return (
    <div style={{
      width: "100%",
      height: "100%",
      backgroundColor: "#0b0b14",
      backgroundImage: "radial-gradient(#1e1e2f 1.2px, transparent 1.2px)",
      backgroundSize: "20px 20px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      padding: "20px",
      overflow: "hidden",
      userSelect: "none"
    }}>
      {/* Workflow Top Indicator */}
      <div style={{
        position: "absolute",
        top: "20px",
        textAlign: "center",
        zIndex: 10
      }}>
        <span style={{
          fontSize: "11px",
          color: "#8a8a9a",
          fontWeight: 600,
          background: "#161622",
          border: "1px solid #1e1e2e",
          padding: "4px 12px",
          borderRadius: "100px",
          letterSpacing: "0.05em"
        }}>
          {appState === "idle" && "🔴 IDLE — AWAITING TRIGGER"}
          {appState === "planning" && "⚡ TRIGGER ACTIVATED — PLANNING"}
          {appState === "building" && "🔄 AGENT LOOP RUNNING"}
          {appState === "human_review" && "⚠️ ESCALATION WAITING FOR REVIEW"}
          {appState === "complete" && "🟢 WORKFLOW COMPLETED SUCCESS"}
        </span>
      </div>

      <svg width="780" height="360" style={{ overflow: "visible" }}>
        <defs>
          {/* Glowing Filters */}
          <filter id="glow-active" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ── CONNECTION LINES (CURVED BEZIER BEHIND) ── */}

        {/* Path 1: Trigger -> Orchestrator */}
        <path 
          d={`M ${triggerNode.x + triggerNode.w} ${triggerNode.y + triggerNode.h / 2} C ${triggerNode.x + triggerNode.w + 40} ${triggerNode.y + triggerNode.h / 2}, ${orchestratorNode.x - 40} ${orchestratorNode.y + orchestratorNode.h / 2}, ${orchestratorNode.x} ${orchestratorNode.y + orchestratorNode.h / 2}`}
          stroke={["planning", "coding", "reviewing", "healing", "complete"].includes(pathState) ? "#2563eb" : "#1e1e2e"}
          strokeWidth="2.5"
          fill="none"
        />
        {pathState === "planning" && (
          <path 
            d={`M ${triggerNode.x + triggerNode.w} ${triggerNode.y + triggerNode.h / 2} C ${triggerNode.x + triggerNode.w + 40} ${triggerNode.y + triggerNode.h / 2}, ${orchestratorNode.x - 40} ${orchestratorNode.y + orchestratorNode.h / 2}, ${orchestratorNode.x} ${orchestratorNode.y + orchestratorNode.h / 2}`}
            stroke="#60a5fa"
            strokeWidth="2.5"
            strokeDasharray="6, 6"
            className="pulse-flow"
            fill="none"
          />
        )}

        {/* Path 2: Orchestrator -> Router */}
        <path 
          d={`M ${orchestratorNode.x + orchestratorNode.w} ${orchestratorNode.y + orchestratorNode.h / 2} C ${orchestratorNode.x + orchestratorNode.w + 40} ${orchestratorNode.y + orchestratorNode.h / 2}, ${criticNode.x - 40} ${criticNode.y + criticNode.h / 2}, ${criticNode.x} ${criticNode.y + criticNode.h / 2}`}
          stroke={["coding", "reviewing", "healing", "complete"].includes(pathState) ? "#fbbf24" : "#1e1e2e"}
          strokeWidth="2.5"
          fill="none"
        />
        {pathState === "coding" && (
          <path 
            d={`M ${orchestratorNode.x + orchestratorNode.w} ${orchestratorNode.y + orchestratorNode.h / 2} C ${orchestratorNode.x + orchestratorNode.w + 40} ${orchestratorNode.y + orchestratorNode.h / 2}, ${criticNode.x - 40} ${criticNode.y + criticNode.h / 2}, ${criticNode.x} ${criticNode.y + criticNode.h / 2}`}
            stroke="#fbbf24"
            strokeWidth="2.5"
            strokeDasharray="6, 6"
            className="pulse-flow"
            fill="none"
          />
        )}

        {/* Path 3: Router -> Executor (True Branch) */}
        <path 
          d={`M ${criticNode.x + criticNode.w} ${criticNode.y + 20} C ${criticNode.x + criticNode.w + 40} ${criticNode.y + 20}, ${executorNode.x - 40} ${executorNode.y + executorNode.h / 2}, ${executorNode.x} ${executorNode.y + executorNode.h / 2}`}
          stroke={pathState === "complete" ? "#34d399" : "#1e1e2e"}
          strokeWidth="2.5"
          fill="none"
        />
        {pathState === "complete" && (
          <path 
            d={`M ${criticNode.x + criticNode.w} ${criticNode.y + 20} C ${criticNode.x + criticNode.w + 40} ${criticNode.y + 20}, ${executorNode.x - 40} ${executorNode.y + executorNode.h / 2}, ${executorNode.x} ${executorNode.y + executorNode.h / 2}`}
            stroke="#34d399"
            strokeWidth="2.5"
            strokeDasharray="6, 6"
            className="pulse-flow"
            fill="none"
          />
        )}

        {/* Path 4: Router -> Debugger (False Branch) */}
        <path 
          d={`M ${criticNode.x + criticNode.w} ${criticNode.y + 50} C ${criticNode.x + criticNode.w + 40} ${criticNode.y + 50}, ${debuggerNode.x - 40} ${debuggerNode.y + debuggerNode.h / 2}, ${debuggerNode.x} ${debuggerNode.y + debuggerNode.h / 2}`}
          stroke={pathState === "healing" ? "#f87171" : "#1e1e2e"}
          strokeWidth="2.5"
          fill="none"
        />
        {pathState === "healing" && activeNode === "debugger" && (
          <path 
            d={`M ${criticNode.x + criticNode.w} ${criticNode.y + 50} C ${criticNode.x + criticNode.w + 40} ${criticNode.y + 50}, ${debuggerNode.x - 40} ${debuggerNode.y + debuggerNode.h / 2}, ${debuggerNode.x} ${debuggerNode.y + debuggerNode.h / 2}`}
            stroke="#f87171"
            strokeWidth="2.5"
            strokeDasharray="6, 6"
            className="pulse-flow"
            fill="none"
          />
        )}

        {/* Path 5: Debugger -> Orchestrator (Feedback loop back) */}
        <path 
          d={`M ${debuggerNode.x + debuggerNode.w / 2} ${debuggerNode.y + debuggerNode.h} C ${debuggerNode.x + debuggerNode.w / 2} ${debuggerNode.y + debuggerNode.h + 50}, ${orchestratorNode.x + orchestratorNode.w / 2} ${orchestratorNode.y + orchestratorNode.h + 100}, ${orchestratorNode.x + orchestratorNode.w / 2} ${orchestratorNode.y + orchestratorNode.h}`}
          stroke={pathState === "healing" ? "#f87171" : "#1e1e2e"}
          strokeWidth="2"
          strokeDasharray={pathState === "healing" ? "none" : "4, 4"}
          fill="none"
        />

        {/* ── DASHED PORTS UNDER THE AGENT (Dangling Model/Memory Configs) ── */}
        
        {/* Connection to OpenAI */}
        <path d="M 240 190 Q 240 230 220 250" stroke="#2a2a3a" strokeWidth="1.5" strokeDasharray="3,3" fill="none" />
        {/* Connection to Supabase */}
        <path d="M 285 190 Q 285 230 285 250" stroke="#2a2a3a" strokeWidth="1.5" strokeDasharray="3,3" fill="none" />
        {/* Connection to Docker Sandbox */}
        <path d="M 330 190 Q 330 230 350 250" stroke="#2a2a3a" strokeWidth="1.5" strokeDasharray="3,3" fill="none" />

        {/* Model Icon Node */}
        <circle cx="220" cy="250" r="18" fill="#161622" stroke="#2a2a3a" strokeWidth="1.5" />
        <g transform="translate(212, 242)" style={{ color: "#8a8a9a" }}>{Icons.gpt()}</g>
        <text x="220" y="282" textAnchor="middle" fontSize="8" fill="#52526a" fontWeight="bold">GPT-4o</text>

        {/* Memory Icon Node */}
        <circle cx="285" cy="250" r="18" fill="#161622" stroke="#2a2a3a" strokeWidth="1.5" />
        <g transform="translate(277, 242)" style={{ color: "#8a8a9a" }}>{Icons.supabase()}</g>
        <text x="285" y="282" textAnchor="middle" fontSize="8" fill="#52526a" fontWeight="bold">Supabase</text>

        {/* Sandbox Icon Node */}
        <circle cx="350" cy="250" r="18" fill="#161622" stroke="#2a2a3a" strokeWidth="1.5" />
        <g transform="translate(342, 242)" style={{ color: "#8a8a9a" }}>{Icons.docker()}</g>
        <text x="350" y="282" textAnchor="middle" fontSize="8" fill="#52526a" fontWeight="bold">Docker</text>


        {/* ── 1. TRIGGER NODE (D-Arch Shape) ── */}
        <foreignObject x={triggerNode.x} y={triggerNode.y} width={triggerNode.w} height={triggerNode.h}>
          <div 
            style={{
              width: `${triggerNode.w - 4}px`,
              height: `${triggerNode.h - 4}px`,
              background: isNodeActive("trigger") ? "rgba(37, 99, 235, 0.15)" : "#161622",
              border: `2.5px solid ${isNodeDone("trigger") ? "#34d399" : isNodeActive("trigger") ? "#2563eb" : "#2a2a3a"}`,
              borderTopRightRadius: "30px",
              borderBottomRightRadius: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: isNodeActive("trigger") ? "0 0 10px rgba(37,99,235,0.25)" : "none",
              color: isNodeActive("trigger") || isNodeDone("trigger") ? "#2563eb" : "#8a8a9a"
            }}
          >
            <div style={{ display: "flex", flexShrink: 0 }}>
              {Icons.trigger()}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "9px", fontWeight: 700, fontFamily: "Outfit, sans-serif", color: "#fff" }}>TRIGGER</span>
              <span style={{ fontSize: "7px", color: "#52526a", marginTop: "1px" }}>On Request</span>
            </div>
          </div>
        </foreignObject>
        <circle cx={triggerNode.x + triggerNode.w - 2} cy={triggerNode.y + triggerNode.h / 2} r="4" fill="#2a2a3a" stroke="#fff" strokeWidth="1" />

        {/* ── 2. ORCHESTRATOR NODE ── */}
        <foreignObject x={orchestratorNode.x} y={orchestratorNode.y} width={orchestratorNode.w} height={orchestratorNode.h}>
          <div 
            style={{
              width: `${orchestratorNode.w - 4}px`,
              height: `${orchestratorNode.h - 4}px`,
              background: "#161622",
              border: `2px solid ${isNodeActive("orchestrator") ? "#fbbf24" : isNodeDone("orchestrator") ? "#34d399" : "#2a2a3a"}`,
              borderRadius: "10px",
              padding: "10px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: isNodeActive("orchestrator") ? "0 0 12px rgba(251,191,36,0.25)" : "none"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ color: isNodeActive("orchestrator") ? "#fbbf24" : "#8a8a9a" }}>
                {Icons.orchestrator()}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "10px", fontWeight: 800, color: "#fff", fontFamily: "Outfit, sans-serif" }}>ARCHON Agent</span>
                <span style={{ fontSize: "7px", color: "#52526a" }}>Coder Node</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "4px", fontSize: "7px", color: "#8a8a9a" }}>
              <span style={{ background: "#2a2a3a", padding: "1px 4px", borderRadius: "2px" }}>Chat Model</span>
              <span style={{ background: "#2a2a3a", padding: "1px 4px", borderRadius: "2px" }}>Memory</span>
              <span style={{ background: "#2a2a3a", padding: "1px 4px", borderRadius: "2px" }}>Sandbox</span>
            </div>
          </div>
        </foreignObject>
        <circle cx={orchestratorNode.x} cy={orchestratorNode.y + orchestratorNode.h / 2} r="4" fill="#2a2a3a" stroke="#fff" strokeWidth="1" />
        <circle cx={orchestratorNode.x + orchestratorNode.w} cy={orchestratorNode.y + orchestratorNode.h / 2} r="4" fill="#2a2a3a" stroke="#fff" strokeWidth="1" />

        {/* ── 3. ROUTER NODE ── */}
        <foreignObject x={criticNode.x} y={criticNode.y} width={criticNode.w} height={criticNode.h}>
          <div 
            style={{
              width: `${criticNode.w - 4}px`,
              height: `${criticNode.h - 4}px`,
              background: "#161622",
              border: `2px solid ${isNodeActive("critic") ? "#a78bfa" : "#2a2a3a"}`,
              borderRadius: "10px",
              padding: "10px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: isNodeActive("critic") ? "0 0 10px rgba(167,139,250,0.25)" : "none"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ color: isNodeActive("critic") ? "#a78bfa" : "#8a8a9a" }}>
                {Icons.critic()}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "9px", fontWeight: 800, color: "#fff", fontFamily: "Outfit, sans-serif" }}>Critic review?</span>
                <span style={{ fontSize: "7px", color: "#52526a" }}>Verification checks</span>
              </div>
            </div>
          </div>
        </foreignObject>
        <circle cx={criticNode.x} cy={criticNode.y + criticNode.h / 2} r="4" fill="#2a2a3a" stroke="#fff" strokeWidth="1" />
        <circle cx={criticNode.x + criticNode.w} cy={criticNode.y + 20} r="4" fill="#2a2a3a" stroke="#fff" strokeWidth="1" />
        <text x={criticNode.x + criticNode.w - 18} y="134" fontSize="8" fill="#52526a" fontWeight="bold">true</text>
        
        <circle cx={criticNode.x + criticNode.w} cy={criticNode.y + 50} r="4" fill="#2a2a3a" stroke="#fff" strokeWidth="1" />
        <text x={criticNode.x + criticNode.w - 22} y="164" fontSize="8" fill="#52526a" fontWeight="bold">false</text>

        {/* ── 4. EXECUTOR NODE ── */}
        <foreignObject x={executorNode.x} y={executorNode.y} width={executorNode.w} height={executorNode.h}>
          <div 
            style={{
              width: `${executorNode.w - 4}px`,
              height: `${executorNode.h - 4}px`,
              background: "#161622",
              border: `2px solid ${appState === "complete" ? "#34d399" : "#2a2a3a"}`,
              borderRadius: "10px",
              padding: "10px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: appState === "complete" ? "0 0 12px rgba(52,211,153,0.3)" : "none"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ color: appState === "complete" ? "#34d399" : "#8a8a9a" }}>
                {Icons.executor()}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "9px", fontWeight: 800, color: "#fff", fontFamily: "Outfit, sans-serif" }}>Sandbox Run</span>
                <span style={{ fontSize: "7px", color: "#52526a" }}>Execute code</span>
              </div>
            </div>
          </div>
        </foreignObject>
        <circle cx={executorNode.x} cy={executorNode.y + executorNode.h / 2} r="4" fill="#2a2a3a" stroke="#fff" strokeWidth="1" />

        {/* ── 5. DEBUGGER NODE ── */}
        <foreignObject x={debuggerNode.x} y={debuggerNode.y} width={debuggerNode.w} height={debuggerNode.h}>
          <div 
            style={{
              width: `${debuggerNode.w - 4}px`,
              height: `${debuggerNode.h - 4}px`,
              background: "#161622",
              border: `2px solid ${isNodeActive("debugger") ? "#f87171" : "#2a2a3a"}`,
              borderRadius: "10px",
              padding: "10px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: isNodeActive("debugger") ? "0 0 10px rgba(248,113,113,0.25)" : "none"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ color: isNodeActive("debugger") ? "#f87171" : "#8a8a9a" }}>
                {Icons.debugger()}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "9px", fontWeight: 800, color: "#fff", fontFamily: "Outfit, sans-serif" }}>Auto Debugger</span>
                <span style={{ fontSize: "7px", color: "#52526a" }}>Compiler self-heal</span>
              </div>
            </div>
          </div>
        </foreignObject>
        <circle cx={debuggerNode.x} cy={debuggerNode.y + debuggerNode.h / 2} r="4" fill="#2a2a3a" stroke="#fff" strokeWidth="1" />

      </svg>

      {/* Styled animation keyframes */}
      <style>{`
        @keyframes strokePlay {
          to {
            stroke-dashoffset: -20;
          }
        }
        .pulse-flow {
          animation: strokePlay 0.85s linear infinite;
        }
      `}</style>
    </div>
  );
}
