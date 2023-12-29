import {Board} from './board';
import {Color} from './types';
import {COLUMN_ARRAY, Column, Square} from './utils';

export class Position {
  readonly col: Column;
  readonly row: number;

  static canGetNextPosition(
    color: Omit<Color, 'grey'>,
    startingPosition: Position,
    board: Board,
    getNextPos: () => Position | null
  ): boolean {
    const nextPos = getNextPos();
    // Next square doesn't exist or is occupied by another piece
    if (
      !nextPos ||
      !(nextPos.toSquare() in board) ||
      board.getPiece(nextPos.toSquare()) !== null
    ) {
      return false;
    }
    const piece = board.getPiece(startingPosition.toSquare());
    if (piece) {
      // The square is occupied by the opponent's piece (can't go past a capture)
      if (color !== piece.color) {
        return false;
      }
    }
    return true;
  }

  static getAllDefendedPositionsInDirection(
    originalPosition: Position,
    board: Board,
    getNextPos: (pos: Position) => Position | null
  ): Position[] {
    const positions: Position[] = [];
    const originalPiece = board.getPiece(originalPosition.toSquare());
    if (!originalPiece) {
      throw new Error('No piece at original position');
    }

    let currentPos = getNextPos(originalPosition);
    while (currentPos !== null) {
      const currentPiece = board.getPiece(currentPos.toSquare());
      positions.push(currentPos);
      if (currentPiece) {
        break;
      }
      currentPos = getNextPos(currentPos);
    }
    return Array.from(new Set(positions));
  }

  static allPositions(): Position[] {
    const positions: Position[] = [];
    for (const column of COLUMN_ARRAY) {
      for (let row = 1; row <= 11; row++) {
        if (Position.validatePosition(column, row)) {
          positions.push(new Position(column, row));
        }
      }
    }
    return positions;
  }

  static areTwoSquaresApartVertically(pos1: Position, pos2: Position): boolean {
    return pos1.col && pos2.col && Math.abs(pos1.row - pos2.row) === 2;
  }

  static validatePosition(column: string, row: number): boolean {
    if (
      column !== 'A' &&
      column !== 'B' &&
      column !== 'C' &&
      column !== 'D' &&
      column !== 'E' &&
      column !== 'F' &&
      column !== 'G' &&
      column !== 'H' &&
      column !== 'I' &&
      column !== 'K' &&
      column !== 'L'
    ) {
      return false;
    }
    if (column === 'A' || column === 'L') {
      return row >= 1 && row <= 6;
    }
    if (column === 'B' || column === 'K') {
      return row >= 1 && row <= 7;
    }
    if (column === 'C' || column === 'I') {
      return row >= 1 && row <= 8;
    }
    if (column === 'D' || column === 'H') {
      return row >= 1 && row <= 9;
    }
    if (column === 'E' || column === 'G') {
      return row >= 1 && row <= 10;
    }
    if (column === 'F') {
      return row >= 1 && row <= 11;
    }
    return false;
  }

  static fromString(pos: string): Position {
    const column = pos[0];
    const row = parseInt(pos.slice(1));
    if (!Position.validatePosition(column, row)) {
      throw new Error(`Invalid position: ${pos}`);
    }
    return new Position(column as Column, row);
  }

  constructor(col: Column, row: number) {
    this.col = col;
    this.row = row;
  }

  toString(): string {
    return `${this.col}${this.row}`;
  }

  toSquare(): Square {
    return this.toString() as Square;
  }

  // ----------------------
  // Column and row helpers
  // ----------------------

  isBeginningOfColumn(): boolean {
    return this.row === 1;
  }

  isEndOfColumn(): boolean {
    switch (this.col) {
      case 'A':
      case 'L':
        return this.row === 6;
      case 'B':
      case 'K':
        return this.row === 7;
      case 'C':
      case 'I':
        return this.row === 8;
      case 'D':
      case 'H':
        return this.row === 9;
      case 'E':
      case 'G':
        return this.row === 10;
      case 'F':
      default:
        return this.row === 11;
    }
  }

  isBeginningOfRow(): boolean {
    switch (this.col) {
      case 'A':
      case 'B':
        return true;
      case 'C':
        return this.row === 1 || this.row === 8;
      case 'D':
        return this.row === 1 || this.row === 9;
      case 'E':
        return this.row === 1 || this.row === 10;
      case 'F':
        return this.row === 1 || this.row === 11;
      default:
        return false;
    }
  }

