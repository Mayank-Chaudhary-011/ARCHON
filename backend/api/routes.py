from fastapi import APIRouter
from pydantic import BaseModel
from backend.graph.state import AgentState
from backend.graph.nodes import (
    implementation_planner_node,
    coder_node,
    critic_node,
    executor_node,
    debugger_node,
    reset_token_log,
    token_log
)
from backend.memory.supabase_memory import get_similar_runs, get_all_runs, save_run
import json

router = APIRouter()

# In-memory build session store
# Key: session_id, Value: build state
# TODO: For production multi-user deployments, replace with Redis or a
# Supabase-backed session store so sessions survive server restarts.
build_sessions: dict = {}


class PlanRequest(BaseModel):
    task:       str
    session_id: str


class BuildNextRequest(BaseModel):
    session_id: str


class ApproveRequest(BaseModel):
    session_id: str
    filename:   str
    code:       str


class DebugRequest(BaseModel):
    broken_code:   str
    error_message: str


def generate_plan(task: str) -> dict:
    state: AgentState = {
        "task":            task,
        "mode":            "generate",
        "broken_code":     "",
        "error_message":   "",
        "plan":            "",
        "implementation":  {},
        "files":           [],
        "current_file":    "",
        "generated_files": {},
        "code":            "",
        "feedback":        "",
        "attempts":        0,
        "approved":        False,
        "final_output":    ""
    }
    result = implementation_planner_node(state)
    return result


def generate_one_file(task: str, implementation: dict, files: list, generated_files: dict) -> dict:
    # Keep a clean snapshot without the file we are about to generate.
    base_files = generated_files.copy()

    state: AgentState = {
        "task":            task,
        "mode":            "generate",
        "broken_code":     "",
        "error_message":   "",
        "plan":            implementation.get("description", task),
        "implementation":  implementation,
        "files":           files,
        "current_file":    "",
        "generated_files": base_files,
        "code":            "",
        "feedback":        "",
        "attempts":        0,
        "approved":        False,
        "final_output":    ""
    }

    step_logs = []

    # First coder attempt
    coder_result          = coder_node(state)
    state["code"]         = coder_result["code"]
    state["current_file"] = coder_result["current_file"]
    state["attempts"]     = coder_result["attempts"]
    
    step_logs.append({
        "agent": "CODER",
        "message": f"Generated initial version of {coder_result['current_file']} (Attempt 1)"
    })

    # Critic loop — max 3 attempts
    passed = False
    for attempt in range(3):
        critic_result     = critic_node(state)
        state["feedback"] = critic_result["feedback"]

        verdict_line = critic_result["feedback"].splitlines()[0] if critic_result["feedback"] else "FAIL"
        reason_line = critic_result["feedback"].splitlines()[1] if len(critic_result["feedback"].splitlines()) > 1 else ""
        
        step_logs.append({
            "agent": "CRITIC",
            "message": f"[{state['current_file']}] {verdict_line} - {reason_line}"
        })

        if "PASS" in state["feedback"]:
            passed = True
            break
        elif attempt < 2:
            step_logs.append({
                "agent": "SYSTEM",
                "message": f"Self-healing loop triggered for {state['current_file']}. Retrying generation..."
            })
            # Reset so coder targets the SAME file again on retry
            state["generated_files"] = base_files.copy()
            state["attempts"]        = state.get("attempts", 0) + 1
            coder_result             = coder_node(state)
            state["code"]            = coder_result["code"]
            state["current_file"]    = coder_result["current_file"]
            state["attempts"]        = coder_result["attempts"]

    filename   = state.get("current_file", "")
    final_code = state.get("code", "")

    return {
        "filename":        filename,
        "code":            final_code,
        "feedback":        state.get("feedback", ""),
        "generated_files": {**base_files, filename: final_code},
        "needs_review":    not passed,
        "logs":            step_logs
    }


@router.post("/plan")
async def create_plan(req: PlanRequest):
    result = generate_plan(req.task)
    implementation = result.get("implementation", {})

    # Generate plan.md content
    files_list = "\n".join([
        f"- {f['filename']} — {f['description']}"
        for f in implementation.get("files", [])
    ])

    plan_md = f"""# {implementation.get('project_name', 'Project')}

## Description
{implementation.get('description', '')}

## Architecture
{implementation.get('architecture', '')}

## Tech Stack
{', '.join(implementation.get('tech_stack', []))}

## Files
{files_list}

## Entry Point
{implementation.get('entry_point', 'main.py')}
"""

    import os
    tracing_active = os.getenv("LANGCHAIN_TRACING_V2", "false").lower() == "true"

    # Store session
    build_sessions[req.session_id] = {
        "task":            req.task,
        "implementation":  implementation,
        "files":           implementation.get("files", []),
        "generated_files": {},
        "plan_md":         plan_md
    }

    return {
        "status":         "plan_ready",
        "implementation": implementation,
        "plan_md":        plan_md,
        "total_files":    len(implementation.get("files", [])),
        "tracing_active": tracing_active
    }


