import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Scroll animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
  },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// ── Palette ─────────────────────────────────────────────────────────────
const BLUE = "#2563eb";
const BLUE_DK = "#1d4ed8";
const BLUE_LT = "#eff6ff";
const BLUE_BD = "#bfdbfe";

const BTN = {
  bg: "#e8734a",
  hover: "#d4623a",
  glow: "rgba(232,115,74,0.25)",
};

// ── Data ─────────────────────────────────────────────────────────────────
const AGENTS = [
  {
    label: "Planner",
    color: BLUE,
    icon: "◈",
    desc: "Breaks your task into an architecture plan",
  },
  {
    label: "Coder",
    color: "#f59e0b",
    icon: "◉",
    desc: "Writes every file with full context",
  },
  {
    label: "Critic",
    color: "#8b5cf6",
    icon: "◎",
    desc: "Reviews code for real bugs only",
  },
  {
    label: "Executor",
    color: "#06b6d4",
    icon: "◆",
    desc: "Runs code in Docker sandbox",
  },
  {
    label: "Debugger",
    color: "#10b981",
    icon: "◇",
    desc: "Self-heals errors automatically",
  },
];

const FEATURES = [
  {
    icon: "⬡",
    color: BLUE,
    bg: BLUE_LT,
    title: "Multi-Agent Orchestration",
    desc: "5 specialized agents coordinated by LangGraph. Not a chatbot — a system where each agent has one job and does it well.",
  },
  {
    icon: "↺",
    color: "#06b6d4",
    bg: "#ecfeff",
    title: "Self-Healing Code",
    desc: "When code fails the critic, ARCHON retries with exact feedback — up to 3 attempts before asking you to step in.",
  },
  {
    icon: "◈",
    color: "#8b5cf6",
    bg: "#f5f3ff",
    title: "Vector Memory",
    desc: "Every build is stored as an embedding in Supabase. Future similar tasks reuse past solutions.",
  },
  {
    icon: "⬟",
    color: "#10b981",
    bg: "#ecfdf5",
    title: "Human-in-the-Loop Gate",
    desc: "When AI can't solve a problem after 3 tries, it shows you the critic feedback and waits.",
  },
  {
    icon: "⬛",
    color: "#f59e0b",
    bg: "#fffbeb",
    title: "Real Code Execution",
    desc: "Generated code runs in an isolated Docker container. Real output, real errors — not simulated.",
  },
  {
    icon: "⬢",
    color: "#e8734a",
    bg: "#fff5f0",
    title: "Inter-File Context",
    desc: "Each file is generated knowing every already-written file. No broken imports. No mismatched IDs.",
  },
];

const STACK = [
  { name: "LangGraph", role: "Agent orchestration", color: BLUE },
  { name: "GPT-4o", role: "Planning + review", color: "#8b5cf6" },
  { name: "GPT-4o-mini", role: "Code generation", color: "#f59e0b" },
  { name: "FastAPI", role: "Backend API", color: "#10b981" },
  { name: "React 19", role: "Frontend UI", color: "#06b6d4" },
  { name: "Supabase", role: "Vector memory", color: "#8b5cf6" },
  { name: "Docker", role: "Code sandbox", color: "#f59e0b" },
  { name: "pgvector", role: "Embedding search", color: BLUE },
  { name: "Framer Motion", role: "Animations", color: "#e8734a" },
];

const HERO_LINES = [
  { text: '$ archon build "portfolio website"', color: "#ededf0", tag: null },
  { text: "", color: "", tag: null },
  {
    text: "Analyzing task...",
    color: "#8a8a9a",
    tag: { label: "PLANNER", color: "#60a5fa" },
  },
  {
    text: "Plan ready — 3 files to generate",
    color: "#8a8a9a",
    tag: { label: "PLANNER", color: "#60a5fa" },
  },
  {
    text: "Generating index.html...",
    color: "#8a8a9a",
    tag: { label: "CODER", color: "#fbbf24" },
  },
  { text: "<!DOCTYPE html>", color: "#34d399", tag: null, indent: 2 },
  { text: '<html lang="en">', color: "#60a5fa", tag: null, indent: 2 },
  {
    text: "  <title>Portfolio</title>",
    color: "#f0f0f0",
    tag: null,
    indent: 2,
  },
  {
    text: "index.html ready",
    color: "#8a8a9a",
    tag: { label: "CODER", color: "#fbbf24" },
  },
  {
    text: "Reviewing index.html...",
    color: "#8a8a9a",
    tag: { label: "CRITIC", color: "#a78bfa" },
  },
  {
    text: "✅ PASS — no issues found",
    color: "#34d399",
    tag: { label: "CRITIC", color: "#34d399" },
  },
  {
    text: "Running in Docker sandbox...",
    color: "#8a8a9a",
    tag: { label: "EXECUTOR", color: "#22d3ee" },
  },
  {
    text: "Output: Portfolio served on :3000 ✓",
    color: "#34d399",
    tag: { label: "EXECUTOR", color: "#22d3ee" },
  },
];

