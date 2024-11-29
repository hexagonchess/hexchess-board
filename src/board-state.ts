import { Game, GameState } from './game';
import { Pawn } from './pawn';
import { PIECE_VALUES } from './piece';
import { Position } from './position';
import { HexchessPiece, LegalMoves, Move, Piece } from './types';
import { Square } from './utils';

export type BoardChange = { state: BoardState; didChange: boolean };

export type WaitingState = {
  game: Game;
  capturedPieces: Partial<Record<Piece, number>>;
  legalMoves: LegalMoves;
  name: 'WAITING';
  moves: Move[];
  scoreBlack: number;
  scoreWhite: number;
};
export type MouseDownPieceSelected = {
  game: Game;
  capturedPieces: Partial<Record<Piece, number>>;
  legalMoves: LegalMoves;
  opponentPieceMoves?: Square[];
  moves: Move[];
  name: 'MOUSE_DOWN_PIECE_SELECTED';
  scoreBlack: number;
  scoreWhite: number;
  selectedPiece: Piece;
  square: Square;
};
export type MouseUpPieceSelected = {
  game: Game;
  capturedPieces: Partial<Record<Piece, number>>;
  legalMoves: LegalMoves;
  opponentPieceMoves?: Square[];
  moves: Move[];
  name: 'MOUSE_UP_PIECE_SELECTED';
  scoreBlack: number;
  scoreWhite: number;
  selectedPiece: Piece;
  square: Square;
};
export type DragPieceState = {
  game: Game;
  capturedPieces: Partial<Record<Piece, number>>;
  dragSquare: Square;
  legalMoves: LegalMoves;
  opponentPieceMoves?: Square[];
  moves: Move[];
  name: 'DRAG_PIECE';
  scoreBlack: number;
  scoreWhite: number;
  selectedPiece: Piece;
  square: Square;
};
export type CancelSelectionSoonState = {
  game: Game;
  capturedPieces: Partial<Record<Piece, number>>;
  legalMoves: LegalMoves;
  opponentPieceMoves?: Square[];
  moves: Move[];
  name: 'CANCEL_SELECTION_SOON';
  scoreBlack: number;
  scoreWhite: number;
  selectedPiece: Piece;
  square: Square;
};
export type RewoundState = {
  game: Game;
  capturedPieces: Partial<Record<Piece, number>>;
  currentTurn: number;
  legalMoves: LegalMoves;
  moves: Move[];
  name: 'REWOUND';
  scoreBlack: number;
  scoreWhite: number;
};
export type PromotionState = {
  game: Game;
  capturedPieces: Partial<Record<Piece, number>>;
  legalMoves: LegalMoves;
  moves: Move[];
  name: 'PROMOTING';
  scoreBlack: number;
  scoreWhite: number;
};

type Outcome = 'WHITE_WINS' | 'BLACK_WINS' | 'DRAW';
export type GameOverState = {
  game: Game;
  capturedPieces: Partial<Record<Piece, number>>;
  moves: Move[];
  name: 'GAMEOVER';
  outcome: Outcome;
  scoreBlack: number;
  scoreWhite: number;
};

export type BoardState =
  | WaitingState
  | MouseDownPieceSelected
  | MouseUpPieceSelected
  | DragPieceState
  | CancelSelectionSoonState
  | RewoundState
  | PromotionState
  | GameOverState;

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
    }
  | {
      name: 'PROMOTE';
      piece: Omit<Piece, 'K' | 'k' | 'P' | 'p'>;
    };

export class BoardStateMachine {
  private readonly emitFurthestBack: () => void;
  private readonly emitFurthestForward: () => void;

  constructor(furthestBack: () => void, furthestForward: () => void) {
    this.emitFurthestBack = furthestBack;
    this.emitFurthestForward = furthestForward;
  }

  getNewState = (state: BoardState, transition: Transition): BoardChange => {
    switch (state.name) {
      case 'WAITING':
        return this._waitingStateTransition(state, transition);
      case 'MOUSE_DOWN_PIECE_SELECTED':
        return this._mouseDownPieceSelectedStateTransition(state, transition);
      case 'MOUSE_UP_PIECE_SELECTED':
        return this._mouseUpPieceSelectedStateTransition(state, transition);
      case 'DRAG_PIECE':
        return this._dragPieceStateTransition(state, transition);
      case 'CANCEL_SELECTION_SOON':
        return this._cancelSelectionSoonStateTransition(state, transition);
      case 'REWOUND':
        return this._rewoundStateTransition(state, transition);
      case 'PROMOTING':
        return this._promotingStateTransition(state, transition);
      case 'GAMEOVER':
        return { state, didChange: false };
    }
  };

