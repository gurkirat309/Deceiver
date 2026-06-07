"""
Deceiver — LangGraph Node Functions
Each function represents a node in the game's state graph.
"""

import random
from datetime import datetime
from models import GameState, ChatMessage, EliminatedRecord, VoteDetail
from agents import (
    generate_day_response,
    generate_vote,
    generate_night_target,
    generate_traitor_strategy,
)


# ──────────────────────────────────────────────
# Day Phase Nodes
# ──────────────────────────────────────────────

def human_message_node(game_state: GameState, message: str, sender_name: str) -> GameState:
    """Append the human player's message to chat log."""
    game_state.chat_log.append(ChatMessage(
        sender=sender_name,
        message=message,
        timestamp=datetime.now().isoformat(),
    ))
    return game_state


def agent_selector_node(game_state: GameState) -> list[str]:
    """Select 1-2 random AI agents to respond to the current conversation."""
    alive_ais = [p for p in game_state.players if p.is_alive and not p.is_human]
    if not alive_ais:
        return []
    num_responders = random.randint(1, min(2, len(alive_ais)))
    selected = random.sample(alive_ais, num_responders)
    return [p.player_id for p in selected]


def day_response_node(game_state: GameState, agent_ids: list[str]) -> GameState:
    """Generate day-phase chat responses for the selected AI agents."""
    for agent_id in agent_ids:
        player = next((p for p in game_state.players if p.player_id == agent_id), None)
        if player and player.is_alive:
            response_text = generate_day_response(player, game_state)
            game_state.chat_log.append(ChatMessage(
                sender=player.character_name,
                message=response_text,
                timestamp=datetime.now().isoformat(),
            ))
    return game_state


def heartbeat_node(game_state: GameState) -> GameState:
    """Trigger a single random AI agent to speak autonomously (when human is idle)."""
    alive_ais = [p for p in game_state.players if p.is_alive and not p.is_human]
    if not alive_ais:
        return game_state
    ai = random.choice(alive_ais)
    response_text = generate_day_response(ai, game_state)
    game_state.chat_log.append(ChatMessage(
        sender=ai.character_name,
        message=response_text,
        timestamp=datetime.now().isoformat(),
    ))
    return game_state


# ──────────────────────────────────────────────
# Voting Phase Nodes
# ──────────────────────────────────────────────

def voting_node(game_state: GameState, human_vote_id: str) -> GameState:
    """All players (human + AI) cast their votes. Returns updated state with tallies."""
    game_state.vote_tally = {}
    game_state.vote_details = []

    # Human vote
    human = next((p for p in game_state.players if p.is_human), None)
    human_target = next((p for p in game_state.players if p.player_id == human_vote_id), None)
    if human and human_target:
        game_state.vote_details.append(VoteDetail(
            voter=human.character_name,
            voted_for=human_target.character_name,
            reasoning="Player's choice",
        ))
        game_state.vote_tally[human_target.player_id] = game_state.vote_tally.get(human_target.player_id, 0) + 1

    # AI votes
    alive_ais = [p for p in game_state.players if p.is_alive and not p.is_human]
    for ai in alive_ais:
        vote_result = generate_vote(ai, game_state)
        # Find the target player by name
        target_player = next(
            (p for p in game_state.players if p.character_name.lower() == vote_result.target.lower()),
            None
        )
        if target_player:
            game_state.vote_details.append(VoteDetail(
                voter=ai.character_name,
                voted_for=target_player.character_name,
                reasoning=vote_result.reasoning,
            ))
            game_state.vote_tally[target_player.player_id] = game_state.vote_tally.get(target_player.player_id, 0) + 1

    return game_state


def vote_resolver_node(game_state: GameState) -> GameState:
    """Tally votes, banish the player with the most votes, reveal their role."""
    if not game_state.vote_tally:
        return game_state

    # Find player with most votes (random tiebreaker)
    max_votes = max(game_state.vote_tally.values())
    top_candidates = [pid for pid, count in game_state.vote_tally.items() if count == max_votes]
    eliminated_id = random.choice(top_candidates)

    # Apply elimination
    for p in game_state.players:
        if p.player_id == eliminated_id:
            p.is_alive = False
            record = EliminatedRecord(
                player_id=p.player_id,
                character_name=p.character_name,
                role=p.role,
                round_eliminated=game_state.round_number,
                reason="voted_out",
            )
            game_state.eliminated_players.append(record)
            game_state.last_eliminated = record
            game_state.chat_log.append(ChatMessage(
                sender="SYSTEM",
                message=f"🔨 {p.character_name} has been banished! They were a {p.role.upper()}.",
                timestamp=datetime.now().isoformat(),
            ))
            break

    # Set phase to vote_result so frontend can show the reveal screen
    game_state.phase = "vote_result"

    # Check win condition
    _check_win_condition(game_state)

    return game_state


