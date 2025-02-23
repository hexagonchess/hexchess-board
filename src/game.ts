import { Bishop } from './bishop';
import { Board } from './board';
import { King } from './king';
import { Knight } from './knight';
import { Pawn } from './pawn';
import { Position } from './position';
import { Queen } from './queen';
import { Rook } from './rook';
import { Color, HexchessPiece, LegalMoves, Move, Piece } from './types';
import { Square } from './utils';

export enum GameState {
  CHECKMATE = 0,
  STALEMATE = 1,
  IN_PROGRESS = 2,
  PROMOTING = 3,
}

export class Game {
  readonly board: Board;
  turn: number;

  private _inCheck: boolean;
  private _promoting: boolean;
  private _checkmate: boolean;
  private _stalemate: boolean;

  constructor(board: Board = Board.new(), turn = 0) {
    this.board = board;
    this.turn = turn;

    this._promoting = this.pawnAtEnd().length === 1;
    this._inCheck = this._isInCheck(this.turn % 2 === 0 ? 'white' : 'black');
    this._checkmate = this._isCheckmate(
      this.turn % 2 === 0 ? 'white' : 'black',
    );
    this._stalemate = this._isStalemate(
      this.turn % 2 === 0 ? 'white' : 'black',
    );
  }

  state(): GameState {
    if (this._promoting) {
      return GameState.PROMOTING;
    }
    if (this._checkmate) {
      return GameState.CHECKMATE;
    }
    if (this._stalemate) {
      return GameState.STALEMATE;
    }
    return GameState.IN_PROGRESS;
  }

  pawnAtEnd(): HexchessPiece[] {
    const currentColor = this.turn % 2 === 0 ? 'white' : 'black';
    const pieces = this.board.getPieces(currentColor);

    return pieces.filter((piece) => {
      if (!(piece instanceof Pawn)) return false;

      // Get position information
      const square = piece.position.toSquare();
      const row = parseInt(square.slice(1));
      const column = square[0];

      // Check if pawn is at the end row for its color
      if (currentColor === 'white') {
        switch (column) {
          case 'A':
          case 'L':
            return row === 6;
          case 'B':
          case 'K':
            return row === 7;
          case 'C':
          case 'I':
            return row === 8;
          case 'D':
          case 'H':
            return row === 9;
          case 'E':
          case 'G':
            return row === 10;
          case 'F':
            return row === 11;
        }
      }
      // Black pawns promote at row 1
      return row === 1;
    });
  }

  canMoveTo(from: Position, to: Position): boolean {
    if (this.state() !== GameState.IN_PROGRESS) {
      return false;
    }

    const originPiece = this.board.getPiece(from.toSquare());
    if (originPiece === null) {
      return false;
    }
    if (originPiece.color !== (this.turn % 2 === 0 ? 'white' : 'black')) {
      return false;
    }

    const otherPiece = this.board.getPiece(to.toSquare());
    if (otherPiece !== null && otherPiece.color === originPiece.color) {
      return false;
    }

    // Cannot make a move that would result in being in check
    const clone = Board.clone(this.board);
    try {
      if (clone.getPiece(to.toSquare()) !== null) {
        clone.capturePiece(from, to);
      } else if (
        clone.getPiece(to.toSquare()) instanceof Pawn &&
        to.col !== from.col
      ) {
        clone.enPassant(from, to);
      } else {
        clone.movePiece(from, to);
      }
      const newGame = new Game(clone, this.turn);
      if (newGame.isInCheck()) {
        return false;
      }
    } catch (error) {
      return false;
    }

    return originPiece
      .allSquareMoves(this.board)
      .some((pos) => pos.col === to.col && pos.row === to.row);
  }

  private _getCheckedSquares(color: Omit<Color, 'grey'>): Set<Square> {
    const checkPositions: Set<Square> = new Set(
      this.board
        .getPieces(color === 'white' ? 'black' : 'white')
        .filter((piece) => !(piece instanceof Pawn))
        .flatMap((piece) => piece.allSquareMoves(this.board))
        .map((pos) => pos.toSquare()),
    );
    const defendedPositions = this.board
      .getPieces(color === 'white' ? 'black' : 'white')
      .flatMap((piece) => piece.defendedSquares(this.board));
    for (const position of defendedPositions) {
      checkPositions.add(position.toSquare());
    }
    return checkPositions;
  }