  private _capturePieceOrMakeMove = (
    state: WaitingState | MouseUpPieceSelected | DragPieceState,
    from: Square,
    to: Square,
  ): BoardChange => {
    const fromPiece = state.game.board.getPiece(from);
    const toPiece = state.game.board.getPiece(to);
    let capturedPiece: HexchessPiece | null;
    let enPassant = false;
    if (fromPiece instanceof Pawn && from[0] !== to[0] && !toPiece) {
      enPassant = true;
      const row = Number.parseInt(to.slice(1));
      const capturedLocation =
        fromPiece.color === 'white'
          ? `${to[0]}${row - 1}`
          : `${to[0]}${row + 1}`;
      capturedPiece = state.game.board.getPiece(capturedLocation as Square);
    } else {
      capturedPiece = state.game.board.getPiece(to);
    }

    const newMove = {
      from,
      to,
      capturedPiece: capturedPiece ? capturedPiece.toString() : undefined,
      enPassant,
      promotion: null,
    };
    const newWhiteScore =
      capturedPiece?.color === 'white'
        ? state.scoreWhite - PIECE_VALUES[capturedPiece?.toString()]
        : state.scoreWhite;
    const newBlackScore =
      capturedPiece?.color === 'black'
        ? state.scoreBlack - PIECE_VALUES[capturedPiece?.toString()]
        : state.scoreBlack;
    state.game.movePiece(Position.fromString(from), Position.fromString(to));
    let newCapturedPieces: Partial<Record<Piece, number>>;
    if (!capturedPiece) {
      newCapturedPieces = state.capturedPieces;
    } else {
      const capturedPieceAsString = capturedPiece.toString();
      newCapturedPieces = JSON.parse(JSON.stringify(state.capturedPieces));
      if (capturedPiece.toString() in newCapturedPieces) {
        const capturedPieces = newCapturedPieces[capturedPieceAsString];
        if (capturedPieces == null) {
          throw new Error('This is impossible');
        }
        newCapturedPieces[capturedPieceAsString] = capturedPieces + 1;
      } else {
        newCapturedPieces[capturedPieceAsString] = 1;
      }
    }

    if (
      state.game.state() !== GameState.IN_PROGRESS &&
      state.game.state() !== GameState.PROMOTING
    ) {
      let outcome: Outcome = 'DRAW';
      if (state.game.state() === GameState.CHECKMATE) {
        outcome = state.game.turn % 2 === 0 ? 'BLACK_WINS' : 'WHITE_WINS';
      }
      return {
        state: {
          ...state,
          capturedPieces: newCapturedPieces,
          moves: state.moves.concat(newMove),
          name: 'GAMEOVER',
          outcome,
          scoreBlack: newBlackScore,
          scoreWhite: newWhiteScore,
        },
        didChange: true,
      };
    }
    if (
      fromPiece instanceof Pawn &&
      (Position.fromString(to).isBeginningOfColumn() ||
        Position.fromString(to).isEndOfColumn())
    ) {
      return {
        state: {
          ...state,
          capturedPieces: newCapturedPieces,
          moves: state.moves.concat(newMove),
          name: 'PROMOTING',
          scoreBlack: newBlackScore,
          scoreWhite: newWhiteScore,
        },
        didChange: true,
      };
    }
    return {
      state: {
        ...state,
        capturedPieces: newCapturedPieces,
        legalMoves: state.game.allLegalMoves(),
        moves: state.moves.concat(newMove),
        name: 'WAITING',
        scoreBlack: newBlackScore,
        scoreWhite: newWhiteScore,
      },
      didChange: true,
    };
  };

  private _promotingStateTransition = (
    state: PromotionState,
    transition: Transition,
  ): BoardChange => {
    switch (transition.name) {
      case 'PROMOTE': {
        const isWhite = state.game.turn % 2 === 0;
        let scoreBump: number;
        switch (transition.piece) {
          case 'Q':
          case 'q':
            scoreBump = 8;
            break;
          case 'R':
          case 'r':
            scoreBump = 4;
            break;
          default:
            scoreBump = 2;
            break;
        }
        state.game.promotePawn(transition.piece);
        const newCapturedPieces = JSON.parse(
          JSON.stringify(state.capturedPieces),
        );
        if (isWhite) {
          if (!newCapturedPieces.P) {
            newCapturedPieces.P = 1;
          } else {
            newCapturedPieces.P += 1;
          }
          if (!newCapturedPieces[transition.piece.toLowerCase()]) {
            newCapturedPieces[transition.piece.toLowerCase()] = 1;
          } else {
            newCapturedPieces[transition.piece.toLowerCase()] += 1;
          }
        } else {
          if (!newCapturedPieces.p) {
            newCapturedPieces.p = 1;
          } else {
            newCapturedPieces.p += 1;
          }
          if (!newCapturedPieces[transition.piece.toUpperCase()]) {
            newCapturedPieces[transition.piece.toUpperCase()] = 1;
          } else {
            newCapturedPieces[transition.piece.toUpperCase()] += 1;
          }
        }
        state.moves[state.moves.length - 1].promotion = transition.piece;
        return {
          didChange: true,
          state: {
            ...state,
            capturedPieces: newCapturedPieces,
            legalMoves: state.game.allLegalMoves(),
            name: 'WAITING',
            scoreBlack: !isWhite
              ? state.scoreBlack + scoreBump
              : state.scoreBlack,
            scoreWhite: isWhite
              ? state.scoreWhite + scoreBump
              : state.scoreWhite,
          },
        };
      }
      default: {
        return {
          didChange: false,
          state,
        };
      }
    }
  };