# ──────────────────────────────────────────────
# Night Phase Nodes
# ──────────────────────────────────────────────

def traitor_strategy_node(game_state: GameState) -> GameState:
    """Run the traitor's hidden strategy reasoning (updates private_notes)."""
    traitor = next(
        (p for p in game_state.players if p.is_alive and p.role == "traitor"),
        None
    )
    if traitor and not traitor.is_human:
        new_notes = generate_traitor_strategy(traitor, game_state)
        traitor.private_notes = new_notes
    return game_state


def night_kill_node(game_state: GameState) -> GameState:
    """Traitor selects and eliminates one innocent player at night."""
    traitor = next(
        (p for p in game_state.players if p.is_alive and p.role == "traitor"),
        None
    )

    valid_targets = [p for p in game_state.players if p.is_alive and p.role == "innocent"]

    if not traitor or not valid_targets:
        return game_state

    if traitor.is_human:
        # Human is the traitor — AI auto-selects a random target
        target_player = random.choice(valid_targets)
        reasoning = "Fate has chosen."
    else:
        # AI traitor picks the target
        night_result = generate_night_target(traitor, game_state)
        target_player = next(
            (p for p in valid_targets if p.character_name.lower() == night_result.target.lower()),
            None
        )
        if not target_player:
            # Fuzzy fallback
            for p in valid_targets:
                if p.character_name.lower() in night_result.target.lower() or night_result.target.lower() in p.character_name.lower():
                    target_player = p
                    break
            else:
                target_player = random.choice(valid_targets)
        reasoning = night_result.reasoning

    # Apply elimination
    target_player.is_alive = False
    record = EliminatedRecord(
        player_id=target_player.player_id,
        character_name=target_player.character_name,
        role=target_player.role,
        round_eliminated=game_state.round_number,
        reason="night_kill",
    )
    game_state.eliminated_players.append(record)
    game_state.night_kill_target = target_player.character_name

    return game_state


# ──────────────────────────────────────────────
# Phase Transition
# ──────────────────────────────────────────────

def phase_transition_node(game_state: GameState) -> GameState:
    """Advance to the next day phase after night, announce events, check win condition."""
    if game_state.winner:
        game_state.phase = "game_over"
        return game_state

    # Announce night kill
    if game_state.night_kill_target:
        game_state.chat_log.append(ChatMessage(
            sender="SYSTEM",
            message=f"🌙 The city sleeps... {game_state.night_kill_target} was eliminated in the night.",
            timestamp=datetime.now().isoformat(),
        ))

    # Check win condition after night
    _check_win_condition(game_state)
    if game_state.winner:
        game_state.phase = "game_over"
        return game_state

    # Advance to next day
    game_state.round_number += 1
    game_state.phase = "day"
    game_state.vote_tally = {}
    game_state.vote_details = []
    game_state.night_kill_target = None
    game_state.last_eliminated = None

    game_state.chat_log.append(ChatMessage(
        sender="SYSTEM",
        message=f"☀️ --- ROUND {game_state.round_number} BEGINS ---",
        timestamp=datetime.now().isoformat(),
    ))

    return game_state


# ──────────────────────────────────────────────
# Win Condition Check
# ──────────────────────────────────────────────

def _check_win_condition(game_state: GameState) -> None:
    """Check if the game is over. Mutates game_state.winner if so."""
    alive_traitors = [p for p in game_state.players if p.is_alive and p.role == "traitor"]
    alive_innocents = [p for p in game_state.players if p.is_alive and p.role == "innocent"]

    if len(alive_traitors) == 0:
        game_state.winner = "innocents"
        game_state.phase = "game_over"
    elif len(alive_traitors) >= len(alive_innocents):
        game_state.winner = "traitors"
        game_state.phase = "game_over"