  isEndOfRow(): boolean {
    switch (this.col) {
      case 'F':
        return this.row === 1 || this.row === 11;
      case 'G':
        return this.row === 1 || this.row === 10;
      case 'H':
        return this.row === 1 || this.row === 9;
      case 'I':
        return this.row === 1 || this.row === 8;
      case 'K':
      case 'L':
        return true;
      default:
        return false;
    }
  }

  // -------------------------------------------------------------------------------------
  // HexChess has 12 directions a piece can move in.
  // Just like in regular chess, forwards, backwards, left and right exist.
  // Just like in regular chess, all 4 diagonals exist (2 diagonals, 2 directions each).
  //
  // Beyond these 4, we have 'skip' diagonals that are unique to hex chess.
  // Because HexChess has a third color, these 'skip' diagonals let you move from one side
  // to the other only touching squares of the same color, akin to how a knight would jump
  // over certain squares.
  // -------------------------------------------------------------------------------------

  getTopPosition(): Position | null {
    if (this.isEndOfColumn()) {
      return null;
    }
    return new Position(this.col, this.row + 1);
  }

  getTopRightPosition(): Position | null {
    switch (this.col) {
      case 'A':
        return new Position('B', this.row + 1);
      case 'B':
        return new Position('C', this.row + 1);
      case 'C':
        return new Position('D', this.row + 1);
      case 'D':
        return new Position('E', this.row + 1);
      case 'E':
        return new Position('F', this.row + 1);
      case 'F':
        return this.row === 11 ? null : new Position('G', this.row);
      case 'G':
        return this.row === 10 ? null : new Position('H', this.row);
      case 'H':
        return this.row === 9 ? null : new Position('I', this.row);
      case 'I':
        return this.row === 8 ? null : new Position('K', this.row);
      case 'K':
        return this.row === 7 ? null : new Position('L', this.row);
      case 'L':
        return null;
    }
  }

  getSkipTopRightPosition(): Position | null {
    // Go one square up and one square top right
    if (this.isEndOfColumn()) {
      return null;
    }
    const topSquare = this.getTopPosition();
    if (!topSquare) {
      return null;
    }
    return topSquare.getTopRightPosition();
  }

  getRightPosition(): Position | null {
    if (this.isEndOfRow()) {
      return null;
    }

    switch (this.col) {
      case 'A':
        return new Position('C', this.row + 1);
      case 'B':
        return new Position('D', this.row + 1);
      case 'C':
        return new Position('E', this.row + 1);
      case 'D':
        return new Position('F', this.row + 1);
      case 'E':
        return new Position('G', this.row);
      case 'F':
        return new Position('H', this.row - 1);
      case 'G':
        return new Position('I', this.row - 1);
      case 'H':
        return new Position('K', this.row - 1);
      case 'I':
        return new Position('L', this.row - 1);
      case 'K':
      case 'L':
        return null;
    }
  }

  getBottomRightPosition(): Position | null {
    switch (this.col) {
      case 'A':
        return new Position('B', this.row);
      case 'B':
        return new Position('C', this.row);
      case 'C':
        return new Position('D', this.row);
      case 'D':
        return new Position('E', this.row);
      case 'E':
        return new Position('F', this.row);
      case 'F': {
        if (this.row === 1) {
          return null;
        }
        return new Position('G', this.row - 1);
      }
      case 'G': {
        if (this.row === 1) {
          return null;
        }
        return new Position('H', this.row - 1);
      }
      case 'H': {
        if (this.row === 1) {
          return null;
        }
        return new Position('I', this.row - 1);
      }
      case 'I': {
        if (this.row === 1) {
          return null;
        }
        return new Position('K', this.row - 1);
      }
      case 'K': {
        if (this.row === 1) {
          return null;
        }
        return new Position('L', this.row - 1);
      }
      case 'L':
        return null;
    }
  }

  getSkipBottomRightPosition(): Position | null {
    const bottomSquare = this.getBottomPosition();
    if (!bottomSquare) {
      return null;
    }
    return bottomSquare.getBottomRightPosition();
  }

