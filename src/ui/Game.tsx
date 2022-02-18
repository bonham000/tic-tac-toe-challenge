import React, { useEffect } from "react";
import styled from "styled-components";
import toast from "react-hot-toast";

/** ===========================================================================
 * Search Form Component
 * ----------------------------------------------------------------------------
 * This component renders the mint address input form.
 * ============================================================================
 */

const Game: React.FC = () => {
  useEffect(() => {
    toast.success("HI");
  }, []);

  return (
    <Container>
      <h1>Tic Tac Toe</h1>
    </Container>
  );
};

/** ===========================================================================
 * Styles
 * ============================================================================
 */

const Container = styled.form`
  display: flex;
  align-items: center;
  justify-content: center;
`;

/** ===========================================================================
 * Export
 * ============================================================================
 */

export default Game;
