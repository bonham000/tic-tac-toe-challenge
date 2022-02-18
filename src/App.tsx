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
 * This component renders the mint address input form.
 * ============================================================================
 */

const toastSuccess = (msg: string) => {
  return toast.success(<ToastText>{msg}</ToastText>);
};

const toastError = (msg: string) => {
  return toast.error(<ToastText>{msg}</ToastText>);
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState(getDefaultGameState());

  const handleComputerMove = async (gameState: GameState) => {
    // Make it look like the computer is thinking...
    await wait(500);
    const computerMove = getComputerMove(gameState.board);
    const nextState = getNextGameState(gameState, computerMove.unwrap());
    matchResult(nextState, {
      ok: (x) => setGameState(x),
      err: (e) => toastError(e),
    });
  };

  const handleMoveRequest = (position: Position) => {
    const nextGameState = getNextGameState(gameState, position);
    matchResult(nextGameState, {
      ok: async (x) => {
        setGameState(x);

        // Check the game state and take the next appropriate action
        switch (x.status) {
          case GameStatus.PlayerSelection:
            break;
          case GameStatus.Playing:
            handleComputerMove(x);
            break;
          case GameStatus.Stalemate:
            toastError("It was a stalemate!");
            break;
          case GameStatus.XWins:
            if (x.humanPlayerSelection === Player.X) {
              toastSuccess("X Wins! Good job!");
            } else {
              toastError("X Wins! You lost!");
            }
            break;
          case GameStatus.OWins:
            if (x.humanPlayerSelection === Player.O) {
              toastSuccess("O Wins! Good job!");
            } else {
              toastError("O Wins! You lost!");
            }
            break;
          default:
            assertUnreachable(x.status);
        }
      },
      err: (e) => toastError(e),
    });
  };

  const handleSelectPlayer = (player: Player) => {
    const state = getInitialGameState(player);
    setGameState(state);
    toastSuccess(`You selected ${player}. You move first!`);
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
    </Container>
  );
};

/** ===========================================================================
 * Styles
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

const SelectionOverlay = styled.div`
  margin-top: 200px;
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

const Select = styled.button`
  width: 150px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
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
