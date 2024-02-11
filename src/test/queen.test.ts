import { describe, expect, test } from '@jest/globals';
import { Board } from '../board';
import { Position } from '../position';
import { Queen } from '../queen';

describe('Queens', () => {
  test('Converts queens to strings', () => {
    const blackQueen = new Queen('black', new Position('B', 1));
    const whiteQueen = new Queen('white', new Position('B', 1));

    expect(blackQueen.toString()).toBe('q');
    expect(whiteQueen.toString()).toBe('Q');
  });

  test('Calculates all available queen positions on an empty board', () => {
    const board = Board.empty();
    const piece = new Queen('white', new Position('F', 6));
    board.addPiece(piece);
    expect(piece.allSquareMoves(board).length).toBe(42);
  });

  test('Gets all possible moves on the starting board', () => {
    const board = Board.new();
    const piece = board.getPiece('E1');
    const moves = piece?.allSquareMoves(board);
    expect(moves?.length).toBe(6);

    const piece2 = board.getPiece('E10');
    const moves2 = piece2?.allSquareMoves(board);
    expect(moves2?.length).toBe(6);
  });

  test('Gets all defended squares correctly', () => {
    const board = Board.new();
    const piece = board.getPiece('E1');
    expect(piece?.defendedSquares(board).length).toBe(12);

    const piece2 = board.getPiece('E10');
    expect(piece2?.defendedSquares(board).length).toBe(12);
  });
});
