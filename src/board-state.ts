import {Piece, Square, Board} from './utils';

type LegalMoves = Partial<Record<Square, Set<Square>>>;
export type BoardChange = {state: BoardState; didChange: boolean};

type WaitingState = {
  name: 'WAITING';
  board: Board;
  legalMoves: LegalMoves;
};
type PieceSelectedState = {
  legalMoves: LegalMoves;
  name: 'PIECE_SELECTED';
  board: Board;
  selectedPiece: Piece;
  square: Square;
};
type DragPieceState = {
  legalMoves: LegalMoves;
  name: 'DRAG_PIECE';
  board: Board;
  selectedPiece: Piece;
  square: Square;
  dragSquare: Square;
};
type CancelSelectionSoonState = {
  legalMoves: LegalMoves;
  name: 'CANCEL_SELECTION_SOON';
  board: Board;
  selectedPiece: Piece;
  square: Square;
};

export type BoardState =
  | WaitingState
  | PieceSelectedState
  | DragPieceState
  | CancelSelectionSoonState;

export type Transition =
  | {
      name: 'MOUSE_DOWN';
      square: Square;
    }
  | {
      name: 'MOUSE_DOWN_OUTSIDE_BOARD';
    }
  | {
      name: 'MOUSE_UP';
      square: Square;
    }
  | {
      name: 'MOUSE_UP_OUTSIDE_BOARD';
    }
  | {
      name: 'MOUSE_MOVE_SQUARE';
      square: Square;
    }
  | {
      name: 'MOUSE_MOVE_OUTSIDE_BOARD';
    };

export const getNewState = (
  state: BoardState,
  transition: Transition
): BoardChange => {
  switch (state.name) {
    case 'WAITING':
      return _waitingStateTransition(state, transition);
    case 'PIECE_SELECTED':
      return _pieceSelectedStateTransition(state, transition);
    case 'DRAG_PIECE':
      return _dragPieceStateTransition(state, transition);
    case 'CANCEL_SELECTION_SOON':
      return _cancelSelectionSoonStateTransition(state, transition);
  }
};

const _waitingStateTransition = (
  state: WaitingState,
  transition: Transition
): BoardChange => {
  switch (transition.name) {
    case 'MOUSE_DOWN': {
      if (!(transition.square in state.board)) {
        return {state, didChange: false};
      }
      const piece = state.board[transition.square];
      if (!piece) {
        return {state, didChange: false};
      }
      return {
        state: {
          legalMoves: state.legalMoves,
          board: state.board,
          name: 'PIECE_SELECTED',
          selectedPiece: piece,
          square: transition.square,
        },
        didChange: true,
      };
    }
    default:
      return {state, didChange: false};
  }
};

