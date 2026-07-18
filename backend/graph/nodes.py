import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from backend.graph.state import AgentState

from backend.tools.executor import run_code_in_sandbox
from backend.memory.supabase_memory import save_run , get_similar_runs

load_dotenv()

_FALLBACK_KEY = os.getenv("OPENAI_API_KEY", "")


def make_llms(api_key: str = ""):
    """Create per-request LLM clients using the user's API key.
    Falls back to the server env key only if no key is supplied."""
    key = api_key.strip() or _FALLBACK_KEY
    planner = ChatOpenAI(model="gpt-4o",      api_key=key)
    coder   = ChatOpenAI(model="gpt-4o-mini", api_key=key)
    critic  = planner
    return planner, coder, critic

# Global token counter for the current build run.
# NOTE: This is a module-level dict shared across the process.
# For production multi-user deployments, move token tracking into AgentState
# or use a per-request context var to avoid race conditions.
token_log = {
    "prompt_tokens":    0,
    "completion_tokens": 0,
    "total_tokens":      0
}

def reset_token_log():
    token_log["prompt_tokens"] = 0
    token_log["completion_tokens"] =0
    token_log["total_tokens"] = 0


def track_tokens(response):
    try:
        usage = response.usage_metadata
        # Try all possible key names
        prompt = (
            usage.get("input_tokens") or
            usage.get("prompt_tokens") or
            usage.get("input_token_count") or 0
        )
        completion = (
            usage.get("output_tokens") or
            usage.get("completion_tokens") or
            usage.get("generated_token_count") or 0
        )
        total = (
            usage.get("total_tokens") or
            (prompt + completion) or 0
        )
        token_log["prompt_tokens"]     += prompt
        token_log["completion_tokens"] += completion
        token_log["total_tokens"]      += total
    except Exception as e:
        print(f"[TOKENS] Could not track: {e}")

def planner_node(state:AgentState) -> AgentState:
    reset_token_log()
    planner_llm, _, _ = make_llms(state.get("api_key", ""))
    print("\n[PLANNER] Breaking down task...")

    past_runs = get_similar_runs(state.get("task", ""))

    memory_context = ""
    if past_runs:
        memory_context = "MEMORY — similar past solutions (use as reference, do not copy blindly):\n"
        for run in past_runs:
            outcome = "succeeded" if run.get("final_output") else "attempted"
            memory_context += f"- Task: {run['task']} [{outcome}, {run.get('attempts',1)} attempt(s), {run.get('tokens_used',0)} tokens]\n"
        print(f"[PLANNER] Found {len(past_runs)} past runs in memory.")
    else:
        print("[PLANNER] No past runs found. Starting fresh.")

    prompt = f"""You are a senior software architect and planning agent.

Your job: analyse the user request and produce a clear, numbered step-by-step
implementation plan that a coder can follow file-by-file.

User request: {state.get('task', '')}

{memory_context}

Rules:
- Be specific about what each file must do and what it must NOT do.
- Call out any shared constants, imports, or IDs that must be consistent across files.
- Do NOT write code — only the plan.
- Keep it concise: one sentence per step.
"""

    response = planner_llm.invoke(prompt)
    track_tokens(response)
    print(f"[PLANNER] Done. Tokens so far: {token_log['total_tokens']}")
    return {"plan": response.content}

