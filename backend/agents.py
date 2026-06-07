"""
Deceiver — LLM Agent Wrappers
LangChain-Groq powered agent functions for chat, voting, night kills, and strategy.
"""

import os
import random
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage
from models import PlayerState, GameState, VoteResult, NightTarget
from prompts import (
    build_day_prompt,
    build_voting_prompt,
    build_night_prompt,
    build_traitor_strategy_prompt,
)

load_dotenv()

# ──────────────────────────────────────────────
# LLM Instances
# ──────────────────────────────────────────────

llm_chat = ChatGroq(
    model="llama-3.1-8b-instant",
    temperature=0.8,
    api_key=os.getenv("GROQ_API_KEY"),
)

llm_structured = ChatGroq(
    model="llama-3.1-8b-instant",
    temperature=0.2,
    api_key=os.getenv("GROQ_API_KEY"),
)

# Structured output chains
vote_chain = llm_structured.with_structured_output(VoteResult)
night_chain = llm_structured.with_structured_output(NightTarget)


# ──────────────────────────────────────────────
# Helper: Build context strings from game state
# ──────────────────────────────────────────────

def _build_players_str(player: PlayerState, game_state: GameState) -> str:
    """Build the alive players string. Traitors see all roles; innocents see 'Unknown'."""
    parts = []
    for p in game_state.players:
        if not p.is_alive:
            continue
        if player.role == "traitor":
            # Traitor sees all roles
            role_label = p.role.upper()
        elif p.player_id == player.player_id:
            # You see your own role
            role_label = p.role.upper()
        else:
            role_label = "Unknown"
        parts.append(f"{p.character_name} ({role_label})")
    return ", ".join(parts)


def _build_chat_str(game_state: GameState, last_n: int = 10) -> str:
    """Build the recent chat history string."""
    recent = game_state.chat_log[-last_n:]
    return "\n".join([f"{msg.sender}: {msg.message}" for msg in recent])


def _get_valid_targets(player: PlayerState, game_state: GameState) -> list[PlayerState]:
    """Get alive players that this player can vote for (everyone except themselves)."""
    return [p for p in game_state.players if p.is_alive and p.player_id != player.player_id]


# ──────────────────────────────────────────────
# Day Phase — Generate Chat Response
# ──────────────────────────────────────────────

def generate_day_response(player: PlayerState, game_state: GameState) -> str:
    """Generate a day-phase chat message for the given AI agent."""
    prompt = build_day_prompt(
        character_name=player.character_name,
        role=player.role,
        personality_prompt=player.personality_prompt,
        alive_players_str=_build_players_str(player, game_state),
        chat_history_str=_build_chat_str(game_state),
        private_notes=player.private_notes if player.role == "traitor" else "",
    )

    try:
        response = llm_chat.invoke([SystemMessage(content=prompt)])
        text = response.content.strip()
        # Clean up any accidental self-attribution
        if text.startswith(f"{player.character_name}:"):
            text = text[len(f"{player.character_name}:"):].strip()
        return text
    except Exception as e:
        print(f"[LLM Error - Day Response for {player.character_name}]: {e}")
        return "Hmm... I'm not sure what to say right now."


# ──────────────────────────────────────────────
# Voting Phase — Generate Structured Vote
# ──────────────────────────────────────────────

def generate_vote(player: PlayerState, game_state: GameState) -> VoteResult:
    """Generate a structured vote decision for the given AI agent."""
    valid_targets = _get_valid_targets(player, game_state)
    targets_str = ", ".join([p.character_name for p in valid_targets])

    prompt = build_voting_prompt(
        character_name=player.character_name,
        role=player.role,
        personality_prompt=player.personality_prompt,
        valid_targets_str=targets_str,
        chat_history_str=_build_chat_str(game_state, last_n=15),
    )

    try:
        result = vote_chain.invoke([SystemMessage(content=prompt)])
        # Validate the target is a real alive player
        valid_names = [p.character_name.lower() for p in valid_targets]
        if result.target.lower() not in valid_names:
            # Try fuzzy match
            for p in valid_targets:
                if p.character_name.lower() in result.target.lower() or result.target.lower() in p.character_name.lower():
                    result.target = p.character_name
                    break
            else:
                # Fallback to random
                result.target = random.choice(valid_targets).character_name
                result.reasoning = "I had to make a quick decision."
        return result
    except Exception as e:
        print(f"[LLM Error - Vote for {player.character_name}]: {e}")
        fallback = random.choice(valid_targets) if valid_targets else None
        return VoteResult(
            target=fallback.character_name if fallback else "Unknown",
            reasoning="I went with my gut."
        )


# ──────────────────────────────────────────────
# Night Phase — Traitor Kill Target
# ──────────────────────────────────────────────

def generate_night_target(traitor: PlayerState, game_state: GameState) -> NightTarget:
    """Generate the traitor's night kill target selection."""
    valid_targets = [p for p in game_state.players if p.is_alive and p.role == "innocent"]
    targets_str = ", ".join([p.character_name for p in valid_targets])

    prompt = build_night_prompt(
        character_name=traitor.character_name,
        personality_prompt=traitor.personality_prompt,
        valid_targets_str=targets_str,
        private_notes=traitor.private_notes,
    )

    try:
        result = night_chain.invoke([SystemMessage(content=prompt)])
        # Validate target
        valid_names = [p.character_name.lower() for p in valid_targets]
        if result.target.lower() not in valid_names:
            for p in valid_targets:
                if p.character_name.lower() in result.target.lower() or result.target.lower() in p.character_name.lower():
                    result.target = p.character_name
                    break
            else:
                result.target = random.choice(valid_targets).character_name
                result.reasoning = "Eliminated the biggest threat."
        return result
    except Exception as e:
        print(f"[LLM Error - Night Target]: {e}")
        fallback = random.choice(valid_targets) if valid_targets else None
        return NightTarget(
            target=fallback.character_name if fallback else "Unknown",
            reasoning="Eliminated the biggest threat."
        )


# ──────────────────────────────────────────────
# Traitor Strategy — Private Reasoning
# ──────────────────────────────────────────────

def generate_traitor_strategy(traitor: PlayerState, game_state: GameState) -> str:
    """Generate the traitor's hidden strategic notes (never exposed to others)."""
    prompt = build_traitor_strategy_prompt(
        character_name=traitor.character_name,
        personality_prompt=traitor.personality_prompt,
        alive_players_str=_build_players_str(traitor, game_state),
        chat_history_str=_build_chat_str(game_state, last_n=15),
        previous_notes=traitor.private_notes,
    )

    try:
        response = llm_chat.invoke([SystemMessage(content=prompt)])
        return response.content.strip()
    except Exception as e:
        print(f"[LLM Error - Traitor Strategy]: {e}")
        return traitor.private_notes  # Keep old notes on failure