const CODE_LINES = [
  { text: "# Task: Build a terminal portfolio", color: "#52526a", indent: 0 },
  { text: "def generate_portfolio():", color: "#60a5fa", indent: 0 },
  { text: "    title = 'Mayank Chaudhary'", color: "#34d399", indent: 1 },
  { text: "    skills = ['Python', 'React',", color: "#fbbf24", indent: 1 },
  { text: "              'LangGraph', 'RAG']", color: "#fbbf24", indent: 1 },
  { text: "    projects = load_from_db()", color: "#f0f0f0", indent: 1 },
  { text: "    return render_html(title,", color: "#f0f0f0", indent: 1 },
  { text: "                       skills,", color: "#f0f0f0", indent: 1 },
  { text: "                       projects)", color: "#f0f0f0", indent: 1 },
  { text: "", color: "#f0f0f0", indent: 0 },
  { text: "# ✅  CRITIC: PASS — file complete", color: "#34d399", indent: 0 },
];

// ── Mobile hook ──────────────────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

export default function Landing() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.background = "#fafbff";
    document.body.style.overflow = "auto";
    document.body.style.height = "auto";
    return () => {
      document.body.style.background = "";
      document.body.style.overflow = "";
      document.body.style.height = "";
    };
  }, []);

  return (
    <div
      style={{
        background: "#fafbff",
        color: "#0f0f23",
        fontFamily: "'Inter', sans-serif",
        minHeight: "100vh",
      }}
    >
      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: isMobile ? "0 20px" : "0 48px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(250,251,255,0.88)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid #e8eaf6",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "9px",
              background: `linear-gradient(135deg, ${BLUE}, ${BLUE_DK})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 2px 12px ${BTN.glow}`,
            }}
          >
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "9px",
                fontWeight: 900,
                color: "#93c5fd",
                letterSpacing: "-0.5px",
              }}
            >
              &lt;/&gt;
            </span>
          </div>
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              fontSize: "17px",
              letterSpacing: "0.05em",
              background: `linear-gradient(135deg, ${BLUE_DK}, ${BLUE})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            ARCHON
          </span>
        </div>

        {/* Desktop nav links */}
        {!isMobile && (
          <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
            {["Features", "How It Works", "Stack"].map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase().replace(/\s+/g, "-")}`}
                style={{
                  color: "#6b7280",
                  fontSize: "14px",
                  textDecoration: "none",
                  fontWeight: 500,
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#0f0f23")}
                onMouseLeave={(e) => (e.target.style.color = "#6b7280")}
              >
                {l}
              </a>
            ))}
            <button
              onClick={() =>
                window.open(
                  "https://github.com/Mayank-Chaudhary-011/ARCHON.git",
                )
              }
              style={{
                padding: "9px 22px",
                borderRadius: "9px",
                border: "none",
                cursor: "pointer",
                background: BTN.bg,
                color: "#fff",
                fontSize: "14px",
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                boxShadow: `0 2px 12px ${BTN.glow}`,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = BTN.hover;
                e.target.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = BTN.bg;
                e.target.style.transform = "translateY(0)";
              }}
            >
              Codebase →
            </button>
          </div>
        )}

        {/* Mobile hamburger */}
        {isMobile && (
          <button
            onClick={() => setMobileMenuOpen((o) => !o)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              display: "flex",
              flexDirection: "column",
              gap: "5px",
            }}
          >
            <div
              style={{
                width: "22px",
                height: "2px",
                background: "#0f0f23",
                borderRadius: "2px",
                transition: "transform 0.2s",
                transform: mobileMenuOpen
                  ? "rotate(45deg) translateY(7px)"
                  : "none",
              }}
            />
            <div
              style={{
                width: "22px",
                height: "2px",
                background: "#0f0f23",
                borderRadius: "2px",
                opacity: mobileMenuOpen ? 0 : 1,
                transition: "opacity 0.2s",
              }}
            />
            <div
              style={{
                width: "22px",
                height: "2px",
                background: "#0f0f23",
                borderRadius: "2px",
                transition: "transform 0.2s",
                transform: mobileMenuOpen
                  ? "rotate(-45deg) translateY(-7px)"
                  : "none",
              }}
            />
          </button>
        )}
      </nav>

      {/* Mobile menu dropdown */}
      {isMobile && mobileMenuOpen && (
        <div
          style={{
            position: "fixed",
            top: "64px",
            left: 0,
            right: 0,
            zIndex: 99,
            background: "rgba(250,251,255,0.97)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid #e8eaf6",
            padding: "16px 20px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          {["Features", "How It Works", "Stack"].map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                color: "#6b7280",
                fontSize: "15px",
                textDecoration: "none",
                fontWeight: 500,
                padding: "10px 0",
                borderBottom: "1px solid #f0f2fa",
              }}
            >
              {l}
            </a>
          ))}
          <button
            onClick={() =>
              window.open("https://github.com/Mayank-Chaudhary-011/ARCHON.git")
            }
            style={{
              marginTop: "12px",
              padding: "12px 22px",
              borderRadius: "9px",
              border: "none",
              cursor: "pointer",
              background: BTN.bg,
              color: "#fff",
              fontSize: "14px",
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Codebase →
          </button>
        </div>
      )}

      {/* ── Hero ────────────────────────────────────────────── */}
      <section
        style={{
          paddingTop: "100px",
          paddingBottom: isMobile ? "60px" : "80px",
          paddingLeft: isMobile ? "20px" : "24px",
          paddingRight: isMobile ? "20px" : "24px",
          maxWidth: "1100px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? "40px" : "80px",
          alignItems: "center",
        }}
      >
        {/* Left — text */}
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "100px",
              background: BLUE_LT,
              border: `1px solid ${BLUE_BD}`,
              marginBottom: "28px",
              fontSize: "12px",
              color: BLUE,
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#10b981",
                display: "inline-block",
                animation: "pulse 2s infinite",
              }}
            />
            Multi-agent · Self-healing · Open source
          </div>

          <h1
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: isMobile
                ? "clamp(32px, 10vw, 48px)"
                : "clamp(36px, 5vw, 60px)",
              fontWeight: 900,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              marginBottom: "24px",
            }}
          >
            <span style={{ color: "#0f0f23" }}>The AI that</span>
            <br />
            <span
              style={{
                background: `linear-gradient(135deg, ${BLUE_DK} 0%, ${BLUE} 50%, #06b6d4 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              builds software
            </span>
            <br />
            <span style={{ color: "#0f0f23" }}>for you.</span>
          </h1>

          <p
            style={{
              fontSize: isMobile ? "15px" : "17px",
              color: "#6b7280",
              lineHeight: 1.7,
              marginBottom: "40px",
              maxWidth: "440px",
            }}
          >
            Describe what you want to build. ARCHON's five specialized agents
            plan, write, review, execute and self-heal — completely
            autonomously.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
            <button
              onClick={() => navigate("/app")}
              style={{
                padding: isMobile ? "13px 28px" : "14px 32px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                background: BTN.bg,
                color: "#fff",
                fontSize: isMobile ? "14px" : "15px",
                fontWeight: 700,
                fontFamily: "'Inter', sans-serif",
                boxShadow: `0 4px 20px ${BTN.glow}`,
                transition: "all 0.2s",
                width: isMobile ? "100%" : "auto",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = BTN.hover;
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = BTN.bg;
                e.target.style.transform = "translateY(0)";
              }}
            >
              Start Building →
            </button>
            <a
              href="https://www.loom.com/share/14aabde31d33410b9842fe900de06637"
              target="_blank"
              rel="noreferrer"
              style={{
                padding: isMobile ? "13px 20px" : "14px 24px",
                borderRadius: "10px",
                border: "1px solid #d1d5db",
                textDecoration: "none",
                color: "#374151",
                fontSize: isMobile ? "13px" : "14px",
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                transition: "all 0.2s",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "#fff",
                width: isMobile ? "100%" : "auto",
                justifyContent: "center",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f9fafb";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              📺 Build Demo
            </a>
            <a
              href="https://www.loom.com/share/d35d5eda4a13437c972a946c64343b2e"
              target="_blank"
              rel="noreferrer"
              style={{
                padding: isMobile ? "13px 20px" : "14px 24px",
                borderRadius: "10px",
                border: "1px solid #d1d5db",
                textDecoration: "none",
                color: "#374151",
                fontSize: isMobile ? "13px" : "14px",
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                transition: "all 0.2s",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "#fff",
                width: isMobile ? "100%" : "auto",
                justifyContent: "center",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f9fafb";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              📺 Debug Demo
            </a>
          </div>

          {/* Stats */}
          <div
            style={{
              marginTop: "40px",
              display: "flex",
              gap: isMobile ? "24px" : "32px",
            }}
          >
            {[
              ["5", "AI Agents"],
              ["100%", "Autonomous"],
              ["0", "Setup needed"],
            ].map(([val, label]) => (
              <div key={label}>
                <div
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 800,
                    fontSize: isMobile ? "20px" : "24px",
                    color: "#0f0f23",
                  }}
                >
                  {val}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#9ca3af",
                    fontWeight: 500,
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Animated Hero Terminal */}
        <div
          style={{
            width: "100%",
            borderRadius: "16px",
            overflow: "hidden",
            border: "1px solid #e8eaf6",
            boxShadow: `0 8px 40px rgba(37,99,235,0.12)`,
          }}
        >
          <div
            style={{
              background: "#1c1c28",
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: "7px",
              borderBottom: "1px solid #2a2a3a",
            }}
          >
            <div
              style={{
                width: "9px",
                height: "9px",
                borderRadius: "50%",
                background: "#f87171",
              }}
            />
            <div
              style={{
                width: "9px",
                height: "9px",
                borderRadius: "50%",
                background: "#fbbf24",
              }}
            />
            <div
              style={{
                width: "9px",
                height: "9px",
                borderRadius: "50%",
                background: "#34d399",
              }}
            />
            <span
              style={{
                marginLeft: "10px",
                fontSize: "10px",
                color: "#52526a",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              ARCHON — pipeline
            </span>
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#34d399",
                  animation: "pulse 1.5s infinite",
                }}
              />
              <span
                style={{
                  fontSize: "9px",
                  color: "#34d399",
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
                live
              </span>
            </div>
          </div>
          <div
            style={{
              background: "#09090f",
              padding: isMobile ? "12px 14px" : "16px 20px",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: isMobile ? "10px" : "12px",
              lineHeight: 1.9,
              minHeight: "240px",
              overflowX: "auto",
            }}
          >
            {HERO_LINES.map((line, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "baseline",
                  paddingLeft: line.indent ? `${line.indent * 8}px` : "0",
                  opacity: 0,
                  animation: `fadeSlide 0.35s ${0.2 + i * 0.22}s forwards`,
                  whiteSpace: "nowrap",
                }}
              >
                {line.tag && (
                  <span
                    style={{
                      fontSize: "8px",
                      fontWeight: 700,
                      padding: "1px 5px",
                      borderRadius: "3px",
                      flexShrink: 0,
                      color: line.tag.color,
                      border: `1px solid ${line.tag.color}`,
                      backgroundColor: `color-mix(in srgb, ${line.tag.color} 12%, transparent)`,
                    }}
                  >
                    {line.tag.label}
                  </span>
                )}
                <span style={{ color: line.color }}>{line.text}</span>
                {i === HERO_LINES.length - 1 && (
                  <span
                    style={{
                      display: "inline-block",
                      width: "2px",
                      height: "12px",
                      background: BLUE,
                      animation: "blink 1s step-end infinite",
                      verticalAlign: "middle",
                      marginLeft: "2px",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Animated Demo "Video" ──────────────────────────────── */}
      <section
        style={{
          padding: isMobile ? "60px 20px" : "80px 24px",
          background: "#fff",
          borderTop: "1px solid #f0f2fa",
          borderBottom: "1px solid #f0f2fa",
        }}
      >
        <div
          style={{ maxWidth: "960px", margin: "0 auto", textAlign: "center" }}
        >
          <p
            style={{
              fontSize: "12px",
              color: BLUE,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            Demo
          </p>
          <h2
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "clamp(22px, 5vw, 40px)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              marginBottom: "40px",
            }}
          >
            See ARCHON in action
          </h2>

          <div
            style={{
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 24px 64px rgba(0,0,0,0.16)",
              border: "1px solid #1e1e2e",
              textAlign: "left",
            }}
          >
            <div
              style={{
                background: "#111118",
                padding: "10px 18px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                borderBottom: "1px solid #1e1e2e",
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "#f87171",
                }}
              />
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "#fbbf24",
                }}
              />
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "#34d399",
                }}
              />
              <span
                style={{
                  marginLeft: "10px",
                  fontSize: "11px",
                  color: "#52526a",
                  fontFamily: "JetBrains Mono, monospace",
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                localhost:5173/app
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "3px 10px",
                  borderRadius: "100px",
                  background: "rgba(248,113,113,0.12)",
                  border: "1px solid rgba(248,113,113,0.3)",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#f87171",
                    animation: "pulse 1s infinite",
                  }}
                />
                <span
                  style={{
                    fontSize: "10px",
                    color: "#f87171",
                    fontFamily: "JetBrains Mono, monospace",
                    fontWeight: 700,
                  }}
                >
                  REC
                </span>
              </div>
            </div>

            {/* App simulation — stacked on mobile */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "220px 1fr",
                background: "#09090f",
                minHeight: isMobile ? "auto" : "420px",
              }}
            >
              {/* ── Sidebar ── */}
              <div
                style={{
                  borderRight: isMobile ? "none" : "1px solid #1e1e2e",
                  borderBottom: isMobile ? "1px solid #1e1e2e" : "none",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    padding: "14px 16px",
                    borderBottom: "1px solid #1e1e2e",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "6px",
                      background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "JetBrains Mono, monospace",
                        fontSize: "7px",
                        fontWeight: 900,
                        color: "#93c5fd",
                      }}
                    >
                      &lt;/&gt;
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontWeight: 700,
                      fontSize: "13px",
                      background: "linear-gradient(135deg, #c7d2fe, #93c5fd)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    ARCHON
                  </span>
                  <div
                    style={{
                      marginLeft: "auto",
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#34d399",
                      animation: "pulse 2s infinite",
                    }}
                  />
                </div>

                <div
                  style={{
                    padding: "12px 14px",
                    borderBottom: "1px solid #1e1e2e",
                  }}
                >
                  <div
                    style={{
                      fontSize: "9px",
                      color: "#52526a",
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      marginBottom: "8px",
                    }}
                  >
                    Task Progress
                  </div>
                  {["index.html", "style.css", "script.js"].map((f, i) => (
                    <div
                      key={f}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginBottom: "5px",
                        opacity: 0,
                        animation: `fadeSlide 0.3s ${1.5 + i * 0.6}s forwards`,
                      }}
                    >
                      <span
                        style={{
                          color: i < 2 ? "#34d399" : "#fbbf24",
                          fontSize: "10px",
                        }}
                      >
                        {i < 2 ? "✓" : "●"}
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          color: i < 2 ? "#ededf0" : "#fbbf24",
                          fontFamily: "JetBrains Mono, monospace",
                        }}
                      >
                        {f}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Agent log — hide on mobile to save space */}
                {!isMobile && (
                  <div
                    style={{
                      padding: "12px 14px",
                      flex: 1,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "9px",
                        color: "#52526a",
                        fontWeight: 600,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        marginBottom: "8px",
                      }}
                    >
                      Agent Log
                    </div>
                    {[
                      {
                        tag: "PLANNER",
                        color: "#60a5fa",
                        msg: "Plan ready — 3 files",
                        delay: 0.5,
                      },
                      {
                        tag: "CODER",
                        color: "#fbbf24",
                        msg: "index.html...",
                        delay: 1.2,
                      },
                      {
                        tag: "CRITIC",
                        color: "#34d399",
                        msg: "✓ PASS",
                        delay: 2.0,
                      },
                      {
                        tag: "CODER",
                        color: "#fbbf24",
                        msg: "style.css...",
                        delay: 2.6,
                      },
                      {
                        tag: "CRITIC",
                        color: "#34d399",
                        msg: "✓ PASS",
                        delay: 3.2,
                      },
                      {
                        tag: "EXECUTOR",
                        color: "#22d3ee",
                        msg: "Done. Output: ✓",
                        delay: 3.8,
                      },
                    ].map((l, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          gap: "5px",
                          alignItems: "flex-start",
                          marginBottom: "4px",
                          opacity: 0,
                          animation: `fadeSlide 0.3s ${l.delay}s forwards`,
                        }}
                      >
                        <span
                          style={{
                            fontSize: "8px",
                            fontWeight: 700,
                            padding: "1px 4px",
                            borderRadius: "3px",
                            color: l.color,
                            border: `1px solid ${l.color}`,
                            backgroundColor: `color-mix(in srgb, ${l.color} 10%, transparent)`,
                            flexShrink: 0,
                            fontFamily: "JetBrains Mono, monospace",
                          }}
                        >
                          {l.tag}
                        </span>
                        <span
                          style={{
                            fontSize: "10px",
                            color: "#8a8a9a",
                            fontFamily: "JetBrains Mono, monospace",
                            lineHeight: 1.4,
                          }}
                        >
                          {l.msg}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div
                  style={{
                    padding: "10px 14px",
                    borderTop: "1px solid #1e1e2e",
                    opacity: 0,
                    animation: "fadeSlide 0.4s 4.2s forwards",
                  }}
                >
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#34d399",
                      fontFamily: "JetBrains Mono, monospace",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span>✓</span> Build complete
                  </div>
                </div>
              </div>

              {/* ── Editor ── */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    borderBottom: "1px solid #1e1e2e",
                    padding: "0 16px",
                    display: "flex",
                    gap: "0",
                    background: "#0f0f18",
                  }}
                >
                  {["index.html", "style.css"].map((tab, i) => (
                    <div
                      key={tab}
                      style={{
                        padding: "10px 16px",
                        fontSize: "11px",
                        fontFamily: "JetBrains Mono, monospace",
                        color: i === 0 ? "#ededf0" : "#52526a",
                        borderBottom:
                          i === 0
                            ? `2px solid ${BLUE}`
                            : "2px solid transparent",
                        opacity: 0,
                        animation: `fadeSlide 0.3s ${1.0 + i * 0.4}s forwards`,
                      }}
                    >
                      {tab}
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    padding: isMobile ? "12px 14px" : "16px 20px",
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: isMobile ? "10px" : "12px",
                    lineHeight: 1.85,
                    flex: 1,
                    overflowX: "auto",
                  }}
                >
                  {[
                    { n: 1, color: "#52526a", text: "<!DOCTYPE html>" },
                    { n: 2, color: "#60a5fa", text: '<html lang="en">' },
                    { n: 3, color: "#60a5fa", text: "  <head>" },
                    {
                      n: 4,
                      color: "#f0f0f0",
                      text: '    <meta charset="UTF-8">',
                    },
                    {
                      n: 5,
                      color: "#34d399",
                      text: "    <title>Mayank · Portfolio</title>",
                    },
                    {
                      n: 6,
                      color: "#f0f0f0",
                      text: '    <link rel="stylesheet" href="style.css">',
                    },
                    { n: 7, color: "#60a5fa", text: "  </head>" },
                    { n: 8, color: "#60a5fa", text: "  <body>" },
                    {
                      n: 9,
                      color: "#a78bfa",
                      text: '    <header class="hero">',
                    },
                    {
                      n: 10,
                      color: "#fbbf24",
                      text: "      <h1>Mayank Chaudhary</h1>",
                    },
                    {
                      n: 11,
                      color: "#f0f0f0",
                      text: "      <p>AI · Full Stack · LangGraph</p>",
                    },
                    { n: 12, color: "#a78bfa", text: "    </header>" },
                    {
                      n: 13,
                      color: "#34d399",
                      text: "    <!-- ✅ CRITIC PASS -->",
                    },
                  ].map((line, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: "16px",
                        opacity: 0,
                        animation: `fadeSlide 0.25s ${1.3 + i * 0.12}s forwards`,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span
                        style={{
                          color: "#2a2a3a",
                          minWidth: "16px",
                          textAlign: "right",
                          userSelect: "none",
                        }}
                      >
                        {line.n}
                      </span>
                      <span style={{ color: line.color }}>{line.text}</span>
                      {i === 12 && (
                        <span
                          style={{
                            display: "inline-block",
                            width: "2px",
                            height: "13px",
                            background: BLUE,
                            animation: "blink 1s step-end infinite",
                            verticalAlign: "middle",
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────── */}
      <section
        id="how-it-works"
        style={{ padding: isMobile ? "60px 20px" : "100px 24px" }}
      >
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            style={{ textAlign: "center", marginBottom: "56px" }}
          >
            <p
              style={{
                fontSize: "12px",
                color: BLUE,
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginBottom: "12px",
              }}
            >
              How It Works
            </p>
            <h2
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "clamp(22px, 5vw, 40px)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              Five agents. One goal.
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "repeat(2, 1fr)"
                : "repeat(5, 1fr)",
              gap: "12px",
            }}
          >
            {AGENTS.map((agent) => (
              <motion.div key={agent.label} variants={fadeInUp}>
                <div
                  style={{
                    padding: "20px 14px",
                    borderRadius: "14px",
                    background: "#fff",
                    border: "1px solid #e8eaf6",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                    textAlign: "center",
                    height: "100%",
                    transition: "box-shadow 0.25s, transform 0.25s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 12px 28px ${agent.color}20`;
                    e.currentTarget.style.transform = "translateY(-4px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 2px 12px rgba(0,0,0,0.05)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: agent.color + "15",
                      border: `1px solid ${agent.color}30`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                      color: agent.color,
                      margin: "0 auto 12px",
                    }}
                  >
                    {agent.icon}
                  </div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "13px",
                      color: "#0f0f23",
                      marginBottom: "6px",
                      fontFamily: "'Outfit', sans-serif",
                    }}
                  >
                    {agent.label}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#6b7280",
                      lineHeight: 1.5,
                    }}
                  >
                    {agent.desc}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            style={{
              marginTop: "32px",
              padding: "14px 20px",
              borderRadius: "10px",
              background: "#fffbeb",
              border: "1px solid #fde68a",
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            <span style={{ color: "#f59e0b", fontSize: "18px", flexShrink: 0 }}>
              ↺
            </span>
            <span style={{ fontSize: "13px", color: "#78716c" }}>
              <span style={{ color: "#d97706", fontWeight: 600 }}>
                Self-healing loop:{" "}
              </span>
              If Critic rejects the code, Coder retries with exact feedback — up
              to 3 times before escalating to you.
            </span>
          </motion.div>
        </div>
      </section>

      {/* ── Animated Code Generation Section ── */}
      <section
        style={{
          padding: isMobile ? "60px 20px" : "100px 24px",
          background: "#fff",
        }}
      >
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            style={{ textAlign: "center", marginBottom: "48px" }}
          >
            <p
              style={{
                fontSize: "12px",
                color: BLUE,
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginBottom: "12px",
              }}
            >
              Live Generation
            </p>
            <h2
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "clamp(22px, 5vw, 40px)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              Watch it build, file by file.
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            style={{
              borderRadius: "16px",
              overflow: "hidden",
              border: "1px solid #e8eaf6",
              boxShadow: "0 8px 40px rgba(37,99,235,0.10)",
            }}
          >
            <div
              style={{
                background: "#1c1c28",
                padding: "12px 18px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                borderBottom: "1px solid #2a2a3a",
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "#f87171",
                }}
              />
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "#fbbf24",
                }}
              />
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "#34d399",
                }}
              />
              <span
                style={{
                  marginLeft: "12px",
                  fontSize: isMobile ? "9px" : "11px",
                  color: "#52526a",
                  fontFamily: "JetBrains Mono, monospace",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  flex: 1,
                }}
              >
                ARCHON — coder_node · portfolio.py
              </span>
              <div
                style={{
                  marginLeft: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#34d399",
                    animation: "pulse 1.5s infinite",
                  }}
                />
                <span
                  style={{
                    fontSize: "10px",
                    color: "#34d399",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  generating
                </span>
              </div>
            </div>

            <div
              style={{
                background: "#09090f",
                padding: isMobile ? "16px 14px" : "24px",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: isMobile ? "11px" : "13px",
                lineHeight: 1.8,
                overflowX: "auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginBottom: "20px",
                  flexWrap: "wrap",
                }}
              >
                {[
                  { name: "PLANNER", color: "#60a5fa", done: true },
                  {
                    name: "CODER",
                    color: "#fbbf24",
                    done: false,
                    active: true,
                  },
                  { name: "CRITIC", color: "#f87171", done: false },
                  { name: "EXECUTOR", color: "#22d3ee", done: false },
                ].map((a) => (
                  <span
                    key={a.name}
                    style={{
                      padding: "3px 10px",
                      borderRadius: "4px",
                      fontSize: "10px",
                      fontWeight: 700,
                      color: a.done
                        ? "#34d399"
                        : a.active
                          ? a.color
                          : "#52526a",
                      background: a.done
                        ? "rgba(52,211,153,0.12)"
                        : a.active
                          ? `${a.color}15`
                          : "rgba(255,255,255,0.03)",
                      border: `1px solid ${a.done ? "#34d399" : a.active ? a.color : "#1e1e2e"}`,
                      animation: a.active ? "activeGlow 2s infinite" : "none",
                    }}
                  >
                    {a.done ? "✓ " : a.active ? "● " : ""}
                    {a.name}
                  </span>
                ))}
              </div>

              {CODE_LINES.map((line, i) => (
                <div
                  key={i}
                  style={{
                    color: line.color,
                    paddingLeft: `${line.indent * 20}px`,
                    opacity: 0,
                    animation: `fadeSlide 0.4s ${0.3 + i * 0.18}s forwards`,
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span
                    style={{
                      color: "#2a2a3a",
                      userSelect: "none",
                      minWidth: "20px",
                      textAlign: "right",
                      fontSize: "11px",
                    }}
                  >
                    {i + 1}
                  </span>
                  <span>{line.text}</span>
                  {i === CODE_LINES.length - 1 && (
                    <span
                      style={{
                        display: "inline-block",
                        width: "2px",
                        height: "14px",
                        background: BLUE,
                        animation: "blink 1s step-end infinite",
                        verticalAlign: "middle",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section
        id="features"
        style={{
          padding: isMobile ? "60px 20px" : "100px 24px",
          background: "#f8f8fc",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            style={{ textAlign: "center", marginBottom: "56px" }}
          >
            <p
              style={{
                fontSize: "12px",
                color: BLUE,
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginBottom: "12px",
              }}
            >
              Features
            </p>
            <h2
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "clamp(22px, 5vw, 40px)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              Not a wrapper. A system.
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "1fr"
                : "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "16px",
            }}
          >
            {FEATURES.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeInUp}
                style={{
                  padding: "28px",
                  borderRadius: "14px",
                  background: "#fff",
                  border: "1px solid #e8eaf6",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  transition: "box-shadow 0.25s, transform 0.25s",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 12px 28px ${f.color}15`;
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(0,0,0,0.04)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: f.bg,
                    border: `1px solid ${f.color}25`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    color: f.color,
                    marginBottom: "16px",
                  }}
                >
                  {f.icon}
                </div>
                <h3
                  style={{
                    fontWeight: 700,
                    fontSize: "16px",
                    marginBottom: "8px",
                    fontFamily: "'Outfit', sans-serif",
                    color: "#0f0f23",
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#6b7280",
                    lineHeight: 1.65,
                  }}
                >
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Stack ─────────────────────────────────────────── */}
      <section
        id="stack"
        style={{
          padding: isMobile ? "60px 20px" : "100px 24px",
          background: "#f8f8fc",
        }}
      >
        <div
          style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}
        >
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <p
              style={{
                fontSize: "12px",
                color: BLUE,
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginBottom: "12px",
              }}
            >
              Stack
            </p>
            <h2
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "clamp(22px, 5vw, 40px)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                marginBottom: "48px",
              }}
            >
              Production-grade infrastructure.
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "repeat(2, 1fr)"
                : "repeat(3, 1fr)",
              gap: "12px",
            }}
          >
            {STACK.map((s) => (
              <motion.div
                key={s.name}
                variants={fadeInUp}
                style={{
                  padding: "18px 16px",
                  borderRadius: "12px",
                  background: "#fff",
                  border: "1px solid #e8eaf6",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  textAlign: "left",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 20px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(0,0,0,0.04)";
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: s.color,
                    marginBottom: "4px",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {s.name}
                </div>
                <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                  {s.role}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────── */}
      <section
        style={{
          padding: isMobile ? "80px 20px 100px" : "120px 24px 140px",
          textAlign: "center",
          background: "#fff",
        }}
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          style={{ maxWidth: "560px", margin: "0 auto" }}
        >
          <h2
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "clamp(26px, 7vw, 52px)",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              marginBottom: "16px",
              color: "#0f0f23",
            }}
          >
            Ready to build something?
          </h2>
          <p
            style={{
              color: "#6b7280",
              fontSize: isMobile ? "15px" : "17px",
              marginBottom: "40px",
              lineHeight: 1.6,
            }}
          >
            Describe it in plain English. ARCHON handles the rest.
          </p>
          <button
            onClick={() => navigate("/app")}
            style={{
              padding: isMobile ? "14px 40px" : "16px 52px",
              borderRadius: "12px",
              border: "none",
              cursor: "pointer",
              background: BTN.bg,
              color: "#fff",
              fontSize: isMobile ? "15px" : "16px",
              fontWeight: 700,
              fontFamily: "'Inter', sans-serif",
              boxShadow: `0 6px 24px ${BTN.glow}`,
              transition: "all 0.2s",
              width: isMobile ? "100%" : "auto",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = BTN.hover;
              e.target.style.transform = "translateY(-3px)";
              e.target.style.boxShadow = `0 12px 32px ${BTN.glow}`;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = BTN.bg;
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = `0 6px 24px ${BTN.glow}`;
            }}
          >
            Launch ARCHON →
          </button>
        </motion.div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer
        style={{
          padding: isMobile ? "20px" : "28px 48px",
          borderTop: "1px solid #e8eaf6",
          display: "flex",
          justifyContent: isMobile ? "center" : "space-between",
          alignItems: "center",
          background: "#fafbff",
          flexWrap: "wrap",
          gap: "12px",
          flexDirection: isMobile ? "column" : "row",
          textAlign: isMobile ? "center" : "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "6px",
              background: `linear-gradient(135deg, ${BLUE_DK}, ${BLUE})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "7px",
                fontWeight: 900,
                color: "#93c5fd",
              }}
            >
              &lt;/&gt;
            </span>
          </div>
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              fontSize: "14px",
              color: "#6b7280",
            }}
          >
            ARCHON
          </span>
        </div>
        <span style={{ fontSize: "13px", color: "#9ca3af" }}>
          Built by{" "}
          <a
            href="mailto:chaudharymayank996@gmail.com"
            style={{ color: BLUE, textDecoration: "none", fontWeight: 500 }}
          >
            Mayank Chaudhary
          </a>
        </span>
      </footer>

      {/* Keyframes */}
      <style>{`
        @keyframes pulse {
          0%,100% { opacity:1; box-shadow:0 0 6px #10b981; }
          50%      { opacity:0.5; box-shadow:0 0 3px #10b981; }
        }
        @keyframes fadeSlide {
          from { opacity:0; transform:translateY(6px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes blink {
          0%,100% { opacity:1; }
          50%     { opacity:0; }
        }
        @keyframes activeGlow {
          0%,100% { opacity:1; }
          50%     { opacity:0.7; }
        }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
