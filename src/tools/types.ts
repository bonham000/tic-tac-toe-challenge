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

const defaultBoard: GameBoard = [
  [None(), None(), None()],
  [None(), None(), None()],
  [None(), None(), None()],
];

export enum GameStatus {
  NotStarted = "NotStarted",
  Playing = "Playing",
  Stalemate = "Stalemate",
  XWins = "XWins",
  OWins = "OWins",
}

export interface GameState {
  board: GameBoard;
  status: GameStatus;
  nextPlayerToMove: Player;
}

export const getDefaultGameState = (startingPlayer: Player): GameState => {
  return {
    board: defaultBoard,
    status: GameStatus.NotStarted,
    nextPlayerToMove: startingPlayer,
  };
};
