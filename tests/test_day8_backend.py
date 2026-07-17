from dotenv import load_dotenv
load_dotenv()

from backend.graph.graph import build_graph
from backend.graph.state import AgentState

graph = build_graph()

initial_state: AgentState = {
    "task":            "Build a multi-agent project using LangGraph with a planner and coder agent",
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

print("=== DAY 8 - IMPLEMENTATION PLAN ===\n")
result = graph.invoke(initial_state)

print("\n=== IMPLEMENTATION PLAN ===")
impl = result.get("implementation", {})
print(f"Project    : {impl.get('project_name', '')}")
print(f"Tech Stack : {impl.get('tech_stack', [])}")
print(f"Architecture: {impl.get('architecture', '')}")

print("\n=== GENERATED FILES ===")
for filename, code in result.get("generated_files", {}).items():
    print(f"\n--- {filename} ---")
    print(code[:200])
    print("...")

print(f"\nSandbox Output: {result.get('final_output', '')}")