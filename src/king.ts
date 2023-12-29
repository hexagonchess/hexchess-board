import {Board} from './board';
import {Position} from './position';
import {Color, HexchessPiece, Piece} from './types';

export class King implements HexchessPiece {
  readonly color: Color;
  readonly position: Position;

  constructor(color: Color, position: Position) {
    this.color = color;
    this.position = position;
  }

  private _validatePosition(newPos: Position, board: Board): boolean {
    if (!(newPos.toSquare() in board)) {
      return false;
    }

    const piece = board.getPiece(newPos.toSquare());
    if (piece === null) {
      return true;
    }

    return piece.color !== this.color && !(piece instanceof King);
  }

  private _topSquare(board: Board): Position | null {
    const newPos = this.position.getTopPosition();
    if (newPos === null) {
      return null;
    }
    return this._validatePosition(newPos, board) ? newPos : null;
  }

  private _topRightSquare(board: Board): Position | null {
    const newPos = this.position.getTopRightPosition();
    if (newPos === null) {
      return null;
    }
    return this._validatePosition(newPos, board) ? newPos : null;
  }

  private _topSkipRightSquare(board: Board): Position | null {
    const newPos = this.position.getSkipTopRightPosition();
    if (newPos === null) {
      return null;
    }
    return this._validatePosition(newPos, board) ? newPos : null;
  }

  private _rightSquare(board: Board): Position | null {
    const newPos = this.position.getRightPosition();
    if (newPos === null) {
      return null;
    }
    return this._validatePosition(newPos, board) ? newPos : null;
  }

  private _bottomRightSquare(board: Board): Position | null {
    const newPos = this.position.getBottomRightPosition();
    if (newPos === null) {
      return null;
    }
    return this._validatePosition(newPos, board) ? newPos : null;
  }

  private _bottomSkipRightSquare(board: Board): Position | null {
    const newPos = this.position.getSkipBottomRightPosition();
    if (newPos === null) {
      return null;
    }
    return this._validatePosition(newPos, board) ? newPos : null;
  }

  private _bottomSquare(board: Board): Position | null {
    const newPos = this.position.getBottomPosition();
    if (newPos === null) {
      return null;
    }
    return this._validatePosition(newPos, board) ? newPos : null;
  }

  private _bottomLeftSquare(board: Board): Position | null {
    const newPos = this.position.getBottomLeftPosition();
    if (newPos === null) {
      return null;
    }
    return this._validatePosition(newPos, board) ? newPos : null;
  }

  private _bottomSkipLeftSquare(board: Board): Position | null {
    const newPos = this.position.getSkipBottomLeftPosition();
    if (newPos === null) {
      return null;
    }
    return this._validatePosition(newPos, board) ? newPos : null;
  }

  private _leftSquare(board: Board): Position | null {
    const newPos = this.position.getLeftPosition();
    if (newPos === null) {
      return null;
    }
    return this._validatePosition(newPos, board) ? newPos : null;
  }

  private _topLeftSquare(board: Board): Position | null {
    const newPos = this.position.getTopLeftPosition();
    if (newPos === null) {
      return null;
    }
    return this._validatePosition(newPos, board) ? newPos : null;
  }

  private _topSkipLeftSquare(board: Board): Position | null {
    const newPos = this.position.getSkipTopLeftPosition();
    if (newPos === null) {
      return null;
    }
    return this._validatePosition(newPos, board) ? newPos : null;
  }

  allSquareMoves(board: Board): Position[] {
    return [
      this._topSquare(board),
      this._topRightSquare(board),
      this._topSkipRightSquare(board),
      this._rightSquare(board),
      this._bottomRightSquare(board),
      this._bottomSkipRightSquare(board),
      this._bottomSquare(board),
      this._bottomLeftSquare(board),
      this._bottomSkipLeftSquare(board),
      this._leftSquare(board),
      this._topLeftSquare(board),
      this._topSkipLeftSquare(board),
    ].filter((pos) => pos !== null) as Position[];
  }

  defendedSquares(_board: Board): Position[] {
    return [
      this.position.getTopPosition(),
      this.position.getTopRightPosition(),
      this.position.getSkipTopRightPosition(),
      this.position.getRightPosition(),
      this.position.getBottomRightPosition(),
      this.position.getSkipBottomRightPosition(),
      this.position.getBottomPosition(),
      this.position.getBottomLeftPosition(),
      this.position.getSkipBottomLeftPosition(),
      this.position.getLeftPosition(),
      this.position.getTopLeftPosition(),
      this.position.getSkipTopLeftPosition(),
    ].filter((pos) => pos !== null) as Position[];
  }

  toString(): Piece {
    return this.color === 'white' ? 'K' : 'k';
  }
}
