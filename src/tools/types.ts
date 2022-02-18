import { None, Option } from "./result";

export enum Player {
  X = "X",
  O = "O",
}

export type Tile = Option<Player>;

type Row = [Tile, Tile, Tile];

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
 * O is at (0, 2)
 * X is at (2, 1)
 *
 * Position type = (y, x)
 */
const defaultBoard: GameBoard = [
  [None(), None(), None()],
  [None(), None(), None()],
  [None(), None(), None()],
];

export enum GameStatus {
  PlayerSelection = "PlayerSelection",
  Playing = "Playing",
  Stalemate = "Stalemate",
  XWins = "XWins",
  OWins = "OWins",
}

export interface GameState {
  board: GameBoard;
  status: GameStatus;
  nextPlayerToMove: Player;
  humanPlayerSelection: Player;
}

export const getDefaultGameState = (): GameState => {
  return {
    board: defaultBoard,
    status: GameStatus.PlayerSelection,
    humanPlayerSelection: Player.X,
    nextPlayerToMove: Player.X,
  };
};

export const getInitialGameState = (
  humanPlayerSelection: Player
): GameState => {
  return {
    board: defaultBoard,
    humanPlayerSelection,
    status: GameStatus.Playing,
    nextPlayerToMove: humanPlayerSelection,
  };
};
