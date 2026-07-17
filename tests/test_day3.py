from dotenv import load_dotenv
load_dotenv()

from backend.graph.graph import build_graph
from backend.graph.state import AgentState

graph = build_graph()

# Initial state 
initial_state: AgentState ={
    "task":"Write a Python function that takes a list of numbers and returns the top 3 largest",
    "plan":"",
    "code":"",
    "feedback":"",
    "attempts":0,
    "approved":False,
    "final_ouput":""
}

print("=== STARTING MULTI-AGENT GRAPH ===\n")
result = graph.invoke(initial_state)

print("\n=== FINAL RESULT ===")
print(f"Attempts made:{result.get('attempts', 0)}")
print(f"Final feedback:{result.get('feedback', '')}")
print(f"Final output:{result.get('final_output','')}")
print(f"\nCode generated:\n{result.get('code', '')}")