import { Err, isNoneVariant, matchOption, Ok, Result, Some } from "./result";
import {
  GameBoard,
  GameState,
  GameStatus,
  Player,
  Position,
  Row,
  TileIndex,
} from "./types";

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

const isWinningRow = (row: Row): boolean => {
  const anyNone = row.some(isNoneVariant);
  if (anyNone) {
    return false;
  }

  const [a, b, c] = row.map((opt) => opt.unwrap());
  return a === b && b === c;
};

const getWinningPlayerFromRow = (row: Row) => {
  if (row[0].unwrap() === Player.X) {
    return GameStatus.XWins;
  } else {
    return GameStatus.OWins;
  }
};

/**
 * Give a game board determine the current game status.
 */
const getGameBoardStatus = (gameBoard: GameBoard): GameStatus => {
  const b = gameBoard;

  let row: Row;
  row = [b[0][0], b[0][1], b[0][2]];
  if (isWinningRow(row)) {
    return getWinningPlayerFromRow(row);
  }

  row = [b[1][0], b[1][1], b[1][2]];
  if (isWinningRow(row)) {
    return getWinningPlayerFromRow(row);
  }

  row = [b[2][0], b[2][1], b[2][2]];
  if (isWinningRow(row)) {
    return getWinningPlayerFromRow(row);
  }

  let column: Row;
  column = [b[0][0], b[1][0], b[2][0]];
  if (isWinningRow(column)) {
    return getWinningPlayerFromRow(column);
  }

  column = [b[0][1], b[1][1], b[2][1]];
  if (isWinningRow(column)) {
    return getWinningPlayerFromRow(column);
  }

  column = [b[0][2], b[1][2], b[2][2]];
  if (isWinningRow(column)) {
    return getWinningPlayerFromRow(column);
  }

  let diagonal: Row;
  diagonal = [b[0][0], b[1][1], b[2][2]];
  if (isWinningRow(diagonal)) {
    return getWinningPlayerFromRow(diagonal);
  }

  diagonal = [b[2][0], b[1][1], b[0][2]];
  if (isWinningRow(diagonal)) {
    return getWinningPlayerFromRow(diagonal);
  }

  // If any tile is empty the game is still in play
  for (const row of gameBoard) {
    for (const tile of row) {
      if (isNoneVariant(tile)) {
        return GameStatus.Playing;
      }
    }
  }

  // If nothing else was returned the game is a stalemate
  return GameStatus.Stalemate;
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
  const { board, nextPlayerToMove, humanPlayerSelection } = state;

  const [y, x] = position;
  const tile = board[y][x];
  const nextBoardState = copyGameBoard(board);

  return matchOption(tile, {
    some: (_) => {
      return Err("Tile is already occupied, please choose another.");
    },
    none: () => {
      nextBoardState[y][x] = Some(nextPlayerToMove);

      // Get the next player and game status
      const nextPlayer = getNextPlayer(nextPlayerToMove);
      const status = getGameBoardStatus(nextBoardState);

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
