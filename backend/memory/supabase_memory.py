import os
from dotenv import load_dotenv
load_dotenv()
from supabase import create_client

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)


def save_run(state: dict) -> None:
    try:
        supabase.table("agent_runs").insert({
            "task":               state.get("task", ""),
            "plan":               state.get("plan", ""),
            "code":               state.get("code", ""),
            "feedback":           state.get("feedback", ""),
            "final_output":       state.get("final_output", ""),
            "attempts":           state.get("attempts", 0),
            "success":            "PASS" in state.get("feedback", ""),
            "tokens_used":        state.get("tokens_used", 0),
            "prompt_tokens":      state.get("prompt_tokens", 0),
            "completion_tokens":  state.get("completion_tokens", 0),
            "efficiency_score":   state.get("efficiency_score", 0.0),
        }).execute()
        print("[MEMORY] Run saved to Supabase.")
    except Exception as e:
        print(f"[MEMORY] Failed to save: {e}")


def get_similar_runs(task: str) -> list:
    """Return the 3 most recent successful runs (used as planner context)."""
    try:
        result = supabase.table("agent_runs") \
            .select("task, code, final_output, attempts") \
            .eq("success", True) \
            .order("created_at", desc=True) \
            .limit(3) \
            .execute()
        print(f"[MEMORY] Found {len(result.data)} past runs.")
        return result.data
    except Exception as e:
        print(f"[MEMORY] Failed to fetch similar runs: {e}")
        return []


def get_all_runs(limit: int = 50) -> list:
    """Return the most recent runs for the /history endpoint."""
    try:
        result = supabase.table("agent_runs") \
            .select("id, task, attempts, tokens_used, efficiency_score, success, created_at") \
            .order("created_at", desc=True) \
            .limit(limit) \
            .execute()
        print(f"[MEMORY] Fetched {len(result.data)} history runs.")
        return result.data
    except Exception as e:
        print(f"[MEMORY] Failed to fetch history: {e}")
        return []
