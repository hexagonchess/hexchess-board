import { Board } from './board';
import { Position } from './position';
import { Square } from './utils';

export type Color = 'white' | 'black' | 'grey';
export type LegalMoves = Partial<Record<Square, Set<Square>>>;
export type Move = {
  from: Square;
  to: Square;
  capturedPiece?: Piece;
  enPassant: boolean;
  promotion: Omit<Piece, 'k' | 'K' | 'p' | 'P'> | null;
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

export interface HexchessPiece {
  readonly color: Color;
  readonly position: Position;

  allSquareMoves(board: Board): Position[];
  defendedSquares(board: Board): Position[];
  toString(): Piece;
}

export type Role = 'white' | 'black' | 'spectator' | 'analyzer';
