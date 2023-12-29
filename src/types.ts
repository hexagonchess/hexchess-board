import {Square} from './utils';

export type Board = Record<Square, Piece | null>;
export type Color = 'white' | 'black' | 'grey';
export type Move = {
  from: Square;
  to: Square;
  capturedPiece?: Piece;
};
export type Orientation = 'white' | 'black';
export type TileColor = 'white' | 'black' | 'grey';
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
