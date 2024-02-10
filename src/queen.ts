import { Board } from './board';
import { Position } from './position';
import { Color, HexchessPiece, Piece } from './types';

export class Queen implements HexchessPiece {
  readonly color: Color;
  readonly position: Position;

  constructor(color: Color, position: Position) {
    this.color = color;
    this.position = position;
  }

  private _getAllLeftSquares(
    board: Board,
    getSquare: (
      color: Color,
      position: Position,
      board: Board,
      getNextPos: () => Position | null,
    ) => boolean,
  ): Position[] {
    return this.position.getAllLeftPositions((pos) =>
      getSquare(this.color, pos, board, () => pos.getLeftPosition()),
    );
  }

  private _getAllRightSquare(
    board: Board,
    getSquare: (
      color: Color,
      position: Position,
      board: Board,
      getNextPos: () => Position | null,
    ) => boolean,
  ): Position[] {
    return this.position.getAllRightPositions((pos) =>
      getSquare(this.color, pos, board, () => pos.getRightPosition()),
    );
  }

  private _getAllSkipTopRightSquares(
    board: Board,
    getSquare: (
      color: Color,
      position: Position,
      board: Board,
      getNextPos: () => Position | null,
    ) => boolean,
  ): Position[] {
    return this.position.getAllSkipTopRightPositions((pos) =>
      getSquare(this.color, pos, board, () => pos.getSkipTopRightPosition()),
    );
  }

  private _getAllSkipBottomRightSquares(
    board: Board,
    getSquare: (
      color: Color,
      position: Position,
      board: Board,
      getNextPos: () => Position | null,
    ) => boolean,
  ): Position[] {
    return this.position.getAllSkipBottomRightPositions((pos) =>
      getSquare(this.color, pos, board, () => pos.getSkipBottomRightPosition()),
    );
  }

  private _getAllSkipTopLeftSquares(
    board: Board,
    getSquare: (
      color: Color,
      position: Position,
      board: Board,
      getNextPos: () => Position | null,
    ) => boolean,
  ): Position[] {
    return this.position.getAllSkipTopLeftPositions((pos) =>
      getSquare(this.color, pos, board, () => pos.getSkipTopLeftPosition()),
    );
  }

  private _getAllSkipBottomLeftSquares(
    board: Board,
    getSquare: (
      color: Color,
      position: Position,
      board: Board,
      getNextPos: () => Position | null,
    ) => boolean,
  ): Position[] {
    return this.position.getAllSkipBottomLeftPositions((pos) =>
      getSquare(this.color, pos, board, () => pos.getSkipBottomLeftPosition()),
    );
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

    const allLeftSquare = this._getAllLeftSquares(board, getSquare);
    const allRightSquares = this._getAllRightSquare(board, getSquare);
    const allSkipTopRightSquares = this._getAllSkipTopRightSquares(
      board,
      getSquare,
    );
    const allSkipBottomRightSquares = this._getAllSkipBottomRightSquares(
      board,
      getSquare,
    );
    const allSkipTopLeftSquares = this._getAllSkipTopLeftSquares(
      board,
      getSquare,
    );
    const allSkipBottomLeftSquares = this._getAllSkipBottomLeftSquares(
      board,
      getSquare,
    );
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
      ...allLeftSquare,
      ...allRightSquares,
      ...allSkipTopRightSquares,
      ...allSkipBottomRightSquares,
      ...allSkipTopLeftSquares,
      ...allSkipBottomLeftSquares,
      ...topPositions,
      ...topRightPositions,
      ...bottomRightPositions,
      ...bottomPositions,
      ...bottomLeftPositions,
      ...topLeftPositions,
    ];
  }

  defendedSquares(board: Board): Position[] {
    const leftPositions = Position.getAllDefendedPositionsInDirection(
      this.position,
      board,
      (pos) => pos.getLeftPosition(),
    );
    const rightPositions = Position.getAllDefendedPositionsInDirection(
      this.position,
      board,
      (pos) => pos.getRightPosition(),
    );
    const skipTopRightPositions = Position.getAllDefendedPositionsInDirection(
      this.position,
      board,
      (pos) => pos.getSkipTopRightPosition(),
    );
    const skipBottomRightPositions =
      Position.getAllDefendedPositionsInDirection(this.position, board, (pos) =>
        pos.getSkipBottomRightPosition(),
      );
    const skipTopLeftPositions = Position.getAllDefendedPositionsInDirection(
      this.position,
      board,
      (pos) => pos.getSkipTopLeftPosition(),
    );
    const skipBottomLeftPositions = Position.getAllDefendedPositionsInDirection(
      this.position,
      board,
      (pos) => pos.getSkipBottomLeftPosition(),
    );
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
      ...leftPositions,
      ...rightPositions,
      ...skipTopRightPositions,
      ...skipBottomRightPositions,
      ...skipTopLeftPositions,
      ...skipBottomLeftPositions,
      ...topPositions,
      ...topRightPositions,
      ...bottomRightPositions,
      ...bottomPositions,
      ...bottomLeftPositions,
      ...topLeftPositions,
    ];
  }

  toString(): Piece {
    return this.color === 'white' ? 'Q' : 'q';
  }
}
