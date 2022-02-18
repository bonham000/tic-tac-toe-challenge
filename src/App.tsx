import React, { useState } from "react";
import styled from "styled-components";
import toast from "react-hot-toast";
import shortid from "shortid";
import {
  GameBoard,
  getDefaultGameState,
  Player,
  Position,
  Tile,
} from "./tools/types";
import {
  assertUnreachable,
  getNextGameState,
  validateTileIndex,
} from "./tools/utils";
import { matchOption, matchResult } from "./tools/result";
import { ReactComponent as X } from "./assets/player_x.svg";
import { ReactComponent as O } from "./assets/player_o.svg";

/** ===========================================================================
 * Search Form Component
 * ----------------------------------------------------------------------------
 * This component renders the mint address input form.
 * ============================================================================
 */

const App: React.FC = () => {
  const [gameState, setGameState] = useState(getDefaultGameState(Player.X));

  const handleMoveRequest = (position: Position) => {
    const nextGameState = getNextGameState(gameState, position);
    matchResult(nextGameState, {
      ok: (x) => setGameState(x),
      err: (e) => toast.error(e),
    });
  };

  return (
    <Container>
      <Title>Tic Tack Toe</Title>
      <SubTitle>Select Your Token</SubTitle>
      <GameBoardComponent
        board={gameState.board}
        handleMove={handleMoveRequest}
      />
    </Container>
  );
};

/** ===========================================================================
 * Styles
 * ============================================================================
 */

const RED = "#fd6163";
const GRAY = "#515151";

const Container = styled.form`
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

const BoardTile = styled.div`
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

/** ===========================================================================
 * Export
 * ============================================================================
 */

export default App;
