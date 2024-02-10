import { describe, expect, test } from '@jest/globals';
import { Board } from '../board';
import { Bishop } from '../bishop';
import { Position } from '../position';

describe('Bishops', () => {
  test('Converts bishops to strings', () => {
    const blackBishop = new Bishop('black', new Position('B', 1));
    const whiteBishop = new Bishop('white', new Position('B', 1));

    expect(blackBishop?.toString()).toBe('b');
    expect(whiteBishop?.toString()).toBe('B');
  });

  test('Calculates all available bishop positions on an empty board', () => {
    const board = Board.empty();
    const piece = new Bishop('white', new Position('F', 6));
    board.addPiece(piece);
    expect(piece.allSquareMoves(board).length).toBe(12);
  });

  test('Can get all the defended squares for the starting position', () => {
    const board = Board.new();
    let bishop = board.getPiece('F1');
    expect(bishop?.defendedSquares(board).length).toBe(4);

    bishop = board.getPiece('F2');
    expect(bishop?.defendedSquares(board).length).toBe(10);

    bishop = board.getPiece('F3');
    expect(bishop?.defendedSquares(board).length).toBe(8);
  });

  test('Can get all possible squares for a bishop on the starting configuration board', () => {
    const board = Board.new();

    let bishop = board.getPiece('F1');
    expect(bishop?.allSquareMoves(board).length).toBe(2);

    bishop = board.getPiece('F2');
    expect(bishop?.allSquareMoves(board).length).toBe(8);

    bishop = board.getPiece('F3');
    expect(bishop?.allSquareMoves(board).length).toBe(2);

    bishop = board.getPiece('F11');
    expect(bishop?.allSquareMoves(board).length).toBe(2);

    bishop = board.getPiece('F10');
    expect(bishop?.allSquareMoves(board).length).toBe(8);

    bishop = board.getPiece('F9');
    expect(bishop?.allSquareMoves(board).length).toBe(2);
  });
});
