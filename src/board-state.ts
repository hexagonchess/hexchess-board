import {PIECE_VALUES} from './piece';
import {Board, Move, Piece} from './types';
import {Square} from './utils';

type LegalMoves = Partial<Record<Square, Set<Square>>>;
export type BoardChange = {state: BoardState; didChange: boolean};

// TODO - recalculate new legal moves whenever making a move

export type WaitingState = {
  board: Board;
  capturedPieces: Partial<Record<Piece, number>>;
  legalMoves: LegalMoves;
  name: 'WAITING';
  moves: Move[];
  scoreBlack: number;
  scoreWhite: number;
  turn: number;
};
export type MouseDownPieceSelected = {
  board: Board;
  capturedPieces: Partial<Record<Piece, number>>;
  legalMoves: LegalMoves;
  moves: Move[];
  name: 'MOUSE_DOWN_PIECE_SELECTED';
  scoreBlack: number;
  scoreWhite: number;
  selectedPiece: Piece;
  square: Square;
  turn: number;
};
export type MouseUpPieceSelected = {
  board: Board;
  capturedPieces: Partial<Record<Piece, number>>;
  legalMoves: LegalMoves;
  moves: Move[];
  name: 'MOUSE_UP_PIECE_SELECTED';
  scoreBlack: number;
  scoreWhite: number;
  selectedPiece: Piece;
  square: Square;
  turn: number;
};
export type DragPieceState = {
  board: Board;
  capturedPieces: Partial<Record<Piece, number>>;
  dragSquare: Square;
  legalMoves: LegalMoves;
  moves: Move[];
  name: 'DRAG_PIECE';
  scoreBlack: number;
  scoreWhite: number;
  selectedPiece: Piece;
  square: Square;
  turn: number;
};
export type CancelSelectionSoonState = {
  board: Board;
  capturedPieces: Partial<Record<Piece, number>>;
  legalMoves: LegalMoves;
  moves: Move[];
  name: 'CANCEL_SELECTION_SOON';
  scoreBlack: number;
  scoreWhite: number;
  selectedPiece: Piece;
  square: Square;
  turn: number;
};
export type RewoundState = {
  board: Board;
  capturedPieces: Partial<Record<Piece, number>>;
  currentTurn: number;
  legalMoves: LegalMoves;
  moves: Move[];
  name: 'REWOUND';
  scoreBlack: number;
  scoreWhite: number;
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

const _capturePieceOrMakeMove = (
  state: WaitingState | MouseUpPieceSelected | DragPieceState,
  capturingPiece: Piece,
  from: Square,
  to: Square
): BoardChange => {
  const capturedPiece = state.board[to];
  const newBoard = JSON.parse(JSON.stringify(state.board));
  newBoard[from] = null;
  newBoard[to] = capturingPiece;
  if (capturedPiece) {
    const isWhitePiece = capturedPiece.toUpperCase() === capturedPiece;
    const newWhiteScore = isWhitePiece
      ? state.scoreWhite - PIECE_VALUES[capturedPiece]
      : state.scoreWhite;
    const newBlackScore = isWhitePiece
      ? state.scoreBlack
      : state.scoreBlack - PIECE_VALUES[capturedPiece];
    const newCapturedPieces = JSON.parse(JSON.stringify(state.capturedPieces));
    if (capturedPiece in newCapturedPieces) {
      newCapturedPieces[capturedPiece] = newCapturedPieces[capturedPiece] + 1;
    } else {
      newCapturedPieces[capturedPiece] = 1;
    }
    return {
      state: {
        ...state,
        board: newBoard,
        capturedPieces: newCapturedPieces,
        moves: state.moves.concat({from, to, capturedPiece}),
        name: 'WAITING',
        scoreBlack: newBlackScore,
        scoreWhite: newWhiteScore,
        turn: state.turn + 1,
      },
      didChange: true,
    };
  }
  return {
    state: {
      ...state,
      board: newBoard,
      moves: state.moves.concat({from, to}),
      name: 'WAITING',
      turn: state.turn + 1,
    },
    didChange: true,
  };
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
      const move = state.moves[state.currentTurn];
      const newBoard = JSON.parse(JSON.stringify(state.board));
      newBoard[move.from] = null;
      newBoard[move.to] = state.board[move.from];
      const newName =
        state.currentTurn === state.turn - 1 ? 'WAITING' : 'REWOUND';
      return {
        state: {
          ...state,
          board: newBoard,
          currentTurn: state.currentTurn + 1,
          name: newName,
        },
        didChange: true,
      };
    }
    case 'REWIND': {
      if (state.currentTurn === 0) {
        return {state, didChange: false};
      }
      const newBoard = JSON.parse(JSON.stringify(state.board));
      const move = state.moves[state.currentTurn];
      newBoard[move.to] = move.capturedPiece ? move.capturedPiece : null;
      newBoard[move.from] = state.board[move.to];
      return {
        state: {
          ...state,
          board: newBoard,
          currentTurn: state.currentTurn - 1,
          name: 'REWOUND',
        },
        didChange: false,
      };
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
    case 'REWIND': {
      if (state.turn === 0) {
        return {state, didChange: false};
      }
      const move = state.moves[state.turn - 1];
      const newBoard = JSON.parse(JSON.stringify(state.board));
      newBoard[move.to] = move.capturedPiece ? move.capturedPiece : null;
      newBoard[move.from] = state.board[move.to];
      return {
        state: {
          ...state,
          board: newBoard,
          currentTurn: state.turn - 1,
          name: 'REWOUND',
        },
        didChange: true,
      };
    }
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
          ...state,
          name: 'MOUSE_DOWN_PIECE_SELECTED',
          selectedPiece: piece,
          square: transition.square,
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

      return _capturePieceOrMakeMove(state, piece, from, to);
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
        return _capturePieceOrMakeMove(
          state,
          state.selectedPiece,
          state.square,
          transition.square
        );
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
      return _capturePieceOrMakeMove(
        state,
        state.selectedPiece,
        state.square,
        transition.square
      );
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
          ...state,
          name: 'DRAG_PIECE',
          dragSquare: state.square,
        },
        didChange: true,
      };
    case 'MOUSE_MOVE_SQUARE':
      return {
        state: {
          ...state,
          name: 'DRAG_PIECE',
          dragSquare: transition.square,
        },
        didChange: true,
      };
    case 'MOUSE_UP':
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
