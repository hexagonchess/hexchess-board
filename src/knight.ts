import type { Board } from './board';
import { King } from './king';
import type { Position } from './position';
import type { Color, HexchessPiece, Piece } from './types';

export class Knight implements HexchessPiece {
  readonly color: Color;
  readonly position: Position;

  constructor(color: Color, position: Position) {
    this.color = color;
    this.position = position;
  }

  private _validatePosition(position: Position | null, board: Board): boolean {
    if (position === null) {
      return false;
    }

    const piece = board.getPiece(position.toSquare());
    if (piece === null) {
      return true;
    }

    return piece.color !== this.color && !(piece instanceof King);
  }

  private _topTwoSquares(board: Board): [Position | null, Position | null] {
    const oneSquareUp = this.position.getTopPosition();
    if (oneSquareUp === null) {
      return [null, null];
    }

    const twoSquareUp = oneSquareUp.getTopPosition();
    if (twoSquareUp === null) {
      return [null, null];
    }

    const leftPos = twoSquareUp.getTopLeftPosition();
    const leftSquare = this._validatePosition(leftPos, board) ? leftPos : null;
    const rightPos = twoSquareUp.getTopRightPosition();
    const rightSquare = this._validatePosition(rightPos, board)
      ? rightPos
      : null;

    return [leftSquare, rightSquare];
  }

  private _topRightTwoSquares(
    board: Board,
  ): [Position | null, Position | null] {
    const oneSquareTopRight = this.position.getTopRightPosition();
    if (oneSquareTopRight === null) {
      return [null, null];
    }

    const twoSquareTopRight = oneSquareTopRight.getTopRightPosition();
    if (twoSquareTopRight === null) {
      return [null, null];
    }

    const topPos = twoSquareTopRight.getTopPosition();
    const topSquare = this._validatePosition(topPos, board) ? topPos : null;
    const bottomRightPos = twoSquareTopRight.getBottomRightPosition();
    const bottomRightSquare = this._validatePosition(bottomRightPos, board)
      ? bottomRightPos
      : null;

    return [topSquare, bottomRightSquare];
  }

  private _bottomRightTwoSquares(
    board: Board,
  ): [Position | null, Position | null] {
    const oneSquareBottomRight = this.position.getBottomRightPosition();
    if (oneSquareBottomRight === null) {
      return [null, null];
    }

    const twoSquareBottomRight = oneSquareBottomRight.getBottomRightPosition();
    if (twoSquareBottomRight === null) {
      return [null, null];
    }

    const topRightPos = twoSquareBottomRight.getTopRightPosition();
    const topRightSquare = this._validatePosition(topRightPos, board)
      ? topRightPos
      : null;
    const bottomPos = twoSquareBottomRight.getBottomPosition();
    const bottomSquare = this._validatePosition(bottomPos, board)
      ? bottomPos
      : null;

    return [topRightSquare, bottomSquare];
  }

  private _bottomTwoSquares(board: Board): [Position | null, Position | null] {
    const oneSquareDown = this.position.getBottomPosition();
    if (oneSquareDown === null) {
      return [null, null];
    }

    const twoSquareDown = oneSquareDown.getBottomPosition();
    if (twoSquareDown === null) {
      return [null, null];
    }

    const bottomRightPos = twoSquareDown.getBottomRightPosition();
    const bottomRightSquare = this._validatePosition(bottomRightPos, board)
      ? bottomRightPos
      : null;
    const bottomLeftPos = twoSquareDown.getBottomLeftPosition();
    const bottomLeftSquare = this._validatePosition(bottomLeftPos, board)
      ? bottomLeftPos
      : null;

    return [bottomRightSquare, bottomLeftSquare];
  }

  private _bottomLeftTwoSquares(
    board: Board,
  ): [Position | null, Position | null] {
    const oneSquareBottomLeft = this.position.getBottomLeftPosition();
    if (oneSquareBottomLeft === null) {
      return [null, null];
    }

    const twoSquareBottomLeft = oneSquareBottomLeft.getBottomLeftPosition();
    if (twoSquareBottomLeft === null) {
      return [null, null];
    }

    const bottomPos = twoSquareBottomLeft.getBottomPosition();
    const bottomSquare = this._validatePosition(bottomPos, board)
      ? bottomPos
      : null;
    const topLeftPos = twoSquareBottomLeft.getTopLeftPosition();
    const topLeftSquare = this._validatePosition(topLeftPos, board)
      ? topLeftPos
      : null;

    return [bottomSquare, topLeftSquare];
  }

  private _topLeftTwoSquares(board: Board): [Position | null, Position | null] {
    const oneSquareTopLeft = this.position.getTopLeftPosition();
    if (oneSquareTopLeft === null) {
      return [null, null];
    }

    const twoSquareTopLeft = oneSquareTopLeft.getTopLeftPosition();
    if (twoSquareTopLeft === null) {
      return [null, null];
    }

    const topPos = twoSquareTopLeft.getTopPosition();
    const topSquare = this._validatePosition(topPos, board) ? topPos : null;
    const bottomLeftPos = twoSquareTopLeft.getBottomLeftPosition();
    const bottomLeftSquare = this._validatePosition(bottomLeftPos, board)
      ? bottomLeftPos
      : null;

    return [topSquare, bottomLeftSquare];
  }

  allSquareMoves(board: Board): Position[] {
    return [
      ...this._topTwoSquares(board),
      ...this._topRightTwoSquares(board),
      ...this._bottomRightTwoSquares(board),
      ...this._bottomTwoSquares(board),
      ...this._bottomLeftTwoSquares(board),
      ...this._topLeftTwoSquares(board),
    ].filter((pos) => pos !== null) as Position[];
  }

  defendedSquares(_board: Board): Position[] {
    const topTwo = this.position.getTopPosition()?.getTopPosition();
    const topRightTwo = this.position
      .getTopRightPosition()
      ?.getTopRightPosition();
    const bottomRightTwo = this.position
      .getBottomRightPosition()
      ?.getBottomRightPosition();
    const bottomTwo = this.position.getBottomPosition()?.getBottomPosition();
    const bottomLeftTwo = this.position
      .getBottomLeftPosition()
      ?.getBottomLeftPosition();
    const topLeftTwo = this.position.getTopLeftPosition()?.getTopLeftPosition();

    return [
      topTwo?.getTopLeftPosition(),
      topTwo?.getTopRightPosition(),
      topRightTwo?.getTopPosition(),
      topRightTwo?.getBottomRightPosition(),
      bottomRightTwo?.getTopRightPosition(),
      bottomRightTwo?.getBottomPosition(),
      bottomTwo?.getBottomRightPosition(),
      bottomTwo?.getBottomLeftPosition(),
      bottomLeftTwo?.getBottomPosition(),
      bottomLeftTwo?.getTopLeftPosition(),
      topLeftTwo?.getBottomLeftPosition(),
      topLeftTwo?.getTopPosition(),
    ].filter((pos) => pos !== null && pos !== undefined) as Position[];
  }

  toString(): Piece {
    return this.color === 'white' ? 'N' : 'n';
  }
}
