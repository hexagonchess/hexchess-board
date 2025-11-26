import { Bishop } from '../bishop';
import { Board } from '../board';
import { King } from '../king';
import { Knight } from '../knight';
import { Pawn } from '../pawn';
import { Queen } from '../queen';
import { Rook } from '../rook';
import { Position } from './../position';
import { HexchessPiece } from './../types';

export function insufficientMaterialStalemate(): Board {
  const board = Board.empty();
  board.addPiece(new King('white', new Position('F', 1)));
  board.addPiece(new King('black', new Position('F', 3)));
  return board;
}

export function whiteNoMoveStalemate(): Board {
  const board = Board.empty();
  board.addPiece(new King('white', new Position('F', 1)));
  board.addPiece(new King('black', new Position('F', 3)));
  board.addPiece(new Pawn('black', new Position('D', 8)));
  return board;
}

export function blackNoMoveStalemate(): Board {
  const board = Board.empty();
  board.addPiece(new King('white', new Position('F', 1)));
  board.addPiece(new King('black', new Position('F', 3)));
  board.addPiece(new Pawn('white', new Position('D', 8)));
  return board;
}

export function whiteCheckmateOrStalematePromotion(): Board {
  const board = Board.empty();
  board.addPiece(new King('black', new Position('A', 1)));
  board.addPiece(new King('white', new Position('C', 3)));
  board.addPiece(new Pawn('white', new Position('A', 5)));
  return board;
}

export function blackCheckmateOrStalematePromotion(): Board {
  const board = Board.empty();
  board.addPiece(new King('white', new Position('A', 2)));
  board.addPiece(new King('black', new Position('C', 6)));
  board.addPiece(new Pawn('black', new Position('A', 6)));
  return board;
}

export function whiteCheckPromotion(): Board {
  const board = Board.empty();
  board.addPiece(new King('black', new Position('F', 1)));
  board.addPiece(new King('white', new Position('A', 1)));
  board.addPiece(new Pawn('white', new Position('F', 10)));
  return board;
}

export function blackKingAndQueenCheckmate(): Board {
  const board = Board.empty();
  board.addPiece(new King('white', new Position('F', 11)));
  board.addPiece(new Queen('black', new Position('F', 10)));
  board.addPiece(new King('black', new Position('F', 9)));
  return board;
}

export function blackKingAndRookCheckmate(): Board {
  const board = Board.empty();
  board.addPiece(new King('white', new Position('F', 11)));
  board.addPiece(new Rook('black', new Position('F', 10)));
  board.addPiece(new King('black', new Position('E', 9)));
  return board;
}

export function blackKingAndKnightCheckmate(): Board {
  const board = Board.empty();
  board.addPiece(new King('white', new Position('F', 11)));
  board.addPiece(new Knight('black', new Position('G', 8)));
  board.addPiece(new King('black', new Position('F', 9)));
  return board;
}

export function blackKingAndBishopCheckmate(): Board {
  const board = Board.empty();
  board.addPiece(new King('white', new Position('F', 11)));
  board.addPiece(new Bishop('black', new Position('E', 9)));
  board.addPiece(new King('black', new Position('F', 9)));
  return board;
}

export function pinnedPiece(): Board {
  const board = Board.empty();
  board.addPiece(new King('white', new Position('F', 11)));
  board.addPiece(new Queen('white', new Position('F', 10)));
  board.addPiece(new Rook('black', new Position('F', 1)));
  board.addPiece(new King('black', new Position('A', 1)));
  return board;
}

export function genericCapturePiece(
  createPiece: (position: Position) => HexchessPiece,
): Board {
  const board = Board.empty();
  board.addPiece(new King('white', new Position('F', 11)));
  board.addPiece(createPiece(new Position('F', 10)));
  board.addPiece(new King('black', new Position('A', 1)));
  return board;
}
