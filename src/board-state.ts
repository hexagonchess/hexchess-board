import {Piece, Square, Board} from './utils';

type LegalMoves = Partial<Record<Square, Set<Square>>>;
export type BoardChange = {state: BoardState; didChange: boolean};

// TODO - make an actual move type
// This doesn't handle captures, only moves to empty squares

// TODO - recalculate new legal moves whenever making a move

// TODO - handle reset at any state

export type WaitingState = {
  board: Board;
  legalMoves: LegalMoves;
  name: 'WAITING';
  moves: Square[][];
  turn: number;
};
type MouseDownPieceSelected = {
  board: Board;
  legalMoves: LegalMoves;
  moves: Square[][];
  name: 'MOUSE_DOWN_PIECE_SELECTED';
  selectedPiece: Piece;
  square: Square;
  turn: number;
};
type MouseUpPieceSelected = {
  board: Board;
  legalMoves: LegalMoves;
  moves: Square[][];
  name: 'MOUSE_UP_PIECE_SELECTED';
  selectedPiece: Piece;
  square: Square;
  turn: number;
};
type DragPieceState = {
  board: Board;
  dragSquare: Square;
  legalMoves: LegalMoves;
  moves: Square[][];
  name: 'DRAG_PIECE';
  selectedPiece: Piece;
  square: Square;
  turn: number;
};
type CancelSelectionSoonState = {
  board: Board;
  legalMoves: LegalMoves;
  moves: Square[][];
  name: 'CANCEL_SELECTION_SOON';
  selectedPiece: Piece;
  square: Square;
  turn: number;
};
type RewoundState = {
  board: Board;
  currentTurn: number;
  legalMoves: LegalMoves;
  moves: Square[][];
  name: 'REWOUND';
  turn: number;
};

export type BoardState =
  | WaitingState
  | MouseDownPieceSelected
  | MouseUpPieceSelected
  | DragPieceState
  | CancelSelectionSoonState
  | RewoundState;

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
    }
  | {
      name: 'REWIND';
    }
  | {
      name: 'FAST_FORWARD';
    }
  | {
      name: 'PROGRAMMATIC_MOVE';
      move: Square[];
    }
  | {
      name: 'RESET';
    };

export const getNewState = (
  state: BoardState,
  transition: Transition
): BoardChange => {
  switch (state.name) {
    case 'WAITING':
      return _waitingStateTransition(state, transition);
    case 'MOUSE_DOWN_PIECE_SELECTED':
      return _mouseDownPieceSelectedStateTransition(state, transition);
    case 'MOUSE_UP_PIECE_SELECTED':
      return _mouseUpPieceSelectedStateTransition(state, transition);
    case 'DRAG_PIECE':
      return _dragPieceStateTransition(state, transition);
    case 'CANCEL_SELECTION_SOON':
      return _cancelSelectionSoonStateTransition(state, transition);
    case 'REWOUND':
      return _rewoundStateTransition(state, transition);
  }
};

const _rewoundStateTransition = (
  state: RewoundState,
  transition: Transition
): BoardChange => {
  switch (transition.name) {
    case 'FAST_FORWARD': {
      if (state.currentTurn === state.turn) {
        return {state, didChange: false};
      }
      // TODO - actually implement
      return {state, didChange: false};
    }
    case 'REWIND': {
      if (state.currentTurn === 0) {
        return {state, didChange: false};
      }
      // TODO - actually implement
      return {state, didChange: false};
    }
    default:
      return {state, didChange: false};
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
          board: state.board,
          legalMoves: state.legalMoves,
          moves: state.moves,
          name: 'MOUSE_DOWN_PIECE_SELECTED',
          selectedPiece: piece,
          square: transition.square,
          turn: state.turn,
        },
        didChange: true,
      };
    }
    case 'PROGRAMMATIC_MOVE': {
      const from = transition.move[0];
      const to = transition.move[1];
      if (!(from in state.board)) {
        return {state, didChange: false};
      }
      const piece = state.board[from];
      if (!piece) {
        return {state, didChange: false};
      }

      if (!state.legalMoves[from]?.has(to)) {
        return {state, didChange: false};
      }

      const newBoard = JSON.parse(JSON.stringify(state.board));
      newBoard[from] = null;
      newBoard[to] = piece;
      return {
        state: {
          board: newBoard,
          legalMoves: state.legalMoves,
          moves: state.moves.concat([from, to]),
          name: 'WAITING',
          turn: state.turn + 1,
        },
        didChange: true,
      };
    }
    default:
      return {state, didChange: false};
  }
};

