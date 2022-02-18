import React, { useState } from "react";
import styled from "styled-components";
import toast from "react-hot-toast";
import shortid from "shortid";
import {
  GameBoard,
  GameState,
  GameStatus,
  getDefaultGameState,
  getInitialGameState,
  Player,
  Position,
  Tile,
} from "./tools/types";
import {
  getComputerMove,
  getNextGameState,
  validateTileIndex,
  wait,
} from "./tools/utils";
import { assertUnreachable, matchOption, matchResult } from "./tools/result";
import { ReactComponent as X } from "./assets/player_x.svg";
import { ReactComponent as O } from "./assets/player_o.svg";

/** ===========================================================================
 * Search Form Component
 * ----------------------------------------------------------------------------
 * This component renders the main app UI and handles executing some
 * high level game logic.
 * ============================================================================
 */

const toastSuccess = (msg: string) => {
  return toast.success(<ToastText>{msg}</ToastText>);
};

const toastError = (msg: string) => {
  return toast.error(<ToastText>{msg}</ToastText>);
};

const App: React.FC = () => {
  // Maintain all the game state in one state object
  const [gameState, setGameState] = useState(getDefaultGameState());

  /**
   * Check game status after a move occurs.
   */
  const handleCheckStatus = (gameState: GameState) => {
    // Check the game state and take the next appropriate action
    switch (gameState.status) {
      case GameStatus.PlayerSelection:
        break;
      case GameStatus.Playing:
      case GameStatus.Stalemate:
        break;
      case GameStatus.XWins:
        if (gameState.humanPlayerSelection === Player.X) {
          toastSuccess("X Wins! Good job!");
        } else {
          toastError("X Wins! You lost!");
        }
        break;
      case GameStatus.OWins:
        if (gameState.humanPlayerSelection === Player.O) {
          toastSuccess("O Wins! Good job!");
        } else {
          toastError("O Wins! You lost!");
        }
        break;
      default:
        assertUnreachable(gameState.status);
    }
  };

  /**
   * Handle making a computer move.
   */
  const handleComputerMove = async (gameState: GameState) => {
    // Make it look like the computer is thinking...
    await wait(500);
    const computerMove = getComputerMove(gameState);
    const nextState = getNextGameState(gameState, computerMove.unwrap());
    matchResult(nextState, {
      ok: (x) => {
        setGameState(x);
        handleCheckStatus(x);
      },
      err: (e) => toastError(e),
    });
  };

  /**
   * Handle making a player move.
   */
  const handleMoveRequest = (position: Position) => {
    // Ensure game is currently playing
    if (gameState.status !== GameStatus.Playing) {
      return toastError("No game is active.");
    }

    // Ensure it's the player's turn
    if (gameState.nextPlayerToMove !== gameState.humanPlayerSelection) {
      return toastError("It's not your turn.");
    }

    // Compute the next game state result
    const nextGameState = getNextGameState(gameState, position);
    matchResult(nextGameState, {
      ok: async (x) => {
        // Update the game state
        setGameState(x);

        // If game is still playing let the computer move
        if (x.status === GameStatus.Playing) {
          handleComputerMove(x);
        } else {
          // Otherwise check game status
          handleCheckStatus(x);
        }
      },
      err: (e) => toastError(e),
    });
  };

  /**
   * Handle initial player selection.
   */
  const handleSelectPlayer = (player: Player) => {
    const state = getInitialGameState(player);
    setGameState(state);
    toastSuccess(`You selected ${player}. You move first!`);
  };

  const handleRestart = () => {
    setGameState(getDefaultGameState());
    toastSuccess("Game restarted.");
  };

  return (
    <Container>
      <Title>Tic Tack Toe</Title>
      <GameSubTitle gameState={gameState} />
      <GameBoardComponent
        board={gameState.board}
        handleMove={handleMoveRequest}
      />
      <GameSubText gameState={gameState} />
      {gameState.status === GameStatus.PlayerSelection && (
        <PlayerSelectionOverlay handleSelectPlayer={handleSelectPlayer} />
      )}
      <GameFinishedOverlay gameState={gameState} restart={handleRestart} />
    </Container>
  );
};

/** ===========================================================================
 * Styles & Components
 * ============================================================================
 */

const RED = "#fd6163";
const GRAY = "#515151";

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const Title = styled.h1`
  font-size: 52px;
  margin-top: 32px;
  margin-bottom: 24px;
  font-family: Open_Sans_Condensed_Light;
`;

const SubTitle = styled.h1`
  margin-bottom: 32px;
  color: ${RED};
`;

const GameSubTitle: React.FC<{ gameState: GameState }> = (props) => {
  const { gameState } = props;
  const { status } = gameState;
  switch (status) {
    case GameStatus.PlayerSelection:
      return <SubTitle>Select Your Token</SubTitle>;
    default:
      return <div style={{ height: 97 }} />;
  }
};

