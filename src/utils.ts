import { Board } from './board';
import type { Color, Move, Piece } from './types';

export const RESIGNATION_MARKER = 'R';

export const COLUMN_ARRAY = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'K',
  'L',
] as const;
export type ColumnArray = typeof COLUMN_ARRAY;
export type Column = ColumnArray[number];

export type ColumnConfig = Record<
  Column,
  { x: number; y: number; colors: Color[] }
>;

export const ALL_SQUARES = [
  'A1',
  'A2',
  'A3',
  'A4',
  'A5',
  'A6',
  'B1',
  'B2',
  'B3',
  'B4',
  'B5',
  'B6',
  'B7',
  'C1',
  'C2',
  'C3',
  'C4',
  'C5',
  'C6',
  'C7',
  'C8',
  'D1',
  'D2',
  'D3',
  'D4',
  'D5',
  'D6',
  'D7',
  'D8',
  'D9',
  'E1',
  'E2',
  'E3',
  'E4',
  'E5',
  'E6',
  'E7',
  'E8',
  'E9',
  'E10',
  'F1',
  'F2',
  'F3',
  'F4',
  'F5',
  'F6',
  'F7',
  'F8',
  'F9',
  'F10',
  'F11',
  'G1',
  'G2',
  'G3',
  'G4',
  'G5',
  'G6',
  'G7',
  'G8',
  'G9',
  'G10',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'H7',
  'H8',
  'H9',
  'I1',
  'I2',
  'I3',
  'I4',
  'I5',
  'I6',
  'I7',
  'I8',
  'K1',
  'K2',
  'K3',
  'K4',
  'K5',
  'K6',
  'K7',
  'L1',
  'L2',
  'L3',
  'L4',
  'L5',
  'L6',
] as const;
export type AllSquares = typeof ALL_SQUARES;
export type Square = AllSquares[number];
export const WHITE_COLUMN_LABEL_SQUARES: Square[] = [
  'A1',
  'B1',
  'C1',
  'D1',
  'E1',
  'F1',
  'G1',
  'H1',
  'I1',
  'K1',
  'L1',
];
export const BLACK_COLUMN_LABEL_SQUARES: Square[] = [
  'A6',
  'B7',
  'C8',
  'D9',
  'E10',
  'F11',
  'G10',
  'H9',
  'I8',
  'K7',
  'L6',
];
export const ANNOTATED_WHITE_SQUARES: Square[] = [
  'A1',
  'A2',
  'A3',
  'A4',
  'A5',
  'A6',
  'B7',
  'C8',
  'D9',
  'E10',
  'F11',
  'G10',
  'H9',
  'I8',
  'K7',
  'L6',
];
export const ANNOTATED_BLACK_SQUARES: Square[] = [
  'A6',
  'B7',
  'C8',
  'D9',
  'E10',
  'F11',
  'G10',
  'H9',
  'I8',
  'K7',
  'L6',
  'L5',
  'L4',
  'L3',
  'L2',
  'L1',
];

export const fenToBoard = (position: string | null): Board => {
  const converted = validatePosition(position);
  if (converted === null) {
    return Board.empty();
  }
  return converted;
};

export const movesToString = (moves: Move[], resigned = false): string => {
  const result: string[] = [];
  for (const move of moves) {
    let newString = move.capturedPiece
      ? `${move.from}x${move.to}${move.capturedPiece}`
      : `${move.from}-${move.to}`;
    if (move.promotion) {
      newString += `=${move.promotion.toString()}`;
    }
    if (move.enPassant) {
      newString += '$';
    }
    result.push(newString);
  }
  if (resigned) {
    result.push(RESIGNATION_MARKER);
  }
  return result.join(',');
};

const moveRegex =
  /^[A-L^J](10|11|[1-9])(-|x)[A-L^J](10|11|[1-9])([pPnNqQrRbB])?\$?(=[QqRrBbNn])?$/;
