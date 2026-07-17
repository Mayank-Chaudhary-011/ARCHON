import os
import json

# Target directory in the workspace root on the D: drive / SSD
SESSION_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "sessions"
)


def get_sessions_dir() -> str:
    """Ensures the sessions directory exists and returns its absolute path."""
    if not os.path.exists(SESSION_DIR):
        os.makedirs(SESSION_DIR, exist_ok=True)
    return SESSION_DIR


def save_session(session_id: str, data: dict) -> None:
    """Saves session state as a JSON file to the SSD sessions directory."""
    filepath = os.path.join(get_sessions_dir(), f"{session_id}.json")
    try:
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"[SESSION_STORE] Error saving session {session_id}: {e}")


def get_session(session_id: str) -> dict:
    """Reads session state from the JSON file on the SSD. Returns empty dict if not found."""
    filepath = os.path.join(get_sessions_dir(), f"{session_id}.json")
    if not os.path.exists(filepath):
        return {}
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"[SESSION_STORE] Error reading session {session_id}: {e}")
        return {}


def delete_session(session_id: str) -> None:
    """Deletes a specific session file from the SSD."""
    filepath = os.path.join(get_sessions_dir(), f"{session_id}.json")
    if os.path.exists(filepath):
        try:
            os.remove(filepath)
        except Exception as e:
            print(f"[SESSION_STORE] Error deleting session {session_id}: {e}")


def burn_all_sessions() -> int:
    """
    Deletes all session JSON files from the SSD/drive sessions folder.
    Does NOT affect the Supabase database.
    """
    count = 0
    directory = get_sessions_dir()
    for filename in os.listdir(directory):
        if filename.endswith(".json"):
            filepath = os.path.join(directory, filename)
            try:
                os.remove(filepath)
                count += 1
            except Exception as e:
                print(f"[SESSION_STORE] Error burning file {filename}: {e}")
    return count