def coder_node(state: AgentState) -> AgentState:
    attempts = state.get("attempts", 0)
    implementation = state.get("implementation", {})
    files = state.get("files", [])
    generated_files = state.get("generated_files", {})

    # Find next file to generate
    current_file = None
    for f in files:
        if f["filename"] not in generated_files:
            current_file = f
            break

    if not current_file:
        print("\n[CODER] All files generated.")
        return {"current_file": "done"}

    print(f"\n[CODER] Generating {current_file['filename']} (attempt {attempts + 1})...")

    # ── Inter-file context: pass all already-generated files ──────────
    file_context = ""
    if generated_files:
        file_context = "ALREADY GENERATED FILES (your code must be compatible with these):\n"
        for fname, fcode in generated_files.items():
            # Trim very long files to first 60 lines to save tokens
            preview = "\n".join(fcode.splitlines()[:60])
            file_context += f"\n--- {fname} ---\n{preview}\n"
        file_context += "\nEnsure IDs, class names, function names and imports match exactly."

    # ── All remaining files (so coder knows what's coming next) ───────
    remaining = [f["filename"] for f in files if f["filename"] not in generated_files
                 and f["filename"] != current_file["filename"]]
    upcoming = f"Upcoming files (do NOT generate these now): {remaining}" if remaining else ""

    prompt = f"""You are an expert software engineer writing production-quality code.

Project: {implementation.get('project_name', '')}
Architecture: {implementation.get('architecture', '')}
Tech stack: {', '.join(str(t) for t in implementation.get('tech_stack', []))}
Plan: {state.get('plan', '')}

{file_context}

{upcoming}

NOW GENERATE: {current_file['filename']}
Purpose: {current_file['description']}
Language: {current_file['language']}

Critic feedback from previous attempt (fix these exactly): {state.get('feedback', 'None — first attempt')}

Strict rules:
- Return ONLY the complete file code. No markdown. No backticks. No explanation.
- No placeholder comments like "# TODO" or "add your logic here".
- No truncation — write the FULL working file.
- IDs, class names, and function names must match the already-generated files exactly.
- If this is HTML, use semantic tags and link CSS/JS files correctly.
- If this is JS/Python, import only what exists in the project files listed above.
- Do NOT add excessive inline comments or explain simple steps. Keep code clean and self-documenting. Only add a concise, highly relevant docstring/comment at the top of the file, and at most 1 or 2 relevant comments within the file logic where strictly necessary.
"""

    _, coder_llm, _ = make_llms(state.get("api_key", ""))
    response = coder_llm.invoke(prompt)
    track_tokens(response)

    # Strip any accidental markdown fences
    code = response.content
    for fence in ["```python", "```javascript", "```html", "```css", "```json", "```"]:
        code = code.replace(fence, "")
    code = code.strip()

    print(f"[CODER] {current_file['filename']} done. Tokens: {token_log['total_tokens']}")

    updated_files = {**generated_files, current_file["filename"]: code}

    return {
        "code":            code,
        "current_file":    current_file["filename"],
        "generated_files": updated_files,
        "attempts":        attempts + 1
    }

def critic_node(state: AgentState) -> AgentState:
    print("\n[CRITIC] Reviewing code...")

    code = state.get('code', '')
    current_file = state.get('current_file', 'unknown')

    # Get language from the files list
    files = state.get('files', [])
    language = "code"
    for f in files:
        if f["filename"] == current_file:
            language = f.get("language", "code")
            break

    prompt = f"""You are a strict but fair code reviewer.

File: {current_file}
Language: {language}

Code to review:
{code}

Review checklist (apply only rules relevant to {language}):
1. Does the code fulfil the file's purpose without obvious logic errors?
2. Are there any syntax errors that would prevent it from running?
3. For HTML: are all referenced CSS/JS filenames present and correctly linked?
4. For JS/Python: are there undefined variables or missing imports?
5. Are there placeholder comments like TODO or "add logic here"? (FAIL if yes)
6. Is the code complete — not truncated mid-function?

Important:
- PASS if the code is functionally correct for its language, even if style is imperfect.
- PASS if it uses print/console.log for demonstration purposes.
- FAIL only for actual bugs, missing code, or broken references.
- Do NOT fail HTML for lacking a return statement.
- Do NOT fail for minor style issues.

Reply in this exact format:
VERDICT: PASS or FAIL
REASON: one concise sentence
"""

    _, _, critic_llm = make_llms(state.get("api_key", ""))
    response = critic_llm.invoke(prompt)
    track_tokens(response)
    feedback = response.content
    print(f"[CRITIC] {feedback.splitlines()[0]}")
    print(f"[CRITIC] Tokens so far: {token_log['total_tokens']}")
    return {"feedback": feedback}


def executor_node(state:AgentState) -> AgentState:
    print("\n[EXECUTOR] Running code in sandbox...")

    result = run_code_in_sandbox(state.get('code', ""))

    if result["success"]:
        print(f"[EXECUTOR] Success :{result['output']}")

        # Calculate efficiency score
        total = token_log["total_tokens"]
        efficiency = round(1000 / total , 4) if total > 0 else 0
        print(f"[TOKENS] Total:{total} | Efficiency: {efficiency}")


        # Save to memory
        save_run({
            "task":         state.get("task", ""),
            "plan":         state.get("plan", ""),
            "code":         state.get("code", ""),
            "feedback":     state.get("feedback", ""),
            "final_output": result["output"],
            "attempts":     state.get("attempts", 0),
            "tokens_used":  total,
            "prompt_tokens":token_log["prompt_tokens"],
            "completion_tokens":token_log["completion_tokens"],
            "efficiency_score": efficiency
        })
        return{
            "final_output":result["output"],
            "feedback":state.get("feedback", "")
        }
    else:
        print(f"[EXECUTOR] Failed: {result['error']}")
        #send error back as feedback for self healing
        return{
            "feedback":f"FAIL\nExecution error: {result.get('error', '')}",
            "final_output":""
        }
    
