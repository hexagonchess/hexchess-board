import { describe, expect, test } from '@jest/globals';
import { assert } from '@open-wc/testing';
import { Board } from '../board';
import { Position } from '../position';
import { Rook } from '../rook';

describe('Rooks', () => {
  test('Converts rooks to strings', () => {
    const blackRook = new Rook('black', new Position('B', 1));
    const whiteRook = new Rook('white', new Position('B', 1));

    expect(blackRook.toString()).toBe('r');
    expect(whiteRook.toString()).toBe('R');
  });

  test('Calculates all available rook positions on an empty board', () => {
    const board = Board.empty();
    const piece = new Rook('white', new Position('F', 6));
    board.addPiece(piece);
    expect(piece.allSquareMoves(board).length).toBe(30);
  });

  test('Can get all squares for a rook on the starting board configuration', () => {
    const board = Board.new();

    // Left white rook
    let piece = board.getPiece('C1');
    assert(piece !== null);
    board.addPiece(piece);
    expect(piece?.allSquareMoves(board).length).toBe(3);

    // Right white rook
    piece = board.getPiece('I1');
    assert(piece !== null);
    board.addPiece(piece);
    expect(piece?.allSquareMoves(board).length).toBe(3);

    // Left black rook
    piece = board.getPiece('C8');
    assert(piece !== null);
    board.addPiece(piece);
    expect(piece?.allSquareMoves(board).length).toBe(3);

    // Right black rook
    piece = board.getPiece('I8');
    assert(piece !== null);
    board.addPiece(piece);
    expect(piece?.allSquareMoves(board).length).toBe(3);
  });

  test('Can get the defended squares of a rook correctly', () => {
    const board = Board.new();
    const piece = board.getPiece('C1');
    expect(piece?.defendedSquares(board).length).toBe(7);

    const board2 = Board.empty();
    const piece2 = new Rook('white', new Position('G', 5));
    const piece3 = new Rook('black', new Position('G', 7));
    board2.addPiece(piece2);
    board2.addPiece(piece3);
    expect(piece2.defendedSquares(board2).length).toBe(25);
    expect(piece2.defendedSquares(board2)).toContainEqual(new Position('G', 7));
  });
});
