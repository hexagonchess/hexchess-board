import { Board } from "../board";
import { Pawn } from "../pawn";
import { Position } from "../position";
import { describe, expect, test } from "@jest/globals";

describe("Pawns", () => {
  test("Black pawns can only be promoted on the first rank", () => {
    Position.allPositions().forEach((pos) => {
      const pawn = new Pawn("black", pos);
      expect(pawn.canBePromoted()).toBe(pos.isBeginningOfColumn());
    });
  });

  test("White pawns can only be promoted on the last rank", () => {
    Position.allPositions().forEach((pos) => {
      const pawn = new Pawn("white", pos);
      expect(pawn.canBePromoted()).toBe(pos.isEndOfColumn());
    });
  });

  test("Calculates movement square properly", () => {
    const board = Board.new();
    const pawn = new Pawn("white", new Position("B", 1));
    const moves = pawn.allSquareMoves(board);
    expect(moves.length).toBe(2);
    expect(moves[0].toString()).toBe("B2");
    expect(moves[1].toString()).toBe("B3");

    const pawn2 = new Pawn("black", new Position("B", 7));
    const moves2 = pawn2.allSquareMoves(board);
    expect(moves2.length).toBe(2);
    expect(moves2[0].toString()).toBe("B6");
    expect(moves2[1].toString()).toBe("B5");

    const pawn3 = new Pawn("white", new Position("F", 5));
    const moves3 = pawn3.allSquareMoves(board);
    expect(moves3.length).toBe(1);
    expect(moves3[0].toString()).toBe("F6");
  });

  test("Handles movement edge cases", () => {
    const board = Board.empty();
    const edgePawn = new Pawn("white", new Position("A", 5));
    board.addPiece(edgePawn);

    const moves = edgePawn.allSquareMoves(board);
    expect(moves.length).toBe(1);
    expect(moves[0].toString()).toBe("A6");

    const edgePawn2 = new Pawn("white", new Position("L", 1));
    board.addPiece(edgePawn2);
    const moves2 = edgePawn2.allSquareMoves(board);
    expect(moves2.length).toBe(1);
    expect(moves2[0].toString()).toBe("L2");

    const edgePawn3 = new Pawn("white", new Position("L", 6));
    board.addPiece(edgePawn3);
    const moves3 = edgePawn3.allSquareMoves(board);
    expect(moves3.length).toBe(0);
  });

  test("Calculates capture square properly", () => {
    const board = Board.empty();
    const whitePawn1 = new Pawn("white", new Position("A", 1));
    const whitePawn2 = new Pawn("white", new Position("C", 2));
    const blackPawn = new Pawn("black", new Position("B", 2));
    board.addPiece(whitePawn1);
    board.addPiece(whitePawn2);
    board.addPiece(blackPawn);

    const possibleSquares = blackPawn.allSquareMoves(board);
    expect(possibleSquares.find((pos) => pos.toString() === "A1")).toBeTruthy();
    expect(possibleSquares.find((pos) => pos.toString() === "C2")).toBeTruthy();
    expect(possibleSquares.find((pos) => pos.toString() === "B1")).toBeTruthy();
    expect(possibleSquares.length).toBe(3);

    const blackPawn2 = new Pawn("black", new Position("A", 6));
    const blackPawn3 = new Pawn("black", new Position("C", 7));
    const whitePawn3 = new Pawn("white", new Position("B", 6));
    board.addPiece(blackPawn2);
    board.addPiece(blackPawn3);
    board.addPiece(whitePawn3);
    const possibleSquares2 = whitePawn3.allSquareMoves(board);

    expect(
      possibleSquares2.find((pos) => pos.toString() === "A6"),
    ).toBeTruthy();
    expect(
      possibleSquares2.find((pos) => pos.toString() === "C7"),
    ).toBeTruthy();
    expect(
      possibleSquares2.find((pos) => pos.toString() === "B7"),
    ).toBeTruthy();
    expect(possibleSquares2.length).toBe(3);
  });

  test("Calculates white en passant properly", () => {
    const board = Board.empty();
    const whitePawn = new Pawn("white", new Position("B", 5));
    const blackPawn = new Pawn("black", new Position("C", 7));
    board.addPiece(whitePawn);
    board.addPiece(blackPawn);

    let allSquares = whitePawn.allSquareMoves(board);
    expect(allSquares.length).toBe(1);
    expect(allSquares[0].toString()).toBe("B6");

    board.movePiece(new Position("C", 7), new Position("C", 5));
    allSquares = whitePawn.allSquareMoves(board);
    expect(allSquares.length).toBe(2);
    expect(allSquares[0].toString()).toBe("B6");
    expect(allSquares[1].toString()).toBe("C6");
  });

  test("Calculates black en passant properly", () => {
    const board = Board.empty();
    const whitePawn = new Pawn("white", new Position("B", 1));
    const blackPawn = new Pawn("black", new Position("C", 3));
    board.addPiece(whitePawn);
    board.addPiece(blackPawn);

    let allSquares = blackPawn.allSquareMoves(board);
    expect(allSquares.length).toBe(1);
    expect(allSquares[0].toString()).toBe("C2");

    board.movePiece(new Position("B", 1), new Position("B", 3));
    allSquares = blackPawn.allSquareMoves(board);
    expect(allSquares.length).toBe(2);
    expect(allSquares[0].toString()).toBe("C2");
    expect(allSquares[1].toString()).toBe("B2");
  });

  test("Calculates defended squares properly", () => {
    const whitePawn = new Pawn("white", new Position("B", 1));
    const blackPawn = new Pawn("black", new Position("B", 7));
    const board = Board.new();

    const whiteDefendedSquares = whitePawn.defendedSquares(board);
    const blackDefendedSquares = blackPawn.defendedSquares(board);

    expect(whiteDefendedSquares.length).toBe(2);
    expect(whiteDefendedSquares[0].toString()).toBe("A1");
    expect(whiteDefendedSquares[1].toString()).toBe("C2");

    expect(blackDefendedSquares.length).toBe(2);
    expect(blackDefendedSquares[0].toString()).toBe("A6");
    expect(blackDefendedSquares[1].toString()).toBe("C7");
  });

  test("Converts to strings properly", () => {
    const pawn = new Pawn("white", new Position("B", 1));
    expect(pawn.toString()).toBe("P");

    const pawn2 = new Pawn("black", new Position("B", 7));
    expect(pawn2.toString()).toBe("p");
  });
});