export const stringToMoves = (movesStr: string): Move[] => {
  if (movesStr === '') {
    return [];
  }

  const moves = movesStr.split(',');
  const result: Move[] = [];
  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    if (move === RESIGNATION_MARKER) {
      if (i !== moves.length - 1) {
        throw new Error('Cannot process resignation when subsequent moves still exist.');
      }
      break;
    }
    if (!moveRegex.test(move)) {
      throw new Error(`Invalid move: ${move}`);
    }

    const newMove: Partial<Move> = {};
    const isCapture = move.includes('x');
    const chunks = isCapture ? move.split('x') : move.split('-');
    const from = chunks[0];
    if (!ALL_SQUARES.includes(from as Square)) {
      throw new Error(`Invalid move: ${move}`);
    }
    newMove.from = from as Square;

    const isEnpassant = chunks[1].includes('$');
    const isPromotion = chunks[1].includes('=');
    let promotionPiece: Piece | null = null;
    let toSquare: Square;
    if (isPromotion) {
      promotionPiece = chunks[1].split('=')[1] as Piece;
      toSquare = chunks[1].split('=')[0] as Square;
    } else if (isEnpassant) {
      toSquare = chunks[1].split('$')[0] as Square;
    } else {
      toSquare = chunks[1] as Square;
    }
    if (isCapture) {
      toSquare = toSquare.slice(0, -1) as Square;
    }

    if (!ALL_SQUARES.includes(toSquare as Square)) {
      throw new Error(`Invalid move: ${move}`);
    }

    if (isCapture) {
      const capturedPiece = chunks[1].split('$')[0].split('=')[0].slice(-1);
      newMove.capturedPiece = capturedPiece as Piece;
    }

    newMove.to = toSquare as Square;
    newMove.enPassant = isEnpassant;
    newMove.promotion = promotionPiece as Piece | null;

    result.push(newMove as Move);
  }

  return result;
};

export const boardToFen = (board: Board): string => {
  if (Object.keys(board).length === 0) {
    return '6/7/8/9/10/11/10/9/8/7/6';
  }

  const fenParts: string[] = [];
  for (const column of COLUMN_ARRAY) {
    const rows = numberOfRows(column);
    for (const row of [...Array(rows).keys()].map((i) => i + 1)) {
      const square = `${column}${row + 1}` as Square;
      const piece = board.getPiece(square);
      if (piece === null) {
        fenParts.push('1');
      } else {
        fenParts.push(piece.toString());
      }
    }
    fenParts.push('/');
  }

  return fenParts.join('');
};

export const validatePosition = (position: unknown): Board | null => {
  if (typeof position !== 'string') {
    return null;
  }
  if (position === '') {
    return Board.empty();
  }
  if (position === 'start') {
    return Board.new();
  }

  // Hexches has 11 columns
  const columns = position.split('/');
  if (columns.length !== 11) {
    return null;
  }

  const partialBoard = Board.empty();
  for (let i = 0; i < 11; i++) {
    const column = columns[i];
    // Convert all other numbers to ones
    const convertedColumn = replaceNumbers(column);

    if (convertedColumn.search(/[^kqrnbpKQRNBP1]/) !== -1) {
      return null;
    }

    const name = columnNameFromIndex(i);
    if ((name === 'A' || name === 'L') && convertedColumn.length !== 6) {
      return null;
    }
    if ((name === 'B' || name === 'K') && convertedColumn.length !== 7) {
      return null;
    }
    if ((name === 'C' || name === 'I') && convertedColumn.length !== 8) {
      return null;
    }
    if ((name === 'D' || name === 'H') && convertedColumn.length !== 9) {
      return null;
    }
    if ((name === 'E' || name === 'G') && convertedColumn.length !== 10) {
      return null;
    }
    if (name === 'F' && convertedColumn.length !== 11) {
      return null;
    }
    for (let j = 0; j < convertedColumn.length; j++) {
      const square = `${name}${j + 1}` as Square;
      partialBoard.addPieceFromString(
        square,
        convertedColumn[j] === '1' ? null : (convertedColumn[j] as Piece),
      );
    }
  }

  return partialBoard as Board;
};

const columnNameFromIndex = (index: number): string => {
  switch (index) {
    case 0:
      return 'A';
    case 1:
      return 'B';
    case 2:
      return 'C';
    case 3:
      return 'D';
    case 4:
      return 'E';
    case 5:
      return 'F';
    case 6:
      return 'G';
    case 7:
      return 'H';
    case 8:
      return 'I';
    case 9:
      return 'K';
    default:
      return 'L';
  }
};

const replaceNumbers = (string: string): string => {
  return string
    .replaceAll('11', '11111111111')
    .replaceAll('10', '1111111111')
    .replaceAll('9', '111111111')
    .replaceAll('8', '11111111')
    .replaceAll('7', '1111111')
    .replaceAll('6', '111111')
    .replaceAll('5', '11111')
    .replaceAll('4', '1111')
    .replaceAll('3', '111')
    .replaceAll('2', '11');
};

const numberOfRows = (column: Column): number => {
  switch (column) {
    case 'A':
    case 'L':
      return 6;
    case 'B':
    case 'K':
      return 7;
    case 'C':
    case 'I':
      return 8;
    case 'D':
    case 'H':
      return 9;
    case 'E':
    case 'G':
      return 10;
    case 'F':
      return 11;
  }
};
