import { None, Option } from "./result";

export enum Player {
  X = "X",
  O = "O",
}

export type Tile = Option<Player>;

export type Row = [Tile, Tile, Tile];

export type TileIndex = 0 | 1 | 2;

export type Position = [TileIndex, TileIndex];

export type GameBoard = [Row, Row, Row];

/**
 * How coordinates work:
 *
 * [
 *   [_, _, O],
 *   [_, _, _],
 *   [_, X, _],
 * ]
 *
 * Coordinates = (y, x)
 * In the above 2D grid:
 * O is at (0, 2)
 * X is at (2, 1)
 */
const defaultBoard: GameBoard = [
  [None(), None(), None()],
  [None(), None(), None()],
  [None(), None(), None()],
];

// Game Status enum - the game must be in one of these states at all times
export enum GameStatus {
  PlayerSelection = "PlayerSelection",
  Playing = "Playing",
  Stalemate = "Stalemate",
  XWins = "XWins",
  OWins = "OWins",
}

// Primary state object, this includes all the relevant state for the game
// at any point in time
export interface GameState {
  board: GameBoard;
  status: GameStatus;
  nextPlayerToMove: Player;
  humanPlayerSelection: Player;
}

/**
 * Get the default game state (before player selection).
 */
export const getDefaultGameState = (): GameState => {
  return {
    board: defaultBoard,
    status: GameStatus.PlayerSelection,
    humanPlayerSelection: Player.X,
    nextPlayerToMove: Player.X,
  };
};

/**
 * Get initial game state once the player has selected their token.
 */
export const getInitialGameState = (
  humanPlayerSelection: Player
): GameState => {
  return {
    board: defaultBoard,
    status: GameStatus.Playing,
    humanPlayerSelection,
    nextPlayerToMove: humanPlayerSelection,
  };
};