  private _getValidKingPositions(color: Omit<Color, 'grey'>): Position[] {
    const checkedSquares = this._getCheckedSquares(color);
    const king = this.board.getKing(color);
    if (king === null) {
      throw new Error('Must have a king on the board');
    }

    return king
      .allSquareMoves(this.board)
      .filter((pos) => !checkedSquares.has(pos.toSquare()));
  }

  private _isInCheck(color: Omit<Color, 'grey'>): boolean {
    const king = this.board.getKing(color);
    if (king === null) {
      throw new Error('Must have a king on the board');
    }

    const checkedSquares = this._getCheckedSquares(color);
    return checkedSquares.has(king.position.toSquare());
  }

  private _isCheckmate(color: Omit<Color, 'grey'>): boolean {
    const kingPositions = this._getValidKingPositions(color);
    return kingPositions.length === 0 && this._inCheck;
  }

  private _isStalemate(color: Omit<Color, 'grey'>): boolean {
    const pieces = this.board.getPieces(color);
    const kingPositions = this._getValidKingPositions(color);
    // King has no legal moves, and no other piece exists to move
    if (kingPositions.length === 0 && !this._inCheck && pieces.length === 1) {
      return true;
    }

    // Insufficient material
    return this.board.numPieces() === 2;
  }

  isCheckmate(): boolean {
    return this._isCheckmate(this.turn % 2 === 0 ? 'white' : 'black');
  }

  isStalemate(): boolean {
    return this._isStalemate(this.turn % 2 === 0 ? 'white' : 'black');
  }

  isInCheck(): boolean {
    return this._isInCheck(this.turn % 2 === 0 ? 'white' : 'black');
  }

  movePiece(from: Position, to: Position): void {
    if (!this.canMoveTo(from, to)) {
      throw new Error(`Cannot move ${from} to ${to}`);
    }

    const otherPiece = this.board.getPiece(to.toSquare());
    if (otherPiece !== null) {
      this.board.capturePiece(from, to);
    } else if (
      this.board.getPiece(from.toSquare()) instanceof Pawn &&
      to.col !== from.col
    ) {
      this.board.enPassant(from, to);
    } else {
      this.board.movePiece(from, to);
    }

    const newLocationPiece = this.board.getPiece(to.toSquare());
    if (newLocationPiece instanceof Pawn && newLocationPiece.canBePromoted()) {
      this._promoting = true;
    } else {
      this.turn += 1;
      if (this.isInCheck()) {
        this._inCheck = true;
      }
      if (this.isCheckmate()) {
        this._checkmate = true;
      }
      if (this.isStalemate()) {
        this._stalemate = true;
      }
    }
  }

  promotePawn(piece: Omit<Piece, 'p' | 'P' | 'K' | 'k'>): void {
    const pawns = this.pawnAtEnd();
    if (pawns.length !== 1) {
      throw new Error('Must have exactly one pawn to promote');
    }
    if (!this._promoting) {
      throw new Error('Must be in the promoting state');
    }

    const pawn = pawns[0];
    if (!(pawn instanceof Pawn)) {
      throw new Error('Must have a pawn to promote');
    }
    if (!pawn.canBePromoted()) {
      throw new Error('Pawn must be promotable');
    }

    this.board.promotePawn(pawn.position.toSquare(), piece);
    this._promoting = false;
    this.turn += 1;

    if (this.isInCheck()) {
      this._inCheck = true;
    }
    if (this.isCheckmate()) {
      this._checkmate = true;
    }
    if (this.isStalemate()) {
      this._stalemate = true;
    }
  }

  allLegalMoves(): LegalMoves {
    const color = this.turn % 2 === 0 ? 'white' : 'black';
    const pieces = this.board.getPieces(color);
    const moves: Partial<Record<Square, Set<Square>>> = {};

    for (const piece of pieces) {
      const pieceMoves = piece.allSquareMoves(this.board);
      for (const move of pieceMoves) {
        if (this.canMoveTo(piece.position, move)) {
          const piecePosition = piece.position.toSquare();
          if (!(piecePosition in moves)) {
            moves[piecePosition] = new Set([move.toSquare()]);
          } else {
            if (!moves[piecePosition]) {
              throw new Error(`No moves for ${piecePosition}`);
            }
            moves[piecePosition]?.add(move.toSquare());
          }
        }
      }
    }

    return moves as LegalMoves;
  }

