import {
  assertUnreachable,
  Err,
  isNoneVariant,
  matchOption,
  None,
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
 * Delay some time.
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
 * Helper to create a scored move. Note that the position is just a placeholder
 * value and will be overwritten later.
 */
const getScoredMove = (s: number): ScoredMove => ({
  score: s,
  position: [0, 0],
});

/**
 * Handle Computer move.
 *
 * This functions runs the minimax algorithm to find the ideal move for the
 * computer player.
 */
export const getComputerMove = (gameState: GameState): Position => {
  const { board, humanPlayerSelection, nextPlayerToMove } = gameState;
  const humanIsX = humanPlayerSelection === Player.X;

  // Minimax logic for Tic Tac Toe game
  const minimax = (board: GameBoard, player: Player): ScoredMove => {
    const b = board;
    const gameStatus = getGameBoardStatus(b);

    /**
     * First handle final base cases in which a score is directly known.
     *
     * Then handle recursive cases of looking up the score for a move for
     * each move, and then choosing the optimal move.
     */
    switch (gameStatus) {
      // Positive scores are returned for computer winning outcomes
      // and negative scores are returned for human winning outcomes
      case GameStatus.XWins:
        return humanIsX ? getScoredMove(-10) : getScoredMove(10);
      case GameStatus.OWins:
        return humanIsX ? getScoredMove(10) : getScoredMove(-10);
      // Stalemate is neutral and receives a zero score
      case GameStatus.Stalemate:
        return getScoredMove(0);
      default: {
        const moves = [];
        // Iterate through the board and perform the algorithm logic for
        // each empty space
        for (let i = 0; i < b.length; i++) {
          for (let j = 0; j < b[i].length; j++) {
            const tile = b[i][j];
            if (isNoneVariant(tile)) {
              // Play on this tile and then get the best next move by
              // recursively calling the minimax function again.
              const y = validateTileIndex(i);
              const x = validateTileIndex(j);
              const position: Position = [y, x];
              b[y][x] = Some(player);
              const move = minimax(b, getNextPlayer(player));
              b[y][x] = None();
              moves.push({ score: move.score, position });
            }
          }
        }

        // Find the best move out of all possible moves explored above
        let optimalMove: ScoredMove = getScoredMove(0);

        if (player !== humanPlayerSelection) {
          // Computer: choose the highest scored move
          optimalMove.score = -Infinity;
          for (const move of moves) {
            if (move.score > optimalMove.score) {
              optimalMove = move;
            }
          }
        } else {
          // Human: choose the lowest scored move
          optimalMove.score = Infinity;
          for (const move of moves) {
            if (move.score < optimalMove.score) {
              optimalMove = move;
            }
          }
        }

        return optimalMove;
      }
    }
  };

  // Find best move and return that position
  const result = minimax(board, nextPlayerToMove);
  return result.position;
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
