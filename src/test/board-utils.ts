import { HexchessPiece } from "./../types";
import { Bishop } from "../bishop";
import { Board } from "../board";
import { King } from "../king";
import { Knight } from "../knight";
import { Pawn } from "../pawn";
import { Rook } from "../rook";
import { Queen } from "../queen";
import { Position } from "./../position";

export class BoardUtils {
  static insufficientMaterialStalemate(): Board {
    const board = Board.empty();
    board.addPiece(new King("white", new Position("F", 1)));
    board.addPiece(new King("black", new Position("F", 3)));
    return board;
  }

  static whiteNoMoveStalemate(): Board {
    const board = Board.empty();
    board.addPiece(new King("white", new Position("F", 1)));
    board.addPiece(new King("black", new Position("F", 3)));
    board.addPiece(new Pawn("black", new Position("D", 8)));
    return board;
  }

  static blackNoMoveStalemate(): Board {
    const board = Board.empty();
    board.addPiece(new King("white", new Position("F", 1)));
    board.addPiece(new King("black", new Position("F", 3)));
    board.addPiece(new Pawn("white", new Position("D", 8)));
    return board;
  }

  static whiteCheckmateOrStalematePromotion(): Board {
    const board = Board.empty();
    board.addPiece(new King("black", new Position("A", 1)));
    board.addPiece(new King("white", new Position("C", 3)));
    board.addPiece(new Pawn("white", new Position("A", 5)));
    return board;
  }

  static blackCheckmateOrStalematePromotion(): Board {
    const board = Board.empty();
    board.addPiece(new King("white", new Position("A", 2)));
    board.addPiece(new King("black", new Position("C", 6)));
    board.addPiece(new Pawn("black", new Position("A", 6)));
    return board;
  }

  static whiteCheckPromotion(): Board {
    const board = Board.empty();
    board.addPiece(new King("black", new Position("F", 1)));
    board.addPiece(new King("white", new Position("A", 1)));
    board.addPiece(new Pawn("white", new Position("F", 10)));
    return board;
  }

  static blackKingAndQueenCheckmate(): Board {
    const board = Board.empty();
    board.addPiece(new King("white", new Position("F", 11)));
    board.addPiece(new Queen("black", new Position("F", 10)));
    board.addPiece(new King("black", new Position("F", 9)));
    return board;
  }

  static blackKingAndRookCheckmate(): Board {
    const board = Board.empty();
    board.addPiece(new King("white", new Position("F", 11)));
    board.addPiece(new Rook("black", new Position("F", 10)));
    board.addPiece(new King("black", new Position("E", 9)));
    return board;
  }

  static blackKingAndKnightCheckmate(): Board {
    const board = Board.empty();
    board.addPiece(new King("white", new Position("F", 11)));
    board.addPiece(new Knight("black", new Position("G", 8)));
    board.addPiece(new King("black", new Position("F", 9)));
    return board;
  }

  static blackKingAndBishopCheckmate(): Board {
    const board = Board.empty();
    board.addPiece(new King("white", new Position("F", 11)));
    board.addPiece(new Bishop("black", new Position("E", 9)));
    board.addPiece(new King("black", new Position("F", 9)));
    return board;
  }

  static pinnedPiece(): Board {
    const board = Board.empty();
    board.addPiece(new King("white", new Position("F", 11)));
    board.addPiece(new Bishop("white", new Position("F", 10)));
    board.addPiece(new Rook("black", new Position("F", 1)));
    board.addPiece(new King("black", new Position("A", 1)));
    return board;
  }

  static genericCapturePiece(
    createPiece: (position: Position) => HexchessPiece,
  ): Board {
    const board = Board.empty();
    board.addPiece(new King("white", new Position("F", 11)));
    board.addPiece(createPiece(new Position("F", 10)));
    board.addPiece(new King("black", new Position("A", 1)));
    return board;
  }
}
