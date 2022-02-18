import { Err, matchOption, Ok, Result, Some } from "./result";
import { GameBoard, GameState, Player, Position, TileIndex } from "./types";

/**
 * Assert a condition cannot occur. Used for writing exhaustive switch
 * blocks guarantee every value is handled.
 */
export const assertUnreachable = (x: never): never => {
  throw new Error(
    `assertUnreachable received a value which should not exist: ${JSON.stringify(
      x
    )}`
  );
};

const copyGameBoard = (board: GameBoard) => {
  return board.slice().map((x) => x.slice()) as GameBoard;
};

/**
 * Given a board and a move request compute the next game state.
 */
export const getNextGameState = (
  state: GameState,
  position: Position
): Result<GameState, string> => {
  const { board, status, nextPlayerToMove, humanPlayerSelection } = state;

  const [y, x] = position;
  const tile = board[y][x];
  const nextBoardState = copyGameBoard(board);

  return matchOption(tile, {
    some: (_) => {
      return Err("Tile is already occupied");
    },
    none: () => {
      nextBoardState[y][x] = Some(nextPlayerToMove);
      const nextPlayer = getNextPlayer(nextPlayerToMove);

      return Ok({
        status,
        board: nextBoardState,
        nextPlayerToMove: nextPlayer,
        humanPlayerSelection,
      });
    },
  });
};

export const getNextPlayer = (player: Player) => {
  switch (player) {
    case Player.X:
      return Player.O;
    case Player.O:
      return Player.X;
    default:
      return assertUnreachable(player);
  }
};

export const validateTileIndex = (value: number) => {
  switch (value) {
    case 0:
    case 1:
    case 2: {
      const index: TileIndex = value;
      return index;
    }
    default: {
      throw new Error(
        "Invalid index value supplied as a tile index. Only 0 1 2 are allowed."
      );
    }
  }
};
