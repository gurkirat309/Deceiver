"""
Deceiver — State Manager
In-memory singleton holding the live GameState for a single session.
"""

from models import GameState


# ──────────────────────────────────────────────
# Global State Singleton
# ──────────────────────────────────────────────

_game_state: GameState = GameState()


def get_state() -> GameState:
    """Return the current game state."""
    return _game_state


def set_state(state: GameState) -> None:
    """Replace the entire game state."""
    global _game_state
    _game_state = state


def reset_state() -> GameState:
    """Reset to a fresh game state and return it."""
    global _game_state
    _game_state = GameState()
    return _game_state