def debugger_node(state: AgentState) -> AgentState:
    broken_code   = state.get("broken_code", "")
    error_message = state.get("error_message", "")
    attempts      = state.get("attempts", 0)

    print(f"[DEBUGGER] broken_code preview: '{broken_code[:80]}'")
    print(f"[DEBUGGER] error_message: '{error_message[:80]}'")
    print("\n[DEBUGGER] Analyzing broken code...")

    # Detect language from the code content for a language-aware fix
    language = "Python"
    if broken_code.strip().startswith(("<", "<!DOCTYPE")):
        language = "HTML"
    elif any(kw in broken_code for kw in ["const ", "let ", "function ", "=>", "import React"]):
        language = "JavaScript"
    elif broken_code.strip().startswith(("{", "[")):
        language = "JSON"

    # If this is a retry loop, use the latest generated code and critic feedback
    if attempts > 0:
        code_to_fix = state.get("code", "")
        error_to_fix = state.get("feedback", "")
    else:
        code_to_fix = broken_code
        error_to_fix = error_message

    prompt = f"""
You are an expert {language} debugger.

Here is the broken {language} code:
{code_to_fix}

Here is the error or critique:
{error_to_fix}

Fix the bug and return ONLY the complete corrected {language} code.
No explanation. No backticks. No markdown.
Do NOT add excessive inline comments. Keep the code clean and self-documenting with only a top docstring and at most 1 or 2 relevant comments within the file logic if needed.
"""

    _, coder_llm, _ = make_llms(state.get("api_key", ""))
    response = coder_llm.invoke(prompt)
    track_tokens(response)
    # Strip any accidental markdown fences
    code = response.content
    for fence in ["```python", "```javascript", "```html", "```css", "```json", "```"]:
        code = code.replace(fence, "")
    code = code.strip()
    print(f"[DEBUGGER] Fix ready ({language}). Tokens: {token_log['total_tokens']}")

    return {
        "code":     code,
        "attempts": attempts + 1,
        "plan":     f"Debug mode ({language})"
    }

def implementation_planner_node(state: AgentState) -> AgentState:
    reset_token_log()
    print("\n[IMPL PLANNER] Generating implementation plan...")

    prompt = f"""
    You are a senior software architect.
    A user wants to build something. Your job is to create a detailed implementation plan.

    User request: {state.get('task', '')}

    Analyze the request and return a JSON object with this exact structure:
    {{
        "project_name": "name of the project",
        "description": "one line description",
        "tech_stack": ["list", "of", "technologies"],
        "architecture": "brief architecture description",
        "files": [
            {{
                "filename": "main.py",
                "description": "what this file does",
                "language": "python"
            }}
        ],
        "entry_point": "main.py"
    }}

    Rules:
    - For ML/AI/data tasks → use Python only
    - For websites/portfolios → use HTML, CSS, JS
    - For APIs → use Python FastAPI
    - For dashboards → recommend React
    - Return ONLY the JSON. No explanation. No backticks.
    """

    planner_llm, _, _ = make_llms(state.get("api_key", ""))
    response = planner_llm.invoke(prompt)
    track_tokens(response)

    import json
    try:
        raw = response.content.replace("```json", "").replace("```", "").strip()
        implementation = json.loads(raw)
    except Exception:
        implementation = {
            "project_name": "Project",
            "description": state.get("task", ""),
            "tech_stack": ["Python"],
            "architecture": "Single file Python script",
            "files": [{"filename": "main.py", "description": "Main script", "language": "python"}],
            "entry_point": "main.py"
        }

    print(f"[IMPL PLANNER] Plan ready. Files: {[f['filename'] for f in implementation['files']]}")
    print(f"[IMPL PLANNER] Tokens: {token_log['total_tokens']}")

    return {
        "implementation": implementation,
        "files": implementation["files"],
        "generated_files": {},
        "plan": f"Building: {implementation['project_name']}"
    }