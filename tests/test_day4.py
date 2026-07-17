from dotenv import load_dotenv
load_dotenv()

from backend.graph.graph import build_graph
from backend.graph.state import AgentState

graph = build_graph()

initial_state = AgentState={
    "task":"Write a Python function that returns the top 3 largest numbers from a list and print the result for [5,1,9,3,7]",
    "plan":"",
    "code":"",
    "broken_code":"",
    "error_message":"",
    "feedback":"",
    "attempts":0,
    "approved":False,
    "final_output":""
}


print("=== DAY 4 - REAL SANDBOX EXECUTION ===\n")
result = graph.invoke(initial_state)


print("\n=== FINAL RESULT ===")
print(f"Attempts    :{result.get('attempts', 0)}")
print(f"Feedback    :{result.get('feedback', '')}")
print(f"Sandbox output :{result.get('final_output', '')}")
print(f"\nCode:\n{result.get('code', '')}")