import {Board} from './board';
import {Position} from './position';
import {Color, HexchessPiece, Piece} from './types';

export class Bishop implements HexchessPiece {
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
      getNextPos: () => Position | null
    ) => boolean
  ): Position[] {
    return this.position.getAllLeftPositions((pos) =>
      getSquare(this.color, pos, board, () => pos.getLeftPosition())
    );
  }

  private _getAllRightSquare(
    board: Board,
    getSquare: (
      color: Color,
      position: Position,
      board: Board,
      getNextPos: () => Position | null
    ) => boolean
  ): Position[] {
    return this.position.getAllRightPositions((pos) =>
      getSquare(this.color, pos, board, () => pos.getRightPosition())
    );
  }

  private _getAllSkipTopRightSquares(
    board: Board,
    getSquare: (
      color: Color,
      position: Position,
      board: Board,
      getNextPos: () => Position | null
    ) => boolean
  ): Position[] {
    return this.position.getAllSkipTopRightPositions((pos) =>
      getSquare(this.color, pos, board, () => pos.getSkipTopRightPosition())
    );
  }

  private _getAllSkipBottomRightSquares(
    board: Board,
    getSquare: (
      color: Color,
      position: Position,
      board: Board,
      getNextPos: () => Position | null
    ) => boolean
  ): Position[] {
    return this.position.getAllSkipBottomRightPositions((pos) =>
      getSquare(this.color, pos, board, () => pos.getSkipBottomRightPosition())
    );
  }

  private _getAllSkipTopLeftSquares(
    board: Board,
    getSquare: (
      color: Color,
      position: Position,
      board: Board,
      getNextPos: () => Position | null
    ) => boolean
  ): Position[] {
    return this.position.getAllSkipTopLeftPositions((pos) =>
      getSquare(this.color, pos, board, () => pos.getSkipTopLeftPosition())
    );
  }

  private _getAllSkipBottomLeftSquares(
    board: Board,
    getSquare: (
      color: Color,
      position: Position,
      board: Board,
      getNextPos: () => Position | null
    ) => boolean
  ): Position[] {
    return this.position.getAllSkipBottomLeftPositions((pos) =>
      getSquare(this.color, pos, board, () => pos.getSkipBottomLeftPosition())
    );
  }

  allSquareMoves(board: Board): Position[] {
    const getSquare = (
      color: Color,
      position: Position,
      board: Board,
      getNextPos: () => Position | null
    ): boolean =>
      Position.canGetNextPosition(color, position, board, getNextPos);

    const allLeftSquare = this._getAllLeftSquares(board, getSquare);
    const allRightSquares = this._getAllRightSquare(board, getSquare);
    const allSkipTopRightSquares = this._getAllSkipTopRightSquares(
      board,
      getSquare
    );
    const allSkipBottomRightSquares = this._getAllSkipBottomRightSquares(
      board,
      getSquare
    );
    const allSkipTopLeftSquares = this._getAllSkipTopLeftSquares(
      board,
      getSquare
    );
    const allSkipBottomLeftSquares = this._getAllSkipBottomLeftSquares(
      board,
      getSquare
    );

    return [
      ...allLeftSquare,
      ...allRightSquares,
      ...allSkipTopRightSquares,
      ...allSkipBottomRightSquares,
      ...allSkipTopLeftSquares,
      ...allSkipBottomLeftSquares,
    ];
  }

  defendedSquares(board: Board): Position[] {
    const leftPositions = Position.getAllDefendedPositionsInDirection(
      this.position,
      board,
      (pos: Position): Position | null => pos.getLeftPosition()
    );
    const rightPositions = Position.getAllDefendedPositionsInDirection(
      this.position,
      board,
      (pos: Position): Position | null => pos.getRightPosition()
    );
    const skipTopRightPositions = Position.getAllDefendedPositionsInDirection(
      this.position,
      board,
      (pos: Position): Position | null => pos.getSkipTopRightPosition()
    );
    const skipBottomRightPositions =
      Position.getAllDefendedPositionsInDirection(
        this.position,
        board,
        (pos: Position): Position | null => pos.getSkipBottomRightPosition()
      );
    const skipTopLeftPositions = Position.getAllDefendedPositionsInDirection(
      this.position,
      board,
      (pos: Position): Position | null => pos.getSkipTopLeftPosition()
    );
    const skipBottomLeftPositions = Position.getAllDefendedPositionsInDirection(
      this.position,
      board,
      (pos: Position): Position | null => pos.getSkipBottomLeftPosition()
    );
    return [
      ...leftPositions,
      ...rightPositions,
      ...skipTopRightPositions,
      ...skipBottomRightPositions,
      ...skipTopLeftPositions,
      ...skipBottomLeftPositions,
    ];
  }

  toString(): Piece {
    return this.color === 'white' ? 'B' : 'b';
  }
}
