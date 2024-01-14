import {describe, expect, test} from '@jest/globals';
import {Board} from '../board';
import {Pawn} from '../pawn';
import {Position} from '../position';
import {King} from '../king';
import {Rook} from '../rook';
import {Knight} from '../knight';
import {Bishop} from '../bishop';
import {Queen} from '../queen';
import {HexchessPiece} from '../types';
import {Square} from '../utils';

describe('Board', () => {
  test('Properly initialize the game state', () => {
    const board = Board.new();
    expect(board.getPieces('white').length).toBe(18);
    expect(board.getPieces('black').length).toBe(18);
    expect(board.numPieces()).toBe(36);

    board.addPiece(new Pawn('white', new Position('B', 6)));
    expect(board.getPieces('white').length).toBe(19);
    expect(board.numPieces()).toBe(37);

    board.capturePiece(new Position('B', 6), new Position('C', 7));
    expect(board.getPieces('black').length).toBe(17);
    expect(board.numPieces()).toBe(36);
  });

  test('Gets the king properly', () => {
    const board = Board.new();
    expect(board.getKing('white')).toEqual(
      new King('white', new Position('G', 1))
    );
    expect(board.getKing('black')).toEqual(
      new King('black', new Position('G', 10))
    );

    const empty = Board.empty();
    expect(() => empty.getKing('white')).toThrow();
    expect(() => empty.getKing('black')).toThrow();

    const board2 = Board.empty();
    board2.addPiece(new King('white', new Position('G', 1)));
    expect(board2.getKing('white')).toEqual(
      new King('white', new Position('G', 1))
    );
    expect(() => board2.getKing('black')).toThrow();
  });

  test('Can get other pieces', () => {
    const board = Board.new();
    expect(board.getPiece('A1')).toEqual(null);
    expect(board.getPiece('B1')).toEqual(
      new Pawn('white', new Position('B', 1))
    );
  });

  test('Detects if a position has an opposite color piece', () => {
    const board = Board.new();
    expect(board.hasOppositeColorPiece('B1', 'white')).toBe(false);
    expect(board.hasOppositeColorPiece('B1', 'black')).toBe(true);
  });

  test('Cannot capture a king', () => {
    const board = Board.empty();
    board.addPiece(new King('white', new Position('G', 1)));
    board.addPiece(new Rook('black', new Position('G', 10)));

    expect(() =>
      board.capturePiece(new Position('G', 10), new Position('G', 1))
    ).toThrow();
  });

  test('Captures work properly', () => {
    const board = Board.new();

    // Cannot initiate capture from a square without a piece
    expect(() =>
      board.capturePiece(new Position('A', 6), new Position('B', 7))
    ).toThrow();

    // Cannot initiate capture to a square without a piece
    expect(() =>
      board.capturePiece(new Position('F', 5), new Position('G', 5))
    ).toThrow();

    // Cannot do capture from empty square to another empty square
    expect(() =>
      board.capturePiece(new Position('A', 6), new Position('A', 7))
    ).toThrow();

    // Cannot capture same color piece
    expect(() =>
      board.capturePiece(new Position('B', 1), new Position('C', 2))
    ).toThrow();

    // Can capture opposite color piece
    board.addPiece(new Pawn('white', new Position('B', 6)));
    board.capturePiece(new Position('B', 6), new Position('C', 7));

    expect(board.getPiece('C7')).toEqual(
      new Pawn('white', new Position('C', 7))
    );
  });

  test('Promotes a pawn properly', () => {
    const board = Board.empty();

    // Cannot promote a pawn if a square is empty
    expect(() => board.promotePawn('A6', 'B')).toThrow();

    // Cannot promote a pawn if the square is not occupied by a pawn
    board.addPiece(new Knight('white', new Position('A', 6)));
    expect(() => board.promotePawn('A6', 'B')).toThrow();

    // Can only promote a pawn if they've reached the "end" for their color
    board.addPiece(new Pawn('black', new Position('B', 7)));
    expect(() => board.promotePawn('B7', 'B')).toThrow();
    board.addPiece(new Pawn('white', new Position('B', 1)));
    expect(() => board.promotePawn('B1', 'B')).toThrow();

    // Can promote to a knight
    board.addPiece(new Pawn('white', new Position('C', 8)));
    board.promotePawn('C8', 'N');
    expect(board.getPiece('C8')).toEqual(
      new Knight('white', new Position('C', 8))
    );

    board.addPiece(new Pawn('black', new Position('C', 1)));
    board.promotePawn('C1', 'n');
    expect(board.getPiece('C1')).toEqual(
      new Knight('black', new Position('C', 1))
    );

    // Can promote to a bishop
    board.addPiece(new Pawn('white', new Position('D', 9)));
    board.promotePawn('D9', 'B');
    expect(board.getPiece('D9')).toEqual(
      new Bishop('white', new Position('D', 9))
    );

    board.addPiece(new Pawn('black', new Position('D', 1)));
    board.promotePawn('D1', 'b');
    expect(board.getPiece('D1')).toEqual(
      new Bishop('black', new Position('D', 1))
    );

    // Can promote to a rook
    board.addPiece(new Pawn('white', new Position('E', 10)));
    board.promotePawn('E10', 'R');
    expect(board.getPiece('E10')).toEqual(
      new Rook('white', new Position('E', 10))
    );

    board.addPiece(new Pawn('black', new Position('E', 1)));
    board.promotePawn('E1', 'r');
    expect(board.getPiece('E1')).toEqual(
      new Rook('black', new Position('E', 1))
    );

    // Can promote to a queen
    board.addPiece(new Pawn('white', new Position('F', 11)));
    board.promotePawn('F11', 'Q');
    expect(board.getPiece('F11')).toEqual(
      new Bishop('white', new Position('F', 11))
    );

    board.addPiece(new Pawn('black', new Position('F', 1)));
    board.promotePawn('F1', 'q');
    expect(board.getPiece('F1')).toEqual(
      new Bishop('black', new Position('F', 1))
    );
  });

  test('Allows legal moves and bans illegal moves', () => {
    const board = Board.new();

    // Legal and illegal pawn moves
    board.movePiece(new Position('B', 1), new Position('B', 3));
    let pawn = board.getPiece('B3');
    expect(pawn?.color).toBe('white');
    expect(pawn?.position).toEqual(new Position('B', 3));
    expect(pawn instanceof Pawn).toBe(true);

    board.movePiece(new Position('B', 7), new Position('B', 5));
    pawn = board.getPiece('B5');
    expect(pawn?.color).toBe('black');
    expect(pawn?.position).toEqual(new Position('B', 5));
    expect(pawn instanceof Pawn).toBe(true);

    board.movePiece(new Position('B', 3), new Position('B', 4));
    expect(() =>
      board.movePiece(new Position('B', 5), new Position('B', 4))
    ).toThrow();

    // Legal and illegal bishop moves
    board.movePiece(new Position('F', 2), new Position('E', 3));
    expect(board.getPiece('E3')).toEqual(
      new Bishop('white', new Position('E', 3))
    );
    expect(() =>
      board.movePiece(new Position('F', 3), new Position('E', 4))
    ).toThrow();

    // Legal and illegal knight moves
    board.movePiece(new Position('D', 1), new Position('C', 3));
    expect(board.getPiece('C3')).toEqual(
      new Knight('white', new Position('C', 3))
    );
    expect(() =>
      board.movePiece(new Position('C', 3), new Position('E', 4))
    ).toThrow();

    // Legal and illegal rook moves
    board.movePiece(new Position('C', 8), new Position('D', 8));
    expect(board.getPiece('D8')).toEqual(
      new Rook('black', new Position('D', 8))
    );
    expect(() =>
      board.movePiece(new Position('D', 8), new Position('D', 6))
    ).toThrow();

    // Legal and illegal king moves
    board.movePiece(new Position('G', 1), new Position('G', 2));
    expect(board.getPiece('G2')).toEqual(
      new King('white', new Position('G', 2))
    );
    expect(() =>
      board.movePiece(new Position('G', 2), new Position('H', 1))
    ).toThrow();

    // Legal and illegal queen moves
    board.movePiece(new Position('E', 1), new Position('E', 2));
    expect(board.getPiece('E2')).toEqual(
      new Queen('white', new Position('E', 2))
    );
    expect(() =>
      board.movePiece(new Position('E', 2), new Position('E', 4))
    ).toThrow();
  });

  test('Sets didMoveTwoSquares properly when moving pawns', () => {
    const board = Board.new();

    // Moving a white pawn two squares forward sets didMoveTwoSquares to true
    board.movePiece(new Position('B', 1), new Position('B', 3));
    expect(board.getPiece('B3')).toEqual(
      new Pawn('white', new Position('B', 3), true)
    );

    // Moving a white pawn only one square sets didMoveTwoSquares to false
    board.movePiece(new Position('B', 3), new Position('B', 4));
    expect(board.getPiece('B4')).toEqual(
      new Pawn('white', new Position('B', 4), false)
    );

    // Moving a black pawn two squares forward sets didMoveTwoSquares to true
    board.movePiece(new Position('B', 7), new Position('B', 5));
    expect(board.getPiece('B5')).toEqual(
      new Pawn('black', new Position('B', 5), true)
    );

    // Moving a black pawn only one square sets didMoveTwoSquares to false
    board.movePiece(new Position('C', 7), new Position('C', 6));
    expect(board.getPiece('C6')).toEqual(
      new Pawn('black', new Position('C', 6), false)
    );

    // Throws an exception if moving a piece that doesn't exist
    expect(() =>
      board.movePiece(new Position('A', 1), new Position('A', 2))
    ).toThrow();

    // Cannot move a piece on top of another piece
    expect(() =>
      board.movePiece(new Position('F', 5), new Position('F', 7))
    ).toThrow();
    board.movePiece(new Position('F', 5), new Position('F', 6));
    expect(() =>
      board.movePiece(new Position('F', 6), new Position('F', 7))
    ).toThrow();
  });

  test('Adds pieces from strings correctly', () => {
    const board = Board.empty();
    board.addPieceFromString('G1', 'K');
    const king = board.getKing('white');
    expect(king).toEqual(new King('white', new Position('G', 1)));

    board.addPieceFromString('G10', 'k');
    const king2 = board.getKing('black');
    expect(king2).toEqual(new King('black', new Position('G', 10)));

    board.addPieceFromString('A1', 'P');
    const pawn = board.getPiece('A1');
    expect(pawn).toEqual(new Pawn('white', new Position('A', 1)));

    board.addPieceFromString('A6', 'p');
    const pawn2 = board.getPiece('A6');
    expect(pawn2).toEqual(new Pawn('black', new Position('A', 6)));

    board.addPieceFromString('B1', 'N');
    const knight = board.getPiece('B1');
    expect(knight).toEqual(new Knight('white', new Position('B', 1)));

    board.addPieceFromString('B6', 'n');
    const knight2 = board.getPiece('B6');
    expect(knight2).toEqual(new Knight('black', new Position('B', 6)));

    board.addPieceFromString('C1', 'B');
    const bishop = board.getPiece('C1');
    expect(bishop).toEqual(new Bishop('white', new Position('C', 1)));

    board.addPieceFromString('C6', 'b');
    const bishop2 = board.getPiece('C6');
    expect(bishop2).toEqual(new Bishop('black', new Position('C', 6)));

    board.addPieceFromString('D1', 'R');
    const rook = board.getPiece('D1');
    expect(rook).toEqual(new Rook('white', new Position('D', 1)));

    board.addPieceFromString('D6', 'r');
    const rook2 = board.getPiece('D6');
    expect(rook2).toEqual(new Rook('black', new Position('D', 6)));

    board.addPieceFromString('E1', 'Q');
    const queen = board.getPiece('E1');
    expect(queen).toEqual(new Queen('white', new Position('E', 1)));

    board.addPieceFromString('E6', 'q');
    const queen2 = board.getPiece('E6');
    expect(queen2).toEqual(new Queen('black', new Position('E', 6)));

    board.addPieceFromString('E6', null);
    expect(board.getPiece('E6')).toEqual(null);
  });

  test('Can clone a game properly', () => {
    const board = Board.new();
    const clone = Board.clone(board);
    expect(clone).not.toBe(board);
    for (const [square, piece] of Object.entries(board.pieces)) {
      const p = piece as HexchessPiece | null;
      const s = square as Square;
      if (p === null) {
        expect(clone.pieces[s]).toBe(null);
      } else {
        expect(p.toString()).toEqual(clone.pieces[s]?.toString());
      }
    }
  });

  test('Performs en passant correctly', () => {
    const board = Board.empty();
    const whitePawn = new Pawn('white', new Position('B', 1));
    const blackPawn = new Pawn('black', new Position('C', 3));
    board.addPiece(whitePawn);
    board.addPiece(blackPawn);

    board.movePiece(new Position('B', 1), new Position('B', 3));
    board.enPassant(new Position('C', 3), new Position('B', 2));

    expect(board.getPiece('B3')).toBeNull();
    expect(board.getPiece('C3')).toBeNull();
    expect(board.getPiece('B1')).toBeNull();
    expect(board.getPiece('B2')).toEqual(
      new Pawn('black', new Position('B', 2))
    );
  });
});
