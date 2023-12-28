export type Orientation = 'white' | 'black';

export type Board = Record<Square, Piece | null>;
export type EmptyBoard = {};

export type Color = 'white' | 'black' | 'grey';

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
  {x: number; y: number; colors: Color[]}
>;

export type Piece =
  | 'k'
  | 'q'
  | 'b'
  | 'n'
  | 'r'
  | 'p'
  | 'K'
  | 'Q'
  | 'B'
  | 'N'
  | 'R'
  | 'P';

export const PIECE_VALUES: Record<Piece, number> = {
  k: 1_000,
  q: 9,
  b: 3,
  n: 3,
  r: 5,
  p: 1,
  K: 1_000,
  Q: 9,
  B: 3,
  N: 3,
  R: 5,
  P: 1,
};

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

export const PIECE_SIZES: Record<Piece, [number, number]> = {
  k: [33.29, 33.63],
  q: [38.5, 35.19],
  b: [33, 33.32],
  n: [32.03, 32.5],
  r: [27, 30],
  p: [23, 30.5],
  K: [33.29, 33.63],
  Q: [38.5, 35.19],
  B: [33, 33.32],
  N: [32.03, 32.5],
  R: [27, 30],
  P: [23, 30.5],
};

export type TileColor = 'white' | 'black' | 'grey';

export const emptyBoard: Board = {
  A1: null,
  A2: null,
  A3: null,
  A4: null,
  A5: null,
  A6: null,
  B1: null,
  B2: null,
  B3: null,
  B4: null,
  B5: null,
  B6: null,
  B7: null,
  C1: null,
  C2: null,
  C3: null,
  C4: null,
  C5: null,
  C6: null,
  C7: null,
  C8: null,
  D1: null,
  D2: null,
  D3: null,
  D4: null,
  D5: null,
  D6: null,
  D7: null,
  D8: null,
  D9: null,
  E1: null,
  E2: null,
  E3: null,
  E4: null,
  E5: null,
  E6: null,
  E7: null,
  E8: null,
  E9: null,
  E10: null,
  F1: null,
  F2: null,
  F3: null,
  F4: null,
  F5: null,
  F6: null,
  F7: null,
  F8: null,
  F9: null,
  F10: null,
  F11: null,
  G1: null,
  G2: null,
  G3: null,
  G4: null,
  G5: null,
  G6: null,
  G7: null,
  G8: null,
  G9: null,
  G10: null,
  H1: null,
  H2: null,
  H3: null,
  H4: null,
  H5: null,
  H6: null,
  H7: null,
  H8: null,
  H9: null,
  I1: null,
  I2: null,
  I3: null,
  I4: null,
  I5: null,
  I6: null,
  I7: null,
  I8: null,
  K1: null,
  K2: null,
  K3: null,
  K4: null,
  K5: null,
  K6: null,
  K7: null,
  L1: null,
  L2: null,
  L3: null,
  L4: null,
  L5: null,
  L6: null,
};

export const startBoard: Board = {
  A1: null,
  A2: null,
  A3: null,
  A4: null,
  A5: null,
  A6: null,
  B1: 'P',
  B2: null,
  B3: null,
  B4: null,
  B5: null,
  B6: null,
  B7: 'p',
  C1: 'R',
  C2: 'P',
  C3: null,
  C4: null,
  C5: null,
  C6: null,
  C7: 'p',
  C8: 'r',
  D1: 'N',
  D2: null,
  D3: 'P',
  D4: null,
  D5: null,
  D6: null,
  D7: 'p',
  D8: null,
  D9: 'n',
  E1: 'Q',
  E2: null,
  E3: null,
  E4: 'P',
  E5: null,
  E6: null,
  E7: 'p',
  E8: null,
  E9: null,
  E10: 'q',
  F1: 'B',
  F2: 'B',
  F3: 'B',
  F4: null,
  F5: 'P',
  F6: null,
  F7: 'p',
  F8: null,
  F9: 'b',
  F10: 'b',
  F11: 'b',
  G1: 'K',
  G2: null,
  G3: null,
  G4: 'P',
  G5: null,
  G6: null,
  G7: 'p',
  G8: null,
  G9: null,
  G10: 'k',
  H1: 'N',
  H2: null,
  H3: 'P',
  H4: null,
  H5: null,
  H6: null,
  H7: 'p',
  H8: null,
  H9: 'n',
  I1: 'R',
  I2: 'P',
  I3: null,
  I4: null,
  I5: null,
  I6: null,
  I7: 'p',
  I8: 'r',
  K1: 'P',
  K2: null,
  K3: null,
  K4: null,
  K5: null,
  K6: null,
  K7: 'p',
  L1: null,
  L2: null,
  L3: null,
  L4: null,
  L5: null,
  L6: null,
};

export const fenToBoard = (position: string | null): Board => {
  const converted = validatePosition(position);
  if (converted === null) {
    return deepCopy(emptyBoard);
  }
  return converted;
};

export const stringToMoves = (movesStr: string): Square[][] => {
  if (movesStr === '') {
    return [];
  }

  const moves = movesStr.split(',');
  const result: Square[][] = [];
  for (const move of moves) {
    const individualMoves = move.split('-');
    // Check invalid format
    if (individualMoves.length !== 2) {
      return [];
    }
    const from = individualMoves[0];
    const to = individualMoves[1];

    // Check invalid squares
    if (
      !ALL_SQUARES.includes(from as Square) ||
      !ALL_SQUARES.includes(to as Square)
    ) {
      return [];
    }

    result.push([from as Square, to as Square]);
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
      const piece = board[square];
      if (piece === null) {
        fenParts.push('1');
      } else {
        fenParts.push(piece);
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
    return deepCopy(emptyBoard);
  }
  if (position === 'start') {
    return deepCopy(startBoard);
  }

  // Hexches has 11 columns
  const columns = position.split('/');
  if (columns.length !== 11) {
    return null;
  }

  const partialBoard: Partial<Board> = {};
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
      partialBoard[square] =
        convertedColumn[j] === '1' ? null : (convertedColumn[j] as Piece);
    }
  }

  return partialBoard as Board;
};

const deepCopy = <T>(thing: T): T => {
  return JSON.parse(JSON.stringify(thing));
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