const GameSubText: React.FC<{ gameState: GameState }> = (props) => {
  const { gameState } = props;
  const { status } = gameState;
  switch (status) {
    case GameStatus.PlayerSelection:
    case GameStatus.Stalemate:
    case GameStatus.XWins:
    case GameStatus.OWins:
      return null;
    case GameStatus.Playing: {
      if (gameState.nextPlayerToMove === gameState.humanPlayerSelection) {
        return (
          <SubTitle>
            Player's <span style={{ color: GRAY }}>Turn</span>
          </SubTitle>
        );
      } else {
        return (
          <SubTitle>
            Computer's <span style={{ color: GRAY }}>Turn...</span>
          </SubTitle>
        );
      }
    }
    default:
      return assertUnreachable(status);
  }
};

interface GameBoardProps {
  board: GameBoard;
  handleMove: (position: Position) => void;
}

const GameBoardComponent: React.FC<GameBoardProps> = (
  props: GameBoardProps
) => {
  return (
    <Board>
      {props.board.map((row, rowIndex) => {
        return row.map((tile, tileIndex) => {
          // Indexes should be valid but TypeScript doesn't know
          const y = validateTileIndex(rowIndex);
          const x = validateTileIndex(tileIndex);
          const position: Position = [y, x];
          return (
            <BoardTile
              key={shortid()}
              onClick={() => props.handleMove(position)}
            >
              {getTileContents(tile)}
            </BoardTile>
          );
        });
      })}
    </Board>
  );
};

const Board = styled.div`
  padding: 5px;
  width: 325px;
  height: 325px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-around;
  background: rgb(175, 175, 175);
`;

const BoardTile = styled.button`
  outline: none;
  border: none;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;

  &:hover {
    cursor: pointer;
    background: rgb(225, 225, 225);
  }
`;

const getTileContents = (tile: Tile) => {
  return matchOption(tile, {
    some: (player) => {
      switch (player) {
        case Player.X:
          return <X />;
        case Player.O:
          return <O />;
        default:
          return assertUnreachable(player);
      }
    },
    none: () => null,
  });
};

interface PlayerSelectionOverlayProps {
  handleSelectPlayer: (player: Player) => void;
}

const PlayerSelectionOverlay: React.FC<PlayerSelectionOverlayProps> = (
  props
) => {
  return (
    <SelectionOverlay>
      <Select onClick={() => props.handleSelectPlayer(Player.X)}>
        <X />
      </Select>
      <Select onClick={() => props.handleSelectPlayer(Player.O)}>
        <O />
      </Select>
    </SelectionOverlay>
  );
};

interface GameFinishedOverlayProps {
  gameState: GameState;
  restart: () => void;
}

const GameFinishedOverlay: React.FC<GameFinishedOverlayProps> = (props) => {
  const { status } = props.gameState;

  if (status === GameStatus.PlayerSelection || status === GameStatus.Playing) {
    return null;
  }

  let winner = "";
  if (status === GameStatus.XWins) {
    if (props.gameState.humanPlayerSelection === Player.X) {
      winner = "Player";
    } else {
      winner = "Computer";
    }
  } else if (status === GameStatus.OWins) {
    if (props.gameState.humanPlayerSelection === Player.O) {
      winner = "Player";
    } else {
      winner = "Computer";
    }
  } else if (status === GameStatus.Stalemate) {
    return (
      <CompletionOverlay>
        <CompletionTitle>STALEMATE </CompletionTitle>
        <RestartButton onClick={props.restart}>Play again?</RestartButton>
      </CompletionOverlay>
    );
  }

  return (
    <CompletionOverlay>
      <CompletionTitle>
        {winner} <span style={{ color: GRAY }}>Wins</span>
      </CompletionTitle>
      <RestartButton onClick={props.restart}>Play again?</RestartButton>
    </CompletionOverlay>
  );
};

const SelectionOverlay = styled.div`
  margin-top: 225px;
  width: 750px;
  height: 350px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
  z-index: 10;
  position: absolute;
  backdrop-filter: blur(4px);
`;

const CompletionOverlay = styled.div`
  margin-top: 225px;
  width: 650px;
  height: 450px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  z-index: 10;
  position: absolute;
  backdrop-filter: blur(6px);
`;

const CompletionTitle = styled.h1`
  font-size: 100px;
  margin: 24px;
  color: ${RED};
`;

const Select = styled.button`
  width: 150px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RestartButton = styled.button`
  border: none;
  font-size: 32px;
  padding: 12px;
  border-radius: 8px;
  background: rgb(150, 150, 150);

  &:hover {
    cursor: pointer;
    background: rgb(175, 175, 175);
  }
`;

const ToastText = styled.p`
  margin: 2px;
  font-family: Open_Sans_Condensed_Bold;
`;

/** ===========================================================================
 * Export
 * ============================================================================
 */

export default App;