@router.post("/build/next")
async def build_next_file(req: BuildNextRequest):
    session = build_sessions.get(req.session_id)

    if not session:
        return {"status": "error", "message": "Session not found"}

    files           = session["files"]
    generated_files = session["generated_files"]

    # Find next file
    remaining = [f for f in files if f["filename"] not in generated_files]

    if not remaining:
        # All files done — run sandbox ONLY for Python entry points
        entry = session["implementation"].get("entry_point", "main.py")
        entry_code = generated_files.get(entry, "")

        output = ""
        if entry.endswith(".py") and entry_code:
            from backend.tools.executor import run_code_in_sandbox
            result = run_code_in_sandbox(entry_code)
            output = result.get("output", "") if result["success"] else f"Error: {result.get('error', '')}"
        elif entry_code:
            # Non-Python project (HTML/JS/React etc.) — no sandbox needed
            lang = entry.split(".")[-1].upper()
            output = f"✓ {lang} project generated successfully. Open '{entry}' in your browser to view it."

        return {
            "status":          "complete",
            "generated_files": generated_files,
            "output":          output,
            "files_remaining": 0,
            "tokens":          {**token_log}
        }

    # Generate next file
    result = generate_one_file(
        task            = session["task"],
        implementation  = session["implementation"],
        files           = files,
        generated_files = generated_files
    )

    # If critic never passed, escalate to human review
    if result.get("needs_review"):
        return {
            "status":   "human_review",
            "filename": result["filename"],
            "code":     result["code"],
            "feedback": result["feedback"],
            "tokens":   {**token_log},
            "logs":     result.get("logs", [])
        }

    # Update session
    session["generated_files"][result["filename"]] = result["code"]
    build_sessions[req.session_id] = session

    remaining_after = [
        f for f in files
        if f["filename"] not in session["generated_files"]
    ]

    return {
        "status":          "file_ready",
        "filename":        result["filename"],
        "code":            result["code"],
        "files_remaining": len(remaining_after),
        "generated_files": session["generated_files"],
        "tokens":          {**token_log},
        "logs":            result.get("logs", [])
    }


@router.post("/build/approve")
async def approve_file(req: ApproveRequest):
    """Human approves a file that failed critic — accept it as-is and continue."""
    session = build_sessions.get(req.session_id)
    if not session:
        return {"status": "error", "message": "Session not found"}

    session["generated_files"][req.filename] = req.code
    build_sessions[req.session_id] = session

    remaining = [
        f for f in session["files"]
        if f["filename"] not in session["generated_files"]
    ]
    return {
        "status":          "approved",
        "filename":        req.filename,
        "files_remaining": len(remaining)
    }


@router.post("/debug")
async def debug_agent(req: DebugRequest):
    from backend.graph.graph import build_graph
    graph = build_graph()

    initial_state: AgentState = {
        "task":            "Debug the provided broken Python code",
        "mode":            "debug",
        "broken_code":     req.broken_code,
        "error_message":   req.error_message,
        "plan":            "",
        "implementation":  {},
        "files":           [],
        "current_file":    "",
        "generated_files": {},
        "code":            "",
        "feedback":        "",
        "attempts":        0,
        "approved":        False,
        "final_output":    ""
    }

    result = graph.invoke(initial_state)

    return {
        "status":     "success",
        "mode":       "debug",
        "fixed_code": result.get("code", ""),
        "output":     result.get("final_output", ""),
        "attempts":   result.get("attempts", 0),
        "feedback":   result.get("feedback", ""),
        "tokens":     {**token_log}
    }


@router.get("/history")
async def get_history():
    runs = get_all_runs(limit=50)
    return {"status": "success", "runs": runs}


@router.get("/health")
async def health():
    return {"status": "ok", "message": "MyCoder API is running"}


@router.get("/status/{session_id}")
async def session_status(session_id: str):
    """Check the current progress of a build session."""
    session = build_sessions.get(session_id)
    if not session:
        return {"status": "not_found", "message": "Session not found or expired"}
    total     = len(session["files"])
    done      = len(session["generated_files"])
    remaining = total - done
    return {
        "status":          "active",
        "files_total":     total,
        "files_done":      done,
        "files_remaining": remaining,
        "progress_pct":    round((done / total * 100) if total else 0, 1),
    }