import {describe, expect, test} from '@jest/globals';
import {Board} from '../board';
import {Knight} from '../knight';
import {Position} from '../position';

describe('Knights', () => {
  test('Converts knights to strings', () => {
    const blackKnight = new Knight('black', new Position('B', 1));
    const whiteKnight = new Knight('white', new Position('B', 1));

    expect(blackKnight.toString()).toBe('n');
    expect(whiteKnight.toString()).toBe('N');
  });

  test('Can get all possible squares for a knight on an empty board', () => {
    const board = Board.empty();
    const knight = new Knight('white', new Position('F', 6));
    board.addPiece(knight);
    const positions = knight.allSquareMoves(board);

    expect(positions.length).toBe(12);
    expect(positions).toContainEqual(new Position('C', 4));
    expect(positions).toContainEqual(new Position('C', 5));
    expect(positions).toContainEqual(new Position('D', 3));
    expect(positions).toContainEqual(new Position('D', 7));
    expect(positions).toContainEqual(new Position('E', 3));
    expect(positions).toContainEqual(new Position('E', 8));
    expect(positions).toContainEqual(new Position('G', 3));
    expect(positions).toContainEqual(new Position('G', 8));
    expect(positions).toContainEqual(new Position('H', 3));
    expect(positions).toContainEqual(new Position('H', 7));
    expect(positions).toContainEqual(new Position('I', 4));
    expect(positions).toContainEqual(new Position('I', 5));
  });

  test('Can get all possible squares for a knight on the starting configuration board', () => {
    const board = Board.new();
    let knight = board.getPiece('D1')!;
    expect(knight.allSquareMoves(board).length).toBe(4);

    knight = board.getPiece('D9')!;
    expect(knight.allSquareMoves(board).length).toBe(4);

    knight = board.getPiece('H1')!;
    expect(knight.allSquareMoves(board).length).toBe(4);

    knight = board.getPiece('H9')!;
    expect(knight.allSquareMoves(board).length).toBe(4);
  });

  test('Can get all defended squares for a knight', () => {
    const board = Board.new();
    let knight = board.getPiece('D1')!;
    expect(knight.defendedSquares(board).length).toBe(6);

    knight = board.getPiece('D9')!;
    expect(knight.defendedSquares(board).length).toBe(6);
  });
});
