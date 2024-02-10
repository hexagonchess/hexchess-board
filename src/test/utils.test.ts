import { describe, expect, test } from '@jest/globals';
import { Move } from '../types';
import { movesToString, stringToMoves } from '../utils';

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
    expect(movesToString(moves)).toBe('A1-A2,B2-B1=q,C2-C4,D4xC3P$,B6xA6r=N');
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
});
