from dotenv import load_dotenv
load_dotenv()

from backend.graph.graph import build_graph
from backend.graph.state import AgentState

graph = build_graph()

# Broken code with a real bug
broken_code = """
def calculate_average(numbers):
    total = 0
    for num in numbers:
        total += num
    average = total / len(numbers
    print(average)

calculate_average([10, 20, 30, 40, 50])
"""

error_message = """
  File "solution.py", line 6
    average = total / len(numbers
                                 ^
SyntaxError: '(' was never closed
"""

initial_state: AgentState = {
    "task":          "Debug the provided broken Python code",
    "mode":          "debug",
    "broken_code":   broken_code,
    "error_message": error_message,
    "plan":          "",
    "code":          "",
    "feedback":      "",
    "attempts":      0,
    "approved":      False,
    "final_output":  ""
}

print("=== DAY 6 - DEBUG MODE ===\n")
print(f"Broken code:\n{broken_code}")
print(f"Error:\n{error_message}")
print("\n--- STARTING AGENTS ---\n")

result = graph.invoke(initial_state)

print("\n=== FINAL RESULT ===")
print(f"Attempts      : {result.get('attempts', 0)}")
print(f"Sandbox output: {result.get('final_output', '')}")
print(f"\nFixed code:\n{result.get('code', '')}")