  private _rewoundStateTransition = (
    state: RewoundState,
    transition: Transition,
  ): BoardChange => {
    switch (transition.name) {
      case 'FAST_FORWARD': {
        if (state.currentTurn === state.game.turn) {
          return { state, didChange: false };
        }
        const move = state.moves[state.currentTurn];
        state.game.fastForward(move);
        let newName: BoardState['name'];
        if (state.currentTurn === state.game.turn - 1) {
          newName =
            state.game.state() === GameState.PROMOTING
              ? 'PROMOTING'
              : 'WAITING';
          this.emitFurthestForward();
        } else {
          newName = 'REWOUND';
        }
        return {
          state: {
            ...state,
            currentTurn: state.currentTurn + 1,
            name: newName,
          },
          didChange: true,
        };
      }
      case 'REWIND': {
        if (state.currentTurn === 0) {
          this.emitFurthestBack();
          return { state, didChange: false };
        }
        if (state.currentTurn === 1) {
          this.emitFurthestBack();
        }
        const move = state.moves[state.currentTurn - 1];
        state.game.rewind(move);
        return {
          state: {
            ...state,
            currentTurn: state.currentTurn - 1,
            name: 'REWOUND',
          },
          didChange: true,
        };
      }
      default:
        return { state, didChange: false };
    }
  };

  private _waitingStateTransition = (
    state: WaitingState,
    transition: Transition,
  ): BoardChange => {
    switch (transition.name) {
      case 'REWIND': {
        if (state.game.turn === 0) {
          this.emitFurthestBack();
          return { state, didChange: false };
        }
        const move = state.moves[state.game.turn - 1];
        state.game.rewind(move);
        if (state.game.turn === 1) {
          this.emitFurthestBack();
        }
        return {
          state: {
            ...state,
            currentTurn: state.game.turn - 1,
            name: 'REWOUND',
          },
          didChange: true,
        };
      }
      case 'MOUSE_DOWN': {
        if (!(transition.square in state.game.board.pieces)) {
          return { state, didChange: false };
        }
        const piece = state.game.board.getPiece(transition.square);
        if (!piece) {
          return { state, didChange: false };
        }
        const isOppositeColor =
          (state.game.turn % 2 === 0 && piece.color === 'black') ||
          (state.game.turn % 2 === 1 && piece.color === 'white');
        const opponentPieceMoves = isOppositeColor
          ? piece
              .allSquareMoves(state.game.board)
              .map((move) => move.toSquare())
          : undefined;
        return {
          state: {
            ...state,
            name: 'MOUSE_DOWN_PIECE_SELECTED',
            selectedPiece: piece.toString(),
            square: transition.square,
            opponentPieceMoves,
          },
          didChange: true,
        };
      }
      case 'PROGRAMMATIC_MOVE': {
        const from = transition.move[0];
        const to = transition.move[1];
        if (!(from in state.game.board.pieces)) {
          return { state, didChange: false };
        }
        const piece = state.game.board.getPiece(from);
        if (!piece) {
          return { state, didChange: false };
        }

        if (!state.legalMoves[from]?.has(to)) {
          return { state, didChange: false };
        }

        return this._capturePieceOrMakeMove(state, from, to);
      }
      default:
        return { state, didChange: false };
    }
  };

  private _mouseDownPieceSelectedStateTransition = (
    state: MouseDownPieceSelected,
    transition: Transition,
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
        return { state, didChange: false };
    }
  };

  private _mouseUpPieceSelectedStateTransition = (
    state: MouseUpPieceSelected,
    transition: Transition,
  ): BoardChange => {
    switch (transition.name) {
      case 'MOUSE_DOWN': {
        if (!(transition.square in state.game.board.pieces)) {
          throw new Error(
            'Square must be in board - did you mean MOUSE_DOWN_OUTSIDE_BOARD transition?',
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
          return this._capturePieceOrMakeMove(
            state,
            state.square,
            transition.square,
          );
        }

        // 3. If it's an occupied piece, select the piece
        const piece = state.game.board.getPiece(transition.square);
        if (piece) {
          const isOppositeColor =
            (state.game.turn % 2 === 0 && piece.color === 'black') ||
            (state.game.turn % 2 === 1 && piece.color === 'white');
          const opponentPieceMoves = isOppositeColor
            ? piece
                .allSquareMoves(state.game.board)
                .map((move) => move.toSquare())
            : undefined;

          return {
            state: {
              ...state,
              name: 'MOUSE_DOWN_PIECE_SELECTED',
              selectedPiece: piece.toString(),
              square: transition.square,
              opponentPieceMoves,
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
        return { state, didChange: false };
    }
  };

  private _dragPieceStateTransition = (
    state: DragPieceState,
    transition: Transition,
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
        return this._capturePieceOrMakeMove(
          state,
          state.square,
          transition.square,
        );
      }
      default:
        return { state, didChange: false };
    }
  };

  private _cancelSelectionSoonStateTransition = (
    state: CancelSelectionSoonState,
    transition: Transition,
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
        return { state, didChange: false };
    }
  };
}
