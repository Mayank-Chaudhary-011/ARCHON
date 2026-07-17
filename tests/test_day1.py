from dotenv import load_dotenv
load_dotenv

from backend.graph.state import AgentState
from backend.graph.nodes import planner_node , coder_node


#Initial state

state:AgentState ={
    "task":"Write a Python function that takes a list of numbers and returns the top 3 largest",
    "plan":"",
    "code":"",
    "feedback":"",
    "attempts":0,
    "approved":False,
    "final_ouput":""
}

# Run planner
state.update(planner_node(state))
print("\n--- PLAN ---")
print(state["plan"])


# Run coder 
state.update(coder_node(state))
print("\n--- CODE ---")
print(state["code"])