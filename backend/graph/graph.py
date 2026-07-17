from langgraph.graph import StateGraph, END
from backend.graph.state import AgentState
from backend.graph.nodes import (
    implementation_planner_node,
    coder_node,
    critic_node,
    executor_node,
    debugger_node
)
from backend.graph.edges import should_retry


def dummy_human(state: AgentState) -> AgentState:
    print("\n[HUMAN] Escalated to human review.")
    return {"final_output": "Sent to human review"}


def route_by_mode(state: AgentState) -> str:
    mode = state.get("mode", "generate")
    if mode == "debug":
        print("\n[ROUTER] Debug mode. Routing to debugger.")
        return "debugger"
    print("\n[ROUTER] Generate mode. Routing to implementation planner.")
    return "implementation_planner"


def build_graph():
    builder = StateGraph(AgentState)

    builder.add_node("implementation_planner", implementation_planner_node)
    builder.add_node("coder",    coder_node)
    builder.add_node("critic",   critic_node)
    builder.add_node("executor", executor_node)
    builder.add_node("human",    dummy_human)
    builder.add_node("debugger", debugger_node)

    builder.set_conditional_entry_point(
        route_by_mode,
        {
            "implementation_planner": "implementation_planner",
            "debugger":               "debugger"
        }
    )

    builder.add_edge("implementation_planner", "coder")
    builder.add_edge("coder",    "critic")
    builder.add_edge("debugger", "critic")

    builder.add_conditional_edges(
        "critic",
        should_retry,
        {
            "coder":    "coder",
            "executor": "executor",
            "human":    "human",
            "debugger": "debugger"
        }
    )

    builder.add_edge("executor", END)
    builder.add_edge("human",    END)

    return builder.compile()