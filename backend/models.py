"""
Deceiver — Pydantic Models
All game state schemas, structured LLM outputs, and API request/response models.
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Literal
from datetime import datetime


# ──────────────────────────────────────────────
# Chat & Communication
# ──────────────────────────────────────────────

class ChatMessage(BaseModel):
    sender: str
    message: str
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())


# ──────────────────────────────────────────────
# Player State
# ──────────────────────────────────────────────

class PlayerState(BaseModel):
    player_id: str
    character_name: str                              # e.g. "Sherlock Holmes" or human's name
    role: Literal["innocent", "traitor"] = "innocent"
    personality_prompt: str = ""
    suspicion_scores: Dict[str, float] = Field(default_factory=dict)
    is_alive: bool = True
    is_human: bool = False
    private_notes: str = ""                          # traitor-only hidden strategy log


# ──────────────────────────────────────────────
# Elimination Records
# ──────────────────────────────────────────────

class EliminatedRecord(BaseModel):
    player_id: str
    character_name: str
    role: str                                        # revealed on elimination
    round_eliminated: int
    reason: Literal["voted_out", "night_kill"]


# ──────────────────────────────────────────────
# Vote Detail
# ──────────────────────────────────────────────

class VoteDetail(BaseModel):
    voter: str
    voted_for: str
    reasoning: str = ""


# ──────────────────────────────────────────────
# Game State (Global Singleton)
# ──────────────────────────────────────────────

class GameState(BaseModel):
    phase: Literal[
        "setup", "day", "voting", "vote_result",
        "night", "game_over"
    ] = "setup"
    players: List[PlayerState] = Field(default_factory=list)
    chat_log: List[ChatMessage] = Field(default_factory=list)
    vote_tally: Dict[str, int] = Field(default_factory=dict)
    vote_details: List[VoteDetail] = Field(default_factory=list)
    eliminated_players: List[EliminatedRecord] = Field(default_factory=list)
    round_number: int = 1
    winner: Optional[Literal["innocents", "traitors"]] = None
    last_eliminated: Optional[EliminatedRecord] = None  # most recent elimination for reveal screen
    night_kill_target: Optional[str] = None              # character name killed at night


# ──────────────────────────────────────────────
# Structured LLM Outputs
# ──────────────────────────────────────────────

class VoteResult(BaseModel):
    """Structured output for AI voting decisions."""
    target: str = Field(description="The exact character name of the player you are voting to banish.")
    reasoning: str = Field(description="A brief 1-sentence explanation for your vote.")


class NightTarget(BaseModel):
    """Structured output for traitor night kill decisions."""
    target: str = Field(description="The exact character name of the innocent player you want to eliminate.")
    reasoning: str = Field(description="A brief 1-sentence explanation for your choice.")


# ──────────────────────────────────────────────
# API Request Models
# ──────────────────────────────────────────────

class StartGameRequest(BaseModel):
    selected_characters: List[str]                   # exactly 4 character names from the pool
    player_name: str = "Detective"                   # human player's display name


class HumanMessageRequest(BaseModel):
    message: str


class SubmitVoteRequest(BaseModel):
    voted_for_id: str                                # player_id of the target
