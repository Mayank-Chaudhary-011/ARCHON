from dotenv import load_dotenv
load_dotenv()

from backend.graph.graph import build_graph
from backend.graph.state import AgentState
import time

graph = build_graph()

tasks = [
    "Write a Python function that normalizes a list of numbers between 0 and 1 using min-max scaling and print the result for [10, 20, 30, 40, 50]",
    "Write a Python function that computes cosine similarity between two vectors using only numpy and prints the result for [1,2,3] and [4,5,6]",
    "Write a Python function that computes a confusion matrix from actual and predicted labels without using sklearn and prints it for actual=[1,0,1,1,0] predicted=[1,0,0,1,1]",
    "Write a Python script using numpy to create a 3x3 matrix compute its transpose and print both",
    "Write a Python function that implements linear regression from scratch using numpy and prints predicted values for X=[1,2,3,4,5] y=[2,4,6,8,10] test=[6]",
    "Write a Python function that computes softmax of a list of numbers and prints the result for [1.0, 2.0, 3.0]"
]

print("=== BATCH MEMORY BUILDER ===\n")
print(f"Total tasks: {len(tasks)}\n")

for i, task in enumerate(tasks):
    print(f"\n{'='*50}")
    print(f"TASK {i+1}/{len(tasks)}: {task[:60]}...")
    print(f"{'='*50}")
    
    initial_state: AgentState = {
        "task": task,
        "plan": "",
        "code": "",
        "broken_code": "",
        "error_message": "",
        "feedback": "",
        "attempts": 0,
        "approved": False,
        "final_output": ""
    }
    
    try:
        result = graph.invoke(initial_state)
        print(f"\n✅ Task {i+1} complete")
        print(f"   Attempts: {result.get('attempts', 0)}")
        print(f"   Output  : {result.get('final_output', 'check sandbox')}")
    except Exception as e:
        print(f"\n❌ Task {i+1} failed: {e}")
    
    # Small delay between tasks to avoid rate limiting
    time.sleep(2)

print(f"\n{'='*50}")
print("=== BATCH COMPLETE ===")
print("Check Supabase agent_runs table for all saved runs")