const _pieceSelectedStateTransition = (
  state: PieceSelectedState,
  transition: Transition
): BoardChange => {
  switch (transition.name) {
    case 'MOUSE_MOVE_OUTSIDE_BOARD':
      return {
        state: {
          legalMoves: state.legalMoves,
          board: state.board,
          name: 'DRAG_PIECE',
          selectedPiece: state.selectedPiece,
          square: state.square,
          dragSquare: state.square,
        },
        didChange: true,
      };
    case 'MOUSE_MOVE_SQUARE':
      return {
        state: {
          legalMoves: state.legalMoves,
          board: state.board,
          name: 'DRAG_PIECE',
          selectedPiece: state.selectedPiece,
          square: state.square,
          dragSquare: transition.square,
        },
        didChange: true,
      };
    case 'MOUSE_DOWN': {
      if (!(transition.square in state.board)) {
        throw new Error(
          'Square must be in board - did you mean MOUSE_DOWN_OUTSIDE_BOARD?'
        );
      }

      if (!state.board[transition.square]) {
        // 1. If empty square, and it's an illegal move, go to waiting
        if (state.legalMoves[state.square]?.has(transition.square)) {
          const newBoard = JSON.parse(JSON.stringify(state.board));
          newBoard[state.square] = null;
          newBoard[transition.square] = state.selectedPiece;
          return {
            state: {
              name: 'WAITING',
              board: newBoard,
              legalMoves: state.legalMoves,
            },
            didChange: true,
          };
        }

        // 2. If empty square, and it's legal, move the selected piece
        return {
          state: {
            legalMoves: state.legalMoves,
            board: state.board,
            name: 'WAITING',
          },
          didChange: true,
        };
      }

      // 3. If occupied square, and it's the same piece, go to cancel selection soon
      if (state.square === transition.square) {
        return {
          state: {
            legalMoves: state.legalMoves,
            board: state.board,
            name: 'CANCEL_SELECTION_SOON',
            selectedPiece: state.selectedPiece,
            square: state.square,
          },
          didChange: true,
        };
      }

      // 4. If occupied square, and it's a legal move, capture the new piece
      if (state.legalMoves[state.square]?.has(transition.square)) {
        const newBoard = JSON.parse(JSON.stringify(state.board));
        newBoard[state.square] = null;
        newBoard[transition.square] = state.selectedPiece;
        return {
          state: {
            name: 'WAITING',
            board: newBoard,
            legalMoves: state.legalMoves,
          },
          didChange: true,
        };
      }

      // 5. If occupied square, and it's an illegal move, select the new piece
      // Already established in step 2 that the piece should be here
      const piece = state.board[transition.square]!;
      return {
        state: {
          board: state.board,
          legalMoves: state.legalMoves,
          name: 'PIECE_SELECTED',
          selectedPiece: piece,
          square: transition.square,
        },
        didChange: true,
      };
    }
    case 'MOUSE_DOWN_OUTSIDE_BOARD':
      return {
        state: {
          name: 'WAITING',
          board: state.board,
          legalMoves: state.legalMoves,
        },
        didChange: true,
      };
    default:
      return {state, didChange: false};
  }
};

const _dragPieceStateTransition = (
  state: DragPieceState,
  transition: Transition
): BoardChange => {
  switch (transition.name) {
    case 'MOUSE_UP_OUTSIDE_BOARD':
      return {
        state: {
          name: 'PIECE_SELECTED',
          board: state.board,
          legalMoves: state.legalMoves,
          selectedPiece: state.selectedPiece,
          square: state.square,
        },
        didChange: true,
      };
    case 'MOUSE_UP': {
      if (!state.legalMoves[state.square]?.has(transition.square)) {
        return {
          state: {
            board: state.board,
            name: 'PIECE_SELECTED',
            legalMoves: state.legalMoves,
            selectedPiece: state.selectedPiece,
            square: state.square,
          },
          didChange: true,
        };
      }
      const newBoard = JSON.parse(JSON.stringify(state.board));
      newBoard[state.square] = null;
      newBoard[transition.square] = state.selectedPiece;
      return {
        state: {
          name: 'WAITING',
          board: newBoard,

          legalMoves: state.legalMoves,
        },
        didChange: true,
      };
    }
    default:
      return {state, didChange: false};
  }
};

const _cancelSelectionSoonStateTransition = (
  state: CancelSelectionSoonState,
  transition: Transition
): BoardChange => {
  switch (transition.name) {
    case 'MOUSE_MOVE_OUTSIDE_BOARD':
      return {
        state: {
          board: state.board,
          legalMoves: state.legalMoves,
          name: 'DRAG_PIECE',
          selectedPiece: state.selectedPiece,
          square: state.square,
          dragSquare: state.square,
        },
        didChange: true,
      };
    case 'MOUSE_MOVE_SQUARE':
      return {
        state: {
          board: state.board,
          legalMoves: state.legalMoves,
          name: 'DRAG_PIECE',
          selectedPiece: state.selectedPiece,
          square: state.square,
          dragSquare: transition.square,
        },
        didChange: true,
      };
    case 'MOUSE_UP':
      return {
        state: {
          name: 'WAITING',
          board: state.board,
          legalMoves: state.legalMoves,
        },
        didChange: true,
      };
    default:
      return {state, didChange: false};
  }
};
