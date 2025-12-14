import { describe, expect, test } from '@jest/globals';
import { Board } from '../board';
import { King } from '../king';
import { Position } from '../position';
import type { Move } from '../types';
import {
  boardToFen,
  fenToBoard,
  movesToString,
  stringToMoves,
  validatePosition,
} from '../utils';

describe('Utils', () => {
  test('Converts moves to a CSV string properly', () => {
    const moves: Move[] = [
      { from: 'A1', to: 'A2', enPassant: false, promotion: null },
      { from: 'B2', to: 'B1', enPassant: false, promotion: 'q' },
      { from: 'C2', to: 'C4', enPassant: false, promotion: null },
      {
        from: 'D4',
        to: 'C3',
        capturedPiece: 'P',
        enPassant: true,
        promotion: null,
      },
      {
        from: 'B6',
        to: 'A6',
        capturedPiece: 'r',
        enPassant: false,
        promotion: 'N',
      },
    ];
    const encoded = 'A1-A2,B2-B1=q,C2-C4,D4xC3P$,B6xA6r=N';
    expect(movesToString(moves)).toBe(encoded);
    expect(movesToString(moves, true)).toBe(`${encoded},R`);
  });

  test('Move strings support all termination markers', () => {
    const moves: Move[] = [
      { from: 'A1', to: 'A2', enPassant: false, promotion: null },
    ];
    const base = movesToString(moves);
    expect(movesToString(moves, 'resignation')).toBe(`${base},R`);
    expect(movesToString(moves, 'checkmate')).toBe(`${base},#`);
    expect(movesToString(moves, 'draw')).toBe(`${base},D`);
    expect(movesToString(moves, 'timeout')).toBe(`${base},T`);
  });

  test('Move strings round-trip without losing information', () => {
    const moves: Move[] = [
      { from: 'B1', to: 'B3', enPassant: false, promotion: null },
      { from: 'C7', to: 'C5', enPassant: false, promotion: null },
      { from: 'B3', to: 'B4', enPassant: false, promotion: null },
      {
        from: 'C5',
        to: 'B4',
        capturedPiece: 'P',
        enPassant: false,
        promotion: null,
      },
      { from: 'D3', to: 'D5', enPassant: false, promotion: null },
      { from: 'E7', to: 'E5', enPassant: false, promotion: null },
      {
        from: 'D5',
        to: 'E6',
        capturedPiece: 'p',
        enPassant: true,
        promotion: null,
      },
      { from: 'B4', to: 'B3', enPassant: false, promotion: null },
      {
        from: 'E6',
        to: 'F7',
        capturedPiece: 'p',
        enPassant: false,
        promotion: null,
      },
      { from: 'B3', to: 'B2', enPassant: false, promotion: null },
      {
        from: 'F7',
        to: 'G7',
        capturedPiece: 'p',
        enPassant: false,
        promotion: null,
      },
      { from: 'B2', to: 'B1', enPassant: false, promotion: 'q' },
    ];

    const encoded = movesToString(moves);
    expect(stringToMoves(encoded)).toEqual(moves);
  });

  test('Move strings round-trip when resignation is included', () => {
    const moves: Move[] = [
      { from: 'A1', to: 'A2', enPassant: false, promotion: null },
      {
        from: 'B2',
        to: 'A3',
        capturedPiece: 'n',
        enPassant: false,
        promotion: null,
      },
    ];

    const encoded = movesToString(moves, true);
    expect(encoded.endsWith(',R')).toBe(true);
    expect(stringToMoves(encoded)).toEqual(moves);
  });

  test('Converts a CSV string to moves properly', () => {
    const moveStr =
      'B1-B3,C7-C5,B3-B4,C5xB4P,D3-D5,E7-E5,D5xE6p$,B4-B3,E6xF7p,B3-B2,F7xG7p,B2-B1=q';
    const moves: Move[] = [
      { from: 'B1', to: 'B3', enPassant: false, promotion: null },
      { from: 'C7', to: 'C5', enPassant: false, promotion: null },
      { from: 'B3', to: 'B4', enPassant: false, promotion: null },
      {
        from: 'C5',
        to: 'B4',
        capturedPiece: 'P',
        enPassant: false,
        promotion: null,
      },
      { from: 'D3', to: 'D5', enPassant: false, promotion: null },
      { from: 'E7', to: 'E5', enPassant: false, promotion: null },
      {
        from: 'D5',
        to: 'E6',
        capturedPiece: 'p',
        enPassant: true,
        promotion: null,
      },
      { from: 'B4', to: 'B3', enPassant: false, promotion: null },
      {
        from: 'E6',
        to: 'F7',
        capturedPiece: 'p',
        enPassant: false,
        promotion: null,
      },
      { from: 'B3', to: 'B2', enPassant: false, promotion: null },
      {
        from: 'F7',
        to: 'G7',
        capturedPiece: 'p',
        enPassant: false,
        promotion: null,
      },
      { from: 'B2', to: 'B1', enPassant: false, promotion: 'q' },
    ];
    expect(stringToMoves(moveStr)).toEqual(moves);
  });

  test('stringToMoves handles a resignation marker', () => {
    const base =
      'B1-B3,C7-C5,B3-B4,C5xB4P,D3-D5,E7-E5,D5xE6p$,B4-B3,E6xF7p,B3-B2,F7xG7p,B2-B1=q';
    const expected: Move[] = [
      { from: 'B1', to: 'B3', enPassant: false, promotion: null },
      { from: 'C7', to: 'C5', enPassant: false, promotion: null },
      { from: 'B3', to: 'B4', enPassant: false, promotion: null },
      {
        from: 'C5',
        to: 'B4',
        capturedPiece: 'P',
        enPassant: false,
        promotion: null,
      },
      { from: 'D3', to: 'D5', enPassant: false, promotion: null },
      { from: 'E7', to: 'E5', enPassant: false, promotion: null },
      {
        from: 'D5',
        to: 'E6',
        capturedPiece: 'p',
        enPassant: true,
        promotion: null,
      },
      { from: 'B4', to: 'B3', enPassant: false, promotion: null },
      {
        from: 'E6',
        to: 'F7',
        capturedPiece: 'p',
        enPassant: false,
        promotion: null,
      },
      { from: 'B3', to: 'B2', enPassant: false, promotion: null },
      {
        from: 'F7',
        to: 'G7',
        capturedPiece: 'p',
        enPassant: false,
        promotion: null,
      },
      { from: 'B2', to: 'B1', enPassant: false, promotion: 'q' },
    ];

    expect(stringToMoves(`${base},R`)).toEqual(expected);
    expect(stringToMoves('R')).toEqual([]);
    expect(() => stringToMoves('R,B1-B3')).toThrow(
      'Cannot process resignation marker when subsequent moves still exist.',
    );
  });

  test('stringToMoves handles additional game termination markers', () => {
    const moves: Move[] = [
      { from: 'A1', to: 'A2', enPassant: false, promotion: null },
      { from: 'B2', to: 'B3', enPassant: false, promotion: null },
    ];
    const base = movesToString(moves);
    expect(stringToMoves(`${base},#`)).toEqual(moves);
    expect(stringToMoves(`${base},D`)).toEqual(moves);
    expect(stringToMoves(`${base},T`)).toEqual(moves);

    expect(stringToMoves('#')).toEqual([]);
    expect(stringToMoves('D')).toEqual([]);
    expect(stringToMoves('T')).toEqual([]);

    expect(() => stringToMoves('#,A1-A2')).toThrow(
      'Cannot process checkmate marker when subsequent moves still exist.',
    );
    expect(() => stringToMoves('D,A1-A2')).toThrow(
      'Cannot process draw marker when subsequent moves still exist.',
    );
    expect(() => stringToMoves('T,A1-A2')).toThrow(
      'Cannot process timeout marker when subsequent moves still exist.',
    );
  });

  test('fenToBoard falls back to an empty board for invalid input', () => {
    expect(fenToBoard('invalid').numPieces()).toBe(0);
    expect(fenToBoard(null).numPieces()).toBe(0);

    const startingBoard = fenToBoard('start');
    expect(startingBoard.getPiece('G1')).toBeInstanceOf(King);
  });

  test('boardToFen serializes boards and handles fallback values', () => {
    expect(boardToFen({} as unknown as Board)).toBe('6/7/8/9/10/11/10/9/8/7/6');

    const board = Board.empty();
    board.addPiece(new King('white', new Position('F', 2)));
    const fen = boardToFen(board);
    expect(fen).toContain('K');
  });

  test('stringToMoves rejects invalid formats', () => {
    expect(() => stringToMoves('bad-move')).toThrow('Invalid move: bad-move');
    expect(() => stringToMoves('J1-A2')).toThrow('Invalid move: J1-A2');
    expect(() => stringToMoves('A1-J2')).toThrow('Invalid move: A1-J2');
  });

  test('validatePosition handles special tokens and malformed data', () => {
    expect(validatePosition(42 as unknown)).toBeNull();

    const emptyBoard = validatePosition('');
    expect(emptyBoard?.numPieces()).toBe(0);

    const startBoard = validatePosition('start');
    expect(startBoard?.getPiece('G1')).toBeInstanceOf(King);

    expect(validatePosition('6/7')).toBeNull();
    expect(validatePosition('5/7/8/9/10/11/10/9/8/7/6')).toBeNull();

    const validBoard = validatePosition('6/7/8/9/10/11/10/9/8/7/6');
    expect(validBoard?.numPieces()).toBe(0);
  });
});
