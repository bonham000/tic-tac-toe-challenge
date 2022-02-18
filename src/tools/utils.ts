import {
  assertUnreachable,
  Err,
  isNoneVariant,
  matchOption,
  Ok,
  Result,
  Some,
} from "./result";
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
 * Delay some time to avoid getting rate limited by the RPC node.
 */
export const wait = async (time = 8000) => {
  await new Promise((_: any) => setTimeout(_, time));
};

/**
 * Given a board and a move request compute the next game state.
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
 * Copy the game board.
 */
const copyGameBoard = (board: GameBoard) => {
  return board.slice().map((x) => x.slice()) as GameBoard;
};

/**
 * Simply toggle the player. X -> O. O -> X.
 */
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

/**
 * Determine if three consecutive tiles (row, column, or diagonal) are
 * equivalent and mark a winning combination.
 */
const isWinningRow = (row: Row): boolean => {
  // None of the tiles can be a None variant
  const anyNone = row.some(isNoneVariant);
  if (anyNone) {
    return false;
  }

  // Check each tile is equivalent to the others
  const [a, b, c] = row.map((opt) => opt.unwrap());
  return a === b && b === c;
};

/**
 * Get the winning player from a winning row.
 */
const getWinningPlayerFromRow = (row: Row) => {
  if (row[0].unwrap() === Player.X) {
    return GameStatus.XWins;
  } else {
    return GameStatus.OWins;
  }
};

/**
 * Give a game board determine the current game status.
 *
 * This function checks each possible winning row for a winner, then checks
 * if there are any unplayed tiles (game is still going) and then finally
 * returns stalemate as the final outcome.
 */
const getGameBoardStatus = (gameBoard: GameBoard): GameStatus => {
  const b = gameBoard;

  // Check three rows
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

  // Check three columns
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

  // Check two diagonals
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

interface ScoredMove {
  score: number;
  position: Position;
}

/**
 * Handle Computer move.
 */
export const getComputerMove = (
  gameState: GameState
): Result<Position, string> => {
  const { board, humanPlayerSelection, nextPlayerToMove } = gameState;
  const humanIsX = humanPlayerSelection === Player.X;

  const score = (x: number): ScoredMove => ({ score: x, position: [0, 0] });

  // Check for final game state and return a score
  // If not final, iterate through the board and play every empty tile
  // recursively to get a score.
  // Choose the best move out of the scores.
  const minimax = (board: GameBoard, player: Player): ScoredMove => {
    const b = copyGameBoard(board);
    const gameStatus = getGameBoardStatus(b);

    switch (gameStatus) {
      case GameStatus.XWins:
        return humanIsX ? score(-10) : score(10);
      case GameStatus.OWins:
        return humanIsX ? score(10) : score(-10);
      case GameStatus.Stalemate:
        return score(0);
      default: {
        const moves = [];
        for (let y = 0; y < b.length; y++) {
          for (let x = 0; x < b[y].length; x++) {
            const tile = b[y][x];
            if (isNoneVariant(tile)) {
              const yPosition = validateTileIndex(y);
              const xPosition = validateTileIndex(x);
              const position: Position = [yPosition, xPosition];
              b[yPosition][xPosition] = Some(player);
              const move = minimax(b, getNextPlayer(player));
              moves.push({ score: move.score, position });
            }
          }
        }

        let bestMove: ScoredMove = {
          score: -Infinity,
          position: [0, 0],
        };

        for (const move of moves) {
          if (player !== humanPlayerSelection) {
            if (move.score > bestMove.score) {
              bestMove = move;
            }
          } else {
            if (move.score < bestMove.score) {
              bestMove = move;
            }
          }
        }

        return bestMove;
      }
    }
  };

  const result = minimax(board, nextPlayerToMove);
  return Ok(result.position);
};

/**
 * Handle validating a tile index. Safety function and helps avoid overriding
 * the TS type system.
 */
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
