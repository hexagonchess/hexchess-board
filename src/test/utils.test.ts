import {describe, expect, test} from '@jest/globals';
import {Move} from '../types';
import {movesToString} from '../utils';

describe('Utils', () => {
  test('Converts moves to a CSV string properly', () => {
    const moves: Move[] = [
      {from: 'A1', to: 'A2', enPassant: false, promotion: null},
      {from: 'B2', to: 'B1', enPassant: false, promotion: 'q'},
      {from: 'C2', to: 'C4', enPassant: false, promotion: null},
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
    expect(movesToString(moves)).toBe('A1-A2,B2-B1=q,C2-C4,D4xC3$,B6xA6=N');
  });
});