const _mouseDownPieceSelectedStateTransition = (
  state: MouseDownPieceSelected,
  transition: Transition
): BoardChange => {
  switch (transition.name) {
    case 'MOUSE_MOVE_OUTSIDE_BOARD':
      return {
        state: {
          ...state,
          dragSquare: state.square,
          name: 'DRAG_PIECE',
        },
        didChange: true,
      };
    case 'MOUSE_MOVE_SQUARE':
      return {
        state: {
          ...state,
          dragSquare: transition.square,
          name: 'DRAG_PIECE',
        },
        didChange: true,
      };
    case 'MOUSE_UP':
      return {
        state: {
          ...state,
          name: 'MOUSE_UP_PIECE_SELECTED',
        },
        didChange: true,
      };
    default:
      return {state, didChange: false};
  }
};

const _mouseUpPieceSelectedStateTransition = (
  state: MouseUpPieceSelected,
  transition: Transition
): BoardChange => {
  switch (transition.name) {
    case 'MOUSE_DOWN': {
      if (!(transition.square in state.board)) {
        throw new Error(
          'Square must be in board - did you mean MOUSE_DOWN_OUTSIDE_BOARD transition?'
        );
      }

      // 1. If occupied square, and it's the same piece, go to cancel selection soon
      if (state.square === transition.square) {
        return {
          state: {
            ...state,
            name: 'CANCEL_SELECTION_SOON',
          },
          didChange: true,
        };
      }

      // 2. If it's a legal move, make the move
      if (state.legalMoves[state.square]?.has(transition.square)) {
        const newBoard = JSON.parse(JSON.stringify(state.board));
        newBoard[state.square] = null;
        newBoard[transition.square] = state.selectedPiece;
        return {
          state: {
            ...state,
            board: newBoard,
            moves: state.moves.concat([state.square, transition.square]),
            name: 'WAITING',
            turn: state.turn + 1,
          },
          didChange: true,
        };
      }

      // 3. If it's an occupied piece, select the piece
      const piece = state.board[transition.square]!;
      if (piece) {
        return {
          state: {
            ...state,
            name: 'MOUSE_DOWN_PIECE_SELECTED',
            selectedPiece: piece,
            square: transition.square,
          },
          didChange: true,
        };
      }

      // 4. Otherwise go back to waiting
      return {
        state: {
          ...state,
          name: 'WAITING',
        },
        didChange: true,
      };
    }
    case 'MOUSE_DOWN_OUTSIDE_BOARD':
      return {
        state: {
          ...state,
          name: 'WAITING',
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
    case 'MOUSE_MOVE_OUTSIDE_BOARD':
      return {
        state,
        didChange: false,
      };
    case 'MOUSE_MOVE_SQUARE':
      return {
        state: {
          ...state,
          dragSquare: transition.square,
        },
        didChange: true,
      };
    case 'MOUSE_UP_OUTSIDE_BOARD':
      return {
        state: {
          ...state,
          name: 'MOUSE_UP_PIECE_SELECTED',
        },
        didChange: true,
      };
    case 'MOUSE_UP': {
      if (!state.legalMoves[state.square]?.has(transition.square)) {
        return {
          state: {
            ...state,
            name: 'MOUSE_UP_PIECE_SELECTED',
          },
          didChange: true,
        };
      }
      const newBoard = JSON.parse(JSON.stringify(state.board));
      newBoard[state.square] = null;
      newBoard[transition.square] = state.selectedPiece;
      return {
        state: {
          ...state,
          board: newBoard,
          moves: state.moves.concat([state.square, transition.square]),
          name: 'WAITING',
          turn: state.turn + 1,
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
          moves: state.moves,
          name: 'DRAG_PIECE',
          selectedPiece: state.selectedPiece,
          square: state.square,
          dragSquare: state.square,
          turn: state.turn,
        },
        didChange: true,
      };
    case 'MOUSE_MOVE_SQUARE':
      return {
        state: {
          board: state.board,
          legalMoves: state.legalMoves,
          moves: state.moves,
          name: 'DRAG_PIECE',
          selectedPiece: state.selectedPiece,
          square: state.square,
          dragSquare: transition.square,
          turn: state.turn,
        },
        didChange: true,
      };
    case 'MOUSE_UP':
      return {
        state: {
          board: state.board,
          legalMoves: state.legalMoves,
          moves: state.moves,
          name: 'WAITING',
          turn: state.turn,
        },
        didChange: true,
      };
    default:
      return {state, didChange: false};
  }
};
