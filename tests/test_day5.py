from dotenv import load_dotenv
load_dotenv()

from backend.graph.graph import build_graph
from backend.graph.state import AgentState

graph = build_graph()

initial_state: AgentState = {
    "task": "Write a Python function that tokenizes a sentence into words, removes stopwords from the list ['is','the','a','an','and','of'], and prints the result for 'The quick brown fox is a smart animal'",
    "plan": "",
    "code": "",
    "broken_code": "",
    "error_message": "",
    "feedback": "",
    "attempts": 0,
    "approved": False,
    "final_output": ""
}

print("=== DAY 5 - SUPABASE MEMORY ===\n")
result = graph.invoke(initial_state)

print("\n=== FINAL RESULT ===")
print(f"Attempts      : {result.get('attempts', 0)}")
print(f"Sandbox output: {result.get('final_output', '')}")
print(f"\nCode:\n{result.get('code', '')}")