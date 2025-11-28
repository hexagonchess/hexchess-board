import type { Board } from './board';
import { Position } from './position';
import type { Color, HexchessPiece, Piece } from './types';

export class Rook implements HexchessPiece {
  readonly color: Color;
  readonly position: Position;

  constructor(color: Color, position: Position) {
    this.color = color;
    this.position = position;
  }

  private _getTopPositions(
    board: Board,
    getSquare: (
      color: Color,
      position: Position,
      board: Board,
      getNextPos: () => Position | null,
    ) => boolean,
  ): Position[] {
    return this.position.getAllTopPositions((pos) =>
      getSquare(this.color, pos, board, () => pos.getTopPosition()),
    );
  }

  private _getTopRightPositions(
    board: Board,
    getSquare: (
      color: Color,
      position: Position,
      board: Board,
      getNextPos: () => Position | null,
    ) => boolean,
  ): Position[] {
    return this.position.getAllTopRightPositions((pos) =>
      getSquare(this.color, pos, board, () => pos.getTopRightPosition()),
    );
  }

  private _getBottomRightPositions(
    board: Board,
    getSquare: (
      color: Color,
      position: Position,
      board: Board,
      getNextPos: () => Position | null,
    ) => boolean,
  ): Position[] {
    return this.position.getAllBottomRightPositions((pos) =>
      getSquare(this.color, pos, board, () => pos.getBottomRightPosition()),
    );
  }

  private _getBottomPositions(
    board: Board,
    getSquare: (
      color: Color,
      position: Position,
      board: Board,
      getNextPos: () => Position | null,
    ) => boolean,
  ): Position[] {
    return this.position.getAllBottomPositions((pos) =>
      getSquare(this.color, pos, board, () => pos.getBottomPosition()),
    );
  }

  private _getBottomLeftPositions(
    board: Board,
    getSquare: (
      color: Color,
      position: Position,
      board: Board,
      getNextPos: () => Position | null,
    ) => boolean,
  ): Position[] {
    return this.position.getAllBottomLeftPositions((pos) =>
      getSquare(this.color, pos, board, () => pos.getBottomLeftPosition()),
    );
  }

  private _getTopLeftPositions(
    board: Board,
    getSquare: (
      color: Color,
      position: Position,
      board: Board,
      getNextPos: () => Position | null,
    ) => boolean,
  ): Position[] {
    return this.position.getAllTopLeftPositions((pos) =>
      getSquare(this.color, pos, board, () => pos.getTopLeftPosition()),
    );
  }

  allSquareMoves(board: Board): Position[] {
    const getSquare = (
      color: Color,
      position: Position,
      board: Board,
      getNextPos: () => Position | null,
    ) => {
      return Position.canGetNextPosition(color, position, board, getNextPos);
    };

    const topPositions = this._getTopPositions(board, getSquare);
    const topRightPositions = this._getTopRightPositions(board, getSquare);
    const bottomRightPositions = this._getBottomRightPositions(
      board,
      getSquare,
    );
    const bottomPositions = this._getBottomPositions(board, getSquare);
    const bottomLeftPositions = this._getBottomLeftPositions(board, getSquare);
    const topLeftPositions = this._getTopLeftPositions(board, getSquare);

    return [
      ...topPositions,
      ...topRightPositions,
      ...bottomRightPositions,
      ...bottomPositions,
      ...bottomLeftPositions,
      ...topLeftPositions,
    ];
  }

  defendedSquares(board: Board): Position[] {
    const topPositions = Position.getAllDefendedPositionsInDirection(
      this.position,
      board,
      (pos) => pos.getTopPosition(),
    );
    const topRightPositions = Position.getAllDefendedPositionsInDirection(
      this.position,
      board,
      (pos) => pos.getTopRightPosition(),
    );
    const bottomRightPositions = Position.getAllDefendedPositionsInDirection(
      this.position,
      board,
      (pos) => pos.getBottomRightPosition(),
    );
    const bottomPositions = Position.getAllDefendedPositionsInDirection(
      this.position,
      board,
      (pos) => pos.getBottomPosition(),
    );
    const bottomLeftPositions = Position.getAllDefendedPositionsInDirection(
      this.position,
      board,
      (pos) => pos.getBottomLeftPosition(),
    );
    const topLeftPositions = Position.getAllDefendedPositionsInDirection(
      this.position,
      board,
      (pos) => pos.getTopLeftPosition(),
    );

    return [
      ...topPositions,
      ...topRightPositions,
      ...bottomRightPositions,
      ...bottomPositions,
      ...bottomLeftPositions,
      ...topLeftPositions,
    ];
  }

  toString(): Piece {
    return this.color === 'white' ? 'R' : 'r';
  }
}