  getBottomPosition(): Position | null {
    if (this.isBeginningOfColumn()) {
      return null;
    }
    return new Position(this.col, this.row - 1);
  }

  getBottomLeftPosition(): Position | null {
    switch (this.col) {
      case 'A':
        return null;
      case 'B': {
        if (this.row === 1) {
          return null;
        }
        return new Position('A', this.row - 1);
      }
      case 'C': {
        if (this.row === 1) {
          return null;
        }
        return new Position('B', this.row - 1);
      }
      case 'D': {
        if (this.row === 1) {
          return null;
        }
        return new Position('C', this.row - 1);
      }
      case 'E': {
        if (this.row === 1) {
          return null;
        }
        return new Position('D', this.row - 1);
      }
      case 'F': {
        if (this.row === 1) {
          return null;
        }
        return new Position('E', this.row - 1);
      }
      case 'G': {
        return new Position('F', this.row);
      }
      case 'H': {
        return new Position('G', this.row);
      }
      case 'I': {
        return new Position('H', this.row);
      }
      case 'K': {
        return new Position('I', this.row);
      }
      case 'L': {
        return new Position('K', this.row);
      }
    }
  }

  getSkipBottomLeftPosition(): Position | null {
    const bottomSquare = this.getBottomPosition();
    if (!bottomSquare) {
      return null;
    }
    return bottomSquare.getBottomLeftPosition();
  }

  getLeftPosition(): Position | null {
    if (this.isBeginningOfRow()) {
      return null;
    }
    switch (this.col) {
      case 'C':
        return new Position('A', this.row - 1);
      case 'D':
        return new Position('B', this.row - 1);
      case 'E':
        return new Position('C', this.row - 1);
      case 'F':
        return new Position('D', this.row - 1);
      case 'G':
        return new Position('E', this.row);
      case 'H':
        return new Position('F', this.row + 1);
      case 'I':
        return new Position('G', this.row + 1);
      case 'K':
        return new Position('H', this.row + 1);
      case 'L':
        return new Position('I', this.row + 1);
      case 'A':
      case 'B':
        return null;
    }
  }

  getTopLeftPosition(): Position | null {
    switch (this.col) {
      case 'A':
        return null;
      case 'B': {
        if (this.row === 7) {
          return null;
        }
        return new Position('A', this.row);
      }
      case 'C': {
        if (this.row === 8) {
          return null;
        }
        return new Position('B', this.row);
      }
      case 'D': {
        if (this.row === 9) {
          return null;
        }
        return new Position('C', this.row);
      }
      case 'E': {
        if (this.row === 10) {
          return null;
        }
        return new Position('D', this.row);
      }
      case 'F': {
        if (this.row === 11) {
          return null;
        }
        return new Position('E', this.row);
      }
      case 'G':
        return new Position('F', this.row + 1);
      case 'H':
        return new Position('G', this.row + 1);
      case 'I':
        return new Position('H', this.row + 1);
      case 'K':
        return new Position('I', this.row + 1);
      case 'L':
        return new Position('K', this.row + 1);
    }
  }

  getSkipTopLeftPosition(): Position | null {
    const topSquare = this.getTopPosition();
    if (!topSquare) {
      return null;
    }
    return topSquare.getTopLeftPosition();
  }

  // -------------------------------------------------------------------
  // Get *all* positions until the end of the board in a given direction
  // This is useful for calculating moves for most pieces
  // -------------------------------------------------------------------

  getAllTopPositions(keepGoing: (pos: Position) => boolean): Position[] {
    const positions: Position[] = [];

    let currentPosition = new Position(this.col, this.row);
    while (
      currentPosition.getTopPosition() !== null &&
      keepGoing(currentPosition)
    ) {
      currentPosition = currentPosition.getTopPosition()!;
      positions.push(currentPosition);
    }

    return positions;
  }

  getAllTopRightPositions(keepGoing: (pos: Position) => boolean): Position[] {
    const positions: Position[] = [];

    let currentPosition = new Position(this.col, this.row);
    while (
      currentPosition.getTopRightPosition() !== null &&
      keepGoing(currentPosition)
    ) {
      currentPosition = currentPosition.getTopRightPosition()!;
      positions.push(currentPosition);
    }

    return positions;
  }

