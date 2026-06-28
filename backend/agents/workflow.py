"""
LangGraph workflow definition — orchestrates all 7 career counseling agents.
"""

from langgraph.graph import StateGraph, END

from agents.nodes import (
    GraphState,
    assessment_agent,
    skill_gap_agent,
    career_recommendation_agent,
    roadmap_agent,
    employability_agent,
    resume_agent,
    interview_agent,
    final_report_generator,
)


def build_workflow() -> StateGraph:
    workflow = StateGraph(GraphState)

    # Add nodes
    workflow.add_node("assessment", assessment_agent)
    workflow.add_node("skill_gap", skill_gap_agent)
    workflow.add_node("career_recommendation", career_recommendation_agent)
    workflow.add_node("roadmap", roadmap_agent)
    workflow.add_node("employability", employability_agent)
    workflow.add_node("resume", resume_agent)
    workflow.add_node("interview", interview_agent)
    workflow.add_node("final_report", final_report_generator)

    # Define sequential edges
    workflow.set_entry_point("assessment")
    workflow.add_edge("assessment", "skill_gap")
    workflow.add_edge("skill_gap", "career_recommendation")
    workflow.add_edge("career_recommendation", "roadmap")
    workflow.add_edge("roadmap", "employability")
    workflow.add_edge("employability", "resume")
    workflow.add_edge("resume", "interview")
    workflow.add_edge("interview", "final_report")
    workflow.add_edge("final_report", END)

    return workflow.compile()


# Compile once at import time
career_workflow = build_workflow()


async def run_career_workflow(user_profile: dict) -> dict:
    """Run the full LangGraph workflow and return the final report."""
    initial_state: GraphState = {"user_profile": user_profile}
    result = await career_workflow.ainvoke(initial_state)
    return result.get("final_report", {})
