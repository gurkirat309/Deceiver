"""
Deceiver — LangGraph StateGraph Definition
Orchestrates the multi-agent game flow using LangGraph nodes.

Note: For v1, we use a simplified orchestration approach where
the FastAPI endpoints directly invoke node functions in sequence,
rather than running a full autonomous LangGraph compiled graph.
This gives us maximum control over the game loop while still
keeping all game logic in dedicated node functions.
"""

from nodes import (
    human_message_node,
    agent_selector_node,
    day_response_node,
    heartbeat_node,
    voting_node,
    vote_resolver_node,
    traitor_strategy_node,
    night_kill_node,
    phase_transition_node,
)

# Re-export all nodes for easy access from main.py
__all__ = [
    "human_message_node",
    "agent_selector_node",
    "day_response_node",
    "heartbeat_node",
    "voting_node",
    "vote_resolver_node",
    "traitor_strategy_node",
    "night_kill_node",
    "phase_transition_node",
]


def run_day_message_pipeline(game_state, message: str, sender_name: str):
    """
    Full day-phase pipeline when human sends a message:
    1. Append human message
    2. Select 1-2 AI agents to respond
    3. Generate AI responses
    Returns the updated game state.
    """
    game_state = human_message_node(game_state, message, sender_name)
    selected_ids = agent_selector_node(game_state)
    game_state = day_response_node(game_state, selected_ids)
    return game_state


def run_voting_pipeline(game_state, human_vote_id: str):
    """
    Full voting pipeline:
    1. Collect all votes (human + AI)
    2. Resolve: tally, banish, reveal role
    Returns the updated game state.
    """
    game_state = voting_node(game_state, human_vote_id)
    game_state = vote_resolver_node(game_state)
    return game_state


def run_night_pipeline(game_state):
    """
    Full night pipeline:
    1. Traitor strategy (hidden reasoning)
    2. Night kill
    3. Phase transition to next day
    Returns the updated game state.
    """
    game_state = traitor_strategy_node(game_state)
    game_state = night_kill_node(game_state)
    game_state = phase_transition_node(game_state)
    return game_state
