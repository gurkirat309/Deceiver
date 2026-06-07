"""
Deceiver — FastAPI Application
Main entry point with all API endpoints wired to LangGraph node pipelines.
"""

import random
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import (
    GameState, PlayerState, ChatMessage,
    StartGameRequest, HumanMessageRequest, SubmitVoteRequest,
)
from prompts import CHARACTER_PROMPTS, CHARACTER_POOL
from state_manager import get_state, set_state, reset_state
from graph import (
    run_day_message_pipeline,
    run_voting_pipeline,
    run_night_pipeline,
    heartbeat_node,
)


# ──────────────────────────────────────────────
# App Setup
# ──────────────────────────────────────────────

app = FastAPI(title="Deceiver API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────────────────────────
# GET /characters — Return the character pool
# ──────────────────────────────────────────────

@app.get("/characters")
async def get_characters():
    """Return the full pool of 8 characters for the selection screen."""
    return {"characters": CHARACTER_POOL}


# ──────────────────────────────────────────────
# POST /start-game — Initialize a new game
# ──────────────────────────────────────────────

@app.post("/start-game")
async def start_game(request: StartGameRequest):
    """
    Initialize the game with the human's selected characters.
    Assigns roles randomly (1 Traitor, 4 Innocents).
    """
    selected = request.selected_characters
    if len(selected) != 4:
        raise HTTPException(status_code=400, detail="You must select exactly 4 characters.")

    # Validate all selected characters exist in the pool
    valid_names = [c["name"] for c in CHARACTER_POOL]
    for name in selected:
        if name not in valid_names:
            raise HTTPException(status_code=400, detail=f"Unknown character: {name}")

    # Build the 5-player roster: 1 human + 4 AI agents
    # Roles: 1 traitor, 4 innocents — fully random assignment
    roles = ["traitor", "innocent", "innocent", "innocent", "innocent"]
    random.shuffle(roles)

    players = []

    # Human player (index 0)
    players.append(PlayerState(
        player_id="p0",
        character_name=request.player_name,
        role=roles[0],
        personality_prompt="Human player — no AI persona.",
        is_human=True,
        is_alive=True,
    ))

    # AI agents (indices 1-4)
    for i, char_name in enumerate(selected):
        players.append(PlayerState(
            player_id=f"p{i + 1}",
            character_name=char_name,
            role=roles[i + 1],
            personality_prompt=CHARACTER_PROMPTS.get(char_name, ""),
            is_human=False,
            is_alive=True,
        ))

    # Create the game state
    game_state = GameState(
        phase="day",
        players=players,
        chat_log=[
            ChatMessage(
                sender="SYSTEM",
                message="☀️ --- ROUND 1: THE INVESTIGATION BEGINS ---",
                timestamp=datetime.now().isoformat(),
            ),
            ChatMessage(
                sender="SYSTEM",
                message="One among you is the Deceiver. Find them before it's too late.",
                timestamp=datetime.now().isoformat(),
            ),
        ],
        round_number=1,
    )

    set_state(game_state)
    return game_state


# ──────────────────────────────────────────────
# GET /game-state — Fetch current state
# ──────────────────────────────────────────────

@app.get("/game-state")
async def game_state_endpoint():
    """Return the current game state."""
    return get_state()


# ──────────────────────────────────────────────
# POST /human-message — Human sends a chat message
# ──────────────────────────────────────────────

@app.post("/human-message")
async def human_message(request: HumanMessageRequest):
    """
    Human sends a message during day phase.
    Triggers 1-2 AI agent responses via the LangGraph day pipeline.
    """
    state = get_state()
    if state.phase != "day":
        raise HTTPException(status_code=400, detail="Chat is only allowed during the day phase.")

    human = next((p for p in state.players if p.is_human), None)
    if not human or not human.is_alive:
        raise HTTPException(status_code=400, detail="Human player is not alive.")

    updated = run_day_message_pipeline(state, request.message, human.character_name)
    set_state(updated)
    return updated


# ──────────────────────────────────────────────
# POST /ai-heartbeat — Trigger spontaneous AI message
# ──────────────────────────────────────────────

@app.post("/ai-heartbeat")
async def ai_heartbeat():
    """
    Trigger a random AI agent to speak autonomously.
    Called by the frontend every 8 seconds when the human is idle.
    Only works during day phase.
    """
    state = get_state()
    if state.phase != "day":
        return state  # Silently return — no error, just no action

    updated = heartbeat_node(state)
    set_state(updated)
    return updated


# ──────────────────────────────────────────────
# POST /start-voting — Transition to voting phase
# ──────────────────────────────────────────────

@app.post("/start-voting")
async def start_voting():
    """Transition the game to the voting phase (called when timer hits 0)."""
    state = get_state()
    if state.phase != "day":
        raise HTTPException(status_code=400, detail="Can only start voting from the day phase.")

    state.phase = "voting"
    state.chat_log.append(ChatMessage(
        sender="SYSTEM",
        message="⏰ Time's up! The interrogation begins. Cast your votes.",
        timestamp=datetime.now().isoformat(),
    ))
    set_state(state)
    return state


# ──────────────────────────────────────────────
# POST /submit-vote — Human votes, AI votes run, resolve
# ──────────────────────────────────────────────

@app.post("/submit-vote")
async def submit_vote(request: SubmitVoteRequest):
    """
    Human submits their vote. Triggers all AI votes,
    resolves the tally, banishes the top-voted player, reveals role.
    """
    state = get_state()
    if state.phase != "voting":
        raise HTTPException(status_code=400, detail="Voting is not active.")

    # Validate target exists and is alive
    target = next((p for p in state.players if p.player_id == request.voted_for_id and p.is_alive), None)
    if not target:
        raise HTTPException(status_code=400, detail="Invalid vote target.")

    updated = run_voting_pipeline(state, request.voted_for_id)
    set_state(updated)
    return updated


# ──────────────────────────────────────────────
# POST /run-night — Execute night phase
# ──────────────────────────────────────────────

@app.post("/run-night")
async def run_night():
    """
    Execute the full night phase:
    traitor strategy → night kill → phase transition to next day.
    """
    state = get_state()
    if state.phase not in ("vote_result", "night"):
        raise HTTPException(status_code=400, detail="Night phase cannot run from the current phase.")

    state.phase = "night"
    updated = run_night_pipeline(state)
    set_state(updated)
    return updated


# ──────────────────────────────────────────────
# POST /reset — Reset the game
# ──────────────────────────────────────────────

@app.post("/reset")
async def reset_game():
    """Reset the game state entirely."""
    return reset_state()
