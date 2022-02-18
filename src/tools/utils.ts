import { Err, isNoneVariant, matchOption, Ok, Result, Some } from "./result";
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

// Delay some time to avoid getting rate limited by the RPC node
export const wait = async (time = 8000) => {
  await new Promise((_: any) => setTimeout(_, time));
};

const copyGameBoard = (board: GameBoard) => {
  return board.slice().map((x) => x.slice()) as GameBoard;
};

/**
 * Given a board and a move request compute the next game state.
 *
 * TODO: Add logic to check for final game state.
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

/**
 * Handle Computer move.
 *
 * TODO: Create computer AI game logic.
 */
export const getComputerMove = (board: GameBoard): Result<Position, string> => {
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      const tile = board[y][x];
      if (isNoneVariant(tile)) {
        const yPosition = validateTileIndex(y);
        const xPosition = validateTileIndex(x);
        return Ok([yPosition, xPosition]);
      }
    }
  }

  return Err("No computer move possible - this shouldn't happen.");
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
