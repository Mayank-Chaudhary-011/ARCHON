from backend.graph.state import AgentState

def should_retry(state: AgentState) -> str:
    feedback = state.get("feedback", "")
    attempts = state.get("attempts", 0)
    mode     = state.get("mode", "generate")
    files    = state.get("files", [])
    generated_files = state.get("generated_files", {})

    if mode == "debug":
        if "PASS" in feedback:
            print("\n[EDGE] Debug code passed critic. Moving to executor.")
            return "executor"
        elif attempts >= 3:
            print("\n[EDGE] Debug attempts exceeded. Moving to executor for final output.")
            return "executor"
        else:
            print(f"\n[EDGE] Debug critic failed. Retrying debugger (attempt {attempts})...")
            return "debugger"

    if "PASS" in feedback:
        # Check if more files need generating
        remaining = [f for f in files if f["filename"] not in generated_files]
        if remaining:
            print(f"\n[EDGE] File done. {len(remaining)} files remaining.")
            return "coder"
        else:
            print("\n[EDGE] All files done. Moving to executor.")
            return "executor"
    elif attempts >= 5:
        print("\n[EDGE] Max attempts. Escalating to human.")
        return "human"
    else:
        print(f"\n[EDGE] Critic failed. Retrying (attempt {attempts})...")
        return "coder"