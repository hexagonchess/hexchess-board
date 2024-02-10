import { describe, expect, test } from '@jest/globals';
import { Board } from '../board';
import { King } from '../king';
import { Position } from '../position';

describe('Kings', () => {
  test('Converts kings to strings', () => {
    const blackKing = new King('black', new Position('B', 1));
    const whiteKing = new King('white', new Position('B', 1));

    expect(blackKing.toString()).toBe('k');
    expect(whiteKing.toString()).toBe('K');
  });

  test('Can get all possible squares for a king on an empty board', () => {
    const board = Board.empty();
    const king = new King('white', new Position('F', 6));
    board.addPiece(king);
    const positions = king.allSquareMoves(board);
    expect(positions.length).toBe(12);
  });

  test('Can get all possible squares for a king on the starting configuration board', () => {
    const board = Board.new();
    let king = board.getPiece('G1')!;
    expect(king.allSquareMoves(board).length).toBe(2);

    king = board.getPiece('G10')!;
    expect(king.allSquareMoves(board).length).toBe(2);
  });

  test('Can get all defended squares for a king', () => {
    const board = Board.new();
    let king = board.getPiece('G1')!;
    expect(king.defendedSquares(board).length).toBe(7);

    king = board.getPiece('G10')!;
    expect(king.defendedSquares(board).length).toBe(7);
  });
});