  getAllSkipTopRightPositions(
    keepGoing: (pos: Position) => boolean
  ): Position[] {
    const positions: Position[] = [];

    let currentPosition = new Position(this.col, this.row);
    while (
      currentPosition.getSkipTopRightPosition() !== null &&
      keepGoing(currentPosition)
    ) {
      currentPosition = currentPosition.getSkipTopRightPosition()!;
      positions.push(currentPosition);
    }

    return positions;
  }

  getAllRightPositions(keepGoing: (pos: Position) => boolean): Position[] {
    const positions: Position[] = [];

    let currentPosition = new Position(this.col, this.row);
    while (
      currentPosition.getRightPosition() !== null &&
      keepGoing(currentPosition)
    ) {
      currentPosition = currentPosition.getRightPosition()!;
      positions.push(currentPosition);
    }

    return positions;
  }

  getAllBottomRightPositions(
    keepGoing: (pos: Position) => boolean
  ): Position[] {
    const positions: Position[] = [];

    let currentPosition = new Position(this.col, this.row);
    while (
      currentPosition.getBottomRightPosition() !== null &&
      keepGoing(currentPosition)
    ) {
      currentPosition = currentPosition.getBottomRightPosition()!;
      positions.push(currentPosition);
    }

    return positions;
  }

  getAllSkipBottomRightPositions(
    keepGoing: (pos: Position) => boolean
  ): Position[] {
    const positions: Position[] = [];

    let currentPosition = new Position(this.col, this.row);
    while (
      currentPosition.getSkipBottomRightPosition() !== null &&
      keepGoing(currentPosition)
    ) {
      currentPosition = currentPosition.getSkipBottomRightPosition()!;
      positions.push(currentPosition);
    }

    return positions;
  }

  getAllBottomPositions(keepGoing: (pos: Position) => boolean): Position[] {
    const positions: Position[] = [];

    let currentPosition = new Position(this.col, this.row);
    while (
      currentPosition.getBottomPosition() !== null &&
      keepGoing(currentPosition)
    ) {
      currentPosition = currentPosition.getBottomPosition()!;
      positions.push(currentPosition);
    }

    return positions;
  }

  getAllBottomLeftPositions(keepGoing: (pos: Position) => boolean): Position[] {
    const positions: Position[] = [];

    let currentPosition = new Position(this.col, this.row);
    while (
      currentPosition.getBottomLeftPosition() !== null &&
      keepGoing(currentPosition)
    ) {
      currentPosition = currentPosition.getBottomLeftPosition()!;
      positions.push(currentPosition);
    }

    return positions;
  }

  getAllSkipBottomLeftPositions(
    keepGoing: (pos: Position) => boolean
  ): Position[] {
    const positions: Position[] = [];

    let currentPosition = new Position(this.col, this.row);
    while (
      currentPosition.getSkipBottomLeftPosition() !== null &&
      keepGoing(currentPosition)
    ) {
      currentPosition = currentPosition.getSkipBottomLeftPosition()!;
      positions.push(currentPosition);
    }

    return positions;
  }

  getAllLeftPositions(keepGoing: (pos: Position) => boolean): Position[] {
    const positions: Position[] = [];

    let currentPosition = new Position(this.col, this.row);
    while (
      currentPosition.getLeftPosition() !== null &&
      keepGoing(currentPosition)
    ) {
      currentPosition = currentPosition.getLeftPosition()!;
      positions.push(currentPosition);
    }

    return positions;
  }

  getAllTopLeftPositions(keepGoing: (pos: Position) => boolean): Position[] {
    const positions: Position[] = [];

    let currentPosition = new Position(this.col, this.row);

    while (
      currentPosition.getTopLeftPosition() !== null &&
      keepGoing(currentPosition)
    ) {
      currentPosition = currentPosition.getTopLeftPosition()!;
      positions.push(currentPosition);
    }

    return positions;
  }

  getAllSkipTopLeftPositions(
    keepGoing: (pos: Position) => boolean
  ): Position[] {
    const positions: Position[] = [];

    let currentPosition = new Position(this.col, this.row);

    while (
      currentPosition.getSkipTopLeftPosition() !== null &&
      keepGoing(currentPosition)
    ) {
      currentPosition = currentPosition.getSkipTopLeftPosition()!;
      positions.push(currentPosition);
    }

    return positions;
  }
}
