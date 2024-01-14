import {Board} from './board';
import {Position} from './position';
import {Color, HexchessPiece, Piece} from './types';

export class Pawn implements HexchessPiece {
  readonly color: Color;
  readonly position: Position;
  readonly didMoveTwoSquares: boolean;

  constructor(color: Color, position: Position, didMoveTwoSquares = false) {
    this.color = color;
    this.position = position;
    this.didMoveTwoSquares = didMoveTwoSquares;
  }

  private _canMoveTwoSquares(): boolean {
    switch (this.position.col) {
      case 'F':
        return (
          (this.color === 'white' && this.position.row === 5) ||
          (this.color === 'black' && this.position.row === 7)
        );
      case 'E':
      case 'G':
        return (
          (this.color === 'white' && this.position.row === 4) ||
          (this.color === 'black' && this.position.row === 7)
        );
      case 'D':
      case 'H':
        return (
          (this.color === 'white' && this.position.row === 3) ||
          (this.color === 'black' && this.position.row === 7)
        );
      case 'C':
      case 'I':
        return (
          (this.color === 'white' && this.position.row === 2) ||
          (this.color === 'black' && this.position.row === 7)
        );
      case 'B':
      case 'K':
        return (
          (this.color === 'white' && this.position.row === 1) ||
          (this.color === 'black' && this.position.row === 7)
        );
      case 'A':
      case 'L':
        return false;
    }
  }

  private _getForwardSquare(board: Board): Position | null {
    const pos =
      this.color === 'white'
        ? this.position.getTopPosition()
        : this.position.getBottomPosition();
    if (pos === null) {
      return null;
    }

    const piece = board.getPiece(pos.toSquare());
    return piece === null ? pos : null;
  }

  private _getTwoSquareForward(board: Board): Position | null {
    if (!this._canMoveTwoSquares()) {
      return null;
    }

    const firstPos = this._getForwardSquare(board);
    if (firstPos === null) {
      return null;
    }

    const secondPos =
      this.color === 'white'
        ? firstPos.getTopPosition()
        : firstPos.getBottomPosition();
    if (secondPos === null) {
      // Should not be possible
      return null;
    }
    const piece = board.getPiece(secondPos.toSquare());
    return piece === null ? secondPos : null;
  }

  private _getEnpassantSquare(
    board: Board,
    direction: 'left' | 'right'
  ): Position | null {
    const piecePos =
      this.color === 'white'
        ? direction === 'left'
          ? this.position.getBottomLeftPosition()!
          : this.position.getBottomRightPosition()!
        : direction === 'left'
        ? this.position.getTopLeftPosition()!
        : this.position.getTopRightPosition()!;
    if (piecePos === null) {
      return null;
    }

    const piece = board.getPiece(piecePos.toSquare());
    if (piece === null) {
      return null;
    }
    if (!(piece instanceof Pawn)) {
      return null;
    }
    if (piece.color === this.color) {
      return null;
    }
    if (!piece.didMoveTwoSquares) {
      return null;
    }

    return this.color === 'white'
      ? direction === 'left'
        ? this.position.getTopLeftPosition()
        : this.position.getTopRightPosition()
      : direction === 'left'
      ? this.position.getBottomLeftPosition()
      : this.position.getBottomRightPosition();
  }

  private _getCaptureSquare(
    board: Board,
    direction: 'left' | 'right'
  ): Position | null {
    let pos: Position | null;
    if (this.color === 'white') {
      pos =
        direction === 'left'
          ? this.position.getTopLeftPosition()
          : this.position.getTopRightPosition();
    } else {
      pos =
        direction === 'left'
          ? this.position.getBottomLeftPosition()
          : this.position.getBottomRightPosition();
    }

    if (pos === null) {
      return null;
    }
    const piece = board.getPiece(pos.toSquare());
    if (piece === null) {
      return null;
    }
    return piece.color !== this.color ? pos : null;
  }

  allSquareMoves(board: Board): Position[] {
    return [
      this._getForwardSquare(board),
      this._getTwoSquareForward(board),
      this._getCaptureSquare(board, 'left'),
      this._getCaptureSquare(board, 'right'),
      this._getEnpassantSquare(board, 'left'),
      this._getEnpassantSquare(board, 'right'),
    ].filter((pos) => pos !== null) as Position[];
  }

  canBePromoted(): boolean {
    if (this.color === 'black') {
      return this.position.isBeginningOfColumn();
    }

    return this.position.isEndOfColumn();
  }

  defendedSquares(_board: Board): Position[] {
    if (this.color === 'white') {
      return [
        this.position.getTopLeftPosition(),
        this.position.getTopRightPosition(),
      ].filter((pos) => pos !== null) as Position[];
    }

    return [
      this.position.getBottomLeftPosition(),
      this.position.getBottomRightPosition(),
    ].filter((pos) => pos !== null) as Position[];
  }

  toString(): Piece {
    return this.color === 'white' ? 'P' : 'p';
  }
}
