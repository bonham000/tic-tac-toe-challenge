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
  test.todo("getNextPlayer");
  test.todo("validateTileIndex");

  test("getNextGameState game logic", () => {
    // Get a random number
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

    // Run a game simulation a given number of times
    const runGameSimulation = (humanPlayer: Player, count: number) => {
      let current = 0;
      let testGameCount = count;
      let stalemates = 0;
      let computerVictories = 0;

      while (current < testGameCount) {
        let state = getInitialGameState(humanPlayer);

        // Continue until game exists the Playing status
        while (state.status === GameStatus.Playing) {
          // Simulate player move
          state = getNextGameState(state, getRandomMove(state.board)).unwrap();

          // Run computer move
          if (state.status === GameStatus.Playing) {
            const computerMove = getComputerMove(state);
            state = getNextGameState(state, computerMove).unwrap();
          }
        }

        // Check for computer victories
        if (humanPlayer === Player.X) {
          if (state.status === GameStatus.OWins) {
            computerVictories++;
          }
        } else {
          if (state.status === GameStatus.XWins) {
            computerVictories++;
          }
        }

        // Check for stalemates
        if (state.status === GameStatus.Stalemate) {
          stalemates++;
        }

        current++;
      }

      const validCases = computerVictories + stalemates;
      console.log(
        `- RESULTS: ${computerVictories} computer victories and ${stalemates} stalemates (total = ${validCases}).`
      );

      // Valid cases should equal the original test simulation count
      expect(validCases).toBe(count);
    };

    // Increase this number to increase the simulation count
    // NOTE: Because the minimax solution is recursion heavy, this test
    // takes a while to run for large test counts.
    const trials = 100;
    runGameSimulation(Player.X, trials);
    runGameSimulation(Player.O, trials);
  });
});