  fastForward(move: Move): void {
    if (move.enPassant) {
      this.board.enPassant(
        Position.fromString(move.from),
        Position.fromString(move.to),
      );
    } else if (move.capturedPiece) {
      this.board.capturePiece(
        Position.fromString(move.from),
        Position.fromString(move.to),
      );
    } else {
      this.board.movePiece(
        Position.fromString(move.from),
        Position.fromString(move.to),
      );
    }

    switch (move.promotion) {
      case 'Q':
        this.board.addPiece(new Queen('white', Position.fromString(move.to)));
        break;
      case 'q':
        this.board.addPiece(new Queen('black', Position.fromString(move.to)));
        break;
      case 'R':
        this.board.addPiece(new Rook('white', Position.fromString(move.to)));
        break;
      case 'r':
        this.board.addPiece(new Rook('black', Position.fromString(move.to)));
        break;
      case 'B':
        this.board.addPiece(new Bishop('white', Position.fromString(move.to)));
        break;
      case 'b':
        this.board.addPiece(new Bishop('black', Position.fromString(move.to)));
        break;
      case 'N':
        this.board.addPiece(new Knight('white', Position.fromString(move.to)));
        break;
      case 'n':
        this.board.addPiece(new Knight('black', Position.fromString(move.to)));
        break;
      default:
        break;
    }
  }

  rewind(move: Move): void {
    if (move.promotion) {
      let color: Color = 'white';
      switch (move.promotion) {
        case 'q':
        case 'r':
        case 'b':
        case 'n':
          color = 'black';
          break;
        default:
          break;
      }
      this.board.removePiece(move.from);
      this.board.addPiece(new Pawn(color, Position.fromString(move.to), false));
    }

    this.board.movePiece(
      Position.fromString(move.to),
      Position.fromString(move.from),
      true,
    );

    if (move.capturedPiece) {
      if (move.capturedPiece === 'p') {
        if (move.enPassant) {
          const newPosition = Position.fromString(move.to).getTopPosition();
          if (!newPosition) {
            throw new Error('This is impossible');
          }
          this.board.addPiece(new Pawn('black', newPosition));
        } else {
          this.board.addPiece(new Pawn('black', Position.fromString(move.to)));
        }
      } else if (move.capturedPiece === 'P') {
        if (move.enPassant) {
          const newPosition = Position.fromString(move.to).getTopPosition();
          if (!newPosition) {
            throw new Error('This is impossible');
          }
          this.board.addPiece(new Pawn('white', newPosition));
        } else {
          this.board.addPiece(new Pawn('white', Position.fromString(move.to)));
        }
      } else if (move.capturedPiece === 'k') {
        this.board.addPiece(new King('black', Position.fromString(move.to)));
      } else if (move.capturedPiece === 'K') {
        this.board.addPiece(new King('white', Position.fromString(move.to)));
      } else if (move.capturedPiece === 'q') {
        this.board.addPiece(new Queen('black', Position.fromString(move.to)));
      } else if (move.capturedPiece === 'Q') {
        this.board.addPiece(new Queen('white', Position.fromString(move.to)));
      } else if (move.capturedPiece === 'r') {
        this.board.addPiece(new Rook('black', Position.fromString(move.to)));
      } else if (move.capturedPiece === 'R') {
        this.board.addPiece(new Rook('white', Position.fromString(move.to)));
      } else if (move.capturedPiece === 'b') {
        this.board.addPiece(new Bishop('black', Position.fromString(move.to)));
      } else if (move.capturedPiece === 'B') {
        this.board.addPiece(new Bishop('white', Position.fromString(move.to)));
      } else if (move.capturedPiece === 'n') {
        this.board.addPiece(new Knight('black', Position.fromString(move.to)));
      } else if (move.capturedPiece === 'N') {
        this.board.addPiece(new Knight('white', Position.fromString(move.to)));
      } else {
        throw new Error('Invalid piece');
      }
    }
  }
}
