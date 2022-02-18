import { isNoneVariant } from "../tools/result";
import {
  GameBoard,
  GameStatus,
  getInitialGameState,
  Player,
  Position,
} from "../tools/types";
import {
  getComputerMove,
  getNextGameState,
  validateTileIndex,
} from "../tools/utils";

describe("utils tests", () => {
  test.skip("getNextGameState game logic", () => {
    const randomNumber = (max: number) => {
      return Math.floor(Math.random() * max);
    };

    // Find a random move for the test game
    const getRandomMove = (board: GameBoard): Position => {
      const openTiles: Position[] = [];
      for (let y = 0; y < board.length; y++) {
        for (let x = 0; x < board[y].length; x++) {
          const tile = board[y][x];
          if (isNoneVariant(tile)) {
            const yPosition = validateTileIndex(y);
            const xPosition = validateTileIndex(x);
            openTiles.push([yPosition, xPosition]);
          }
        }
      }

      const i = randomNumber(openTiles.length - 1);
      return openTiles[i];
    };

    let current = 0;
    let testGameCount = 100;

    while (current < testGameCount) {
      let state = getInitialGameState(Player.X);
      while (state.status === GameStatus.Playing) {
        state = getNextGameState(state, getRandomMove(state.board)).unwrap();

        if (state.status === GameStatus.Playing) {
          state = getNextGameState(
            state,
            getComputerMove(state.board).unwrap()
          ).unwrap();
        }
      }

      // O should always win... or Stalemate?
      expect(state.status).toBe(GameStatus.OWins);

      current++;
    }
  });
});
