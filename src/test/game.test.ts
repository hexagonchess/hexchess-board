import { describe, expect, test } from '@jest/globals';
import { Bishop } from '../bishop';
import { Board } from '../board';
import { Game, GameState } from '../game';
import { King } from '../king';
import { Knight } from '../knight';
import { Pawn } from '../pawn';
import { Position } from '../position';
import { Queen } from '../queen';
import { Rook } from '../rook';
import type { HexchessPiece, Move, Piece } from '../types';
import * as BoardUtils from './board-utils';

const createMinimalBoard = (): Board => {
  const board = Board.empty();
  board.addPiece(new King('white', new Position('F', 11)));
  board.addPiece(new King('black', new Position('F', 1)));
  return board;
};

describe('Game', () => {
  test('Calculates all legal moves correctly', () => {
    const game = new Game();
    const moves = game.allLegalMoves();
    const numberOfMoves = Object.values(moves).reduce(
      (acc, set) => acc + set.size,
      0,
    );
    expect(numberOfMoves).toBe(51);
  });

  test('Detects stalemate when no moves are available', () => {
    // Should not be stalemate on a new board for either side
    let game = new Game();
    expect(game.isStalemate()).toBe(false);

    // Stalemate when no moves are available
    game = new Game(BoardUtils.whiteNoMoveStalemate());
    expect(game.isStalemate()).toBe(true);
  });

  test('Pawn movement squares do not count towards checked squares', () => {
    const board = Board.empty();
    board.addPiece(new King('white', new Position('F', 1)));
    board.addPiece(new King('black', new Position('E', 2)));
    board.addPiece(new Pawn('black', new Position('G', 2)));
    const game = new Game(board);

    expect(game.isStalemate()).toBe(false);
  });

  test('Detects stalemate when there is insufficient material', () => {
    const justKings = BoardUtils.insufficientMaterialStalemate();
    const game = new Game(justKings);
    expect(game.isStalemate()).toBe(true);

    // ChatGPT is wrong - king and bishop are not stalemate
    const kingAndBishop = Board.empty();
    kingAndBishop.addPiece(new King('white', new Position('F', 11)));
    kingAndBishop.addPiece(new King('black', new Position('F', 9)));
    kingAndBishop.addPiece(new Bishop('black', new Position('E', 9)));
    const game2 = new Game(kingAndBishop);
    expect(game2.isStalemate()).toBe(false);

    const kingAndBishopEach = Board.empty();
    kingAndBishopEach.addPiece(new King('white', new Position('F', 11)));
    kingAndBishopEach.addPiece(new King('black', new Position('F', 9)));
    kingAndBishopEach.addPiece(new Bishop('black', new Position('F', 10)));
    kingAndBishopEach.addPiece(new Bishop('white', new Position('F', 8)));
    const game3 = new Game(kingAndBishopEach);
    expect(game3.isStalemate()).toBe(false);

    const notStalemate = Board.empty();
    notStalemate.addPiece(new King('white', new Position('F', 11)));
    notStalemate.addPiece(new King('black', new Position('F', 9)));
    notStalemate.addPiece(new Bishop('black', new Position('F', 10)));
    notStalemate.addPiece(new Bishop('white', new Position('F', 8)));
    notStalemate.addPiece(new Pawn('black', new Position('F', 7)));
    const game4 = new Game(notStalemate);
    expect(game4.isStalemate()).toBe(false);
  });

  test('Handles promoting a pawn to cause checkmate', () => {
    const game = new Game(BoardUtils.whiteCheckmateOrStalematePromotion());
    expect(game.state()).toBe(GameState.IN_PROGRESS);
    game.movePiece(new Position('A', 5), new Position('A', 6));
    expect(game.state()).toBe(GameState.PROMOTING);
    game.promotePawn('Q');
    expect(game.isInCheck()).toBe(true);
    expect(game.isStalemate()).toBe(false);
    expect(game.isCheckmate()).toBe(true);
  });

  test('Handles promoting a pawn to cause stalemate', () => {
    const game = new Game(BoardUtils.whiteCheckmateOrStalematePromotion());
    expect(game.state()).toBe(GameState.IN_PROGRESS);
    game.movePiece(new Position('A', 5), new Position('A', 6));
    expect(game.state()).toBe(GameState.PROMOTING);
    game.promotePawn('N');
    expect(game.isInCheck()).toBe(false);
    expect(game.isStalemate()).toBe(true);
    expect(game.isCheckmate()).toBe(false);
  });

  test('Prevents moving pinned pieces', () => {
    const cannotMoveGame = new Game(BoardUtils.pinnedPiece());
    expect(() =>
      cannotMoveGame.movePiece(new Position('F', 10), new Position('D', 9)),
    ).toThrow();

    const kingCanMoveGame = new Game(BoardUtils.pinnedPiece());
    expect(() =>
      kingCanMoveGame.movePiece(new Position('F', 11), new Position('E', 10)),
    ).not.toThrow();

    const moveAlongPinGame = new Game(BoardUtils.pinnedPiece());
    expect(() =>
      moveAlongPinGame.movePiece(new Position('F', 10), new Position('F', 9)),
    ).not.toThrow();
  });
  test('Detects when someone is checkmated', () => {
    // Should not be checkmated on a new board for either side
    expect(new Game().isCheckmate()).toBe(false);

    // King and queen checkmate
    expect(
      new Game(BoardUtils.blackKingAndQueenCheckmate()).isCheckmate(),
    ).toBe(true);

    // King and rook checkmate
    expect(new Game(BoardUtils.blackKingAndRookCheckmate()).isCheckmate()).toBe(
      true,
    );

    // King and knight checkmate
    expect(
      new Game(BoardUtils.blackKingAndKnightCheckmate()).isCheckmate(),
    ).toBe(true);

    //  King and bishop checkmate
    expect(
      new Game(BoardUtils.blackKingAndBishopCheckmate()).isCheckmate(),
    ).toBe(true);
  });

  test('Handles promoting a pawn to cause check', () => {
    const game = new Game(BoardUtils.whiteCheckPromotion());
    expect(game.state()).toBe(GameState.IN_PROGRESS);
    game.movePiece(new Position('F', 10), new Position('F', 11));
    expect(game.state()).toBe(GameState.PROMOTING);
    game.promotePawn('Q');
    expect(game.isInCheck()).toBe(true);
    expect(game.isStalemate()).toBe(false);
    expect(game.isCheckmate()).toBe(false);
  });

  test('Properly detects moving a piece to cause stalemate', () => {
    const board = Board.empty();
    board.addPiece(new King('white', new Position('F', 11)));
    board.addPiece(new King('black', new Position('A', 5)));
    board.addPiece(new Queen('black', new Position('F', 10)));
    const game = new Game(board);

    expect(game.isStalemate()).toBe(false);
    game.movePiece(new Position('F', 11), new Position('F', 10));
    expect(game.isStalemate()).toBe(true);
  });

  test('Properly detects moving a piece to cause check', () => {
    const board = Board.empty();
    board.addPiece(new Rook('white', new Position('F', 11)));
    board.addPiece(new King('white', new Position('F', 1)));
    board.addPiece(new King('black', new Position('G', 7)));
    const game = new Game(board);

    expect(game.isInCheck()).toBe(false);
    expect(game.state()).toBe(GameState.IN_PROGRESS);
    game.movePiece(new Position('F', 11), new Position('F', 7));

    expect(game.isInCheck()).toBe(true);
    expect(game.state()).toBe(GameState.IN_PROGRESS);
  });

  test('Properly detects moving a piece to cause checkmate', () => {
    const board = Board.empty();
    board.addPiece(new King('white', new Position('F', 9)));
    board.addPiece(new King('black', new Position('F', 11)));
    board.addPiece(new Queen('white', new Position('A', 5)));
    const game = new Game(board);

    expect(game.isCheckmate()).toBe(false);
    game.movePiece(new Position('A', 5), new Position('F', 10));
    expect(game.isCheckmate()).toBe(true);
  });

  test('Can properly move pieces', () => {
    // Cannot move pieces if the game is not in progress
    let game = new Game(BoardUtils.blackKingAndQueenCheckmate());
    expect(game.isCheckmate()).toBe(true);
    expect(() =>
      game.movePiece(new Position('F', 11), new Position('F', 10)),
    ).toThrow();

    // Cannot move if it's not your turn
    game = new Game();
    expect(() =>
      game.movePiece(new Position('F', 11), new Position('F', 10)),
    ).toThrow();

    // Cannot move an empty square
    expect(() =>
      game.movePiece(new Position('A', 1), new Position('A', 2)),
    ).toThrow();

    // Cannot make an illegal move
    expect(() =>
      game.movePiece(new Position('B', 1), new Position('B', 4)),
    ).toThrow();

    // Cannot move on top of another piece
    expect(() =>
      game.movePiece(new Position('F', 5), new Position('F', 7)),
    ).toThrow();

    // Legal moves are allowed and properly update the board
    expect(() =>
      game.movePiece(new Position('B', 1), new Position('B', 2)),
    ).not.toThrow();
    // White cannot move twice in a row
    expect(() =>
      game.movePiece(new Position('B', 2), new Position('B', 3)),
    ).toThrow();

    // Black is now allowed to move
    expect(() =>
      game.movePiece(new Position('B', 7), new Position('B', 6)),
    ).not.toThrow();

    // Disallow capturing your own piece
    expect(() =>
      game.movePiece(new Position('K', 1), new Position('I', 2)),
    ).toThrow();
  });

  test('Can properly fast forward and rewind', () => {
    const game = new Game();
    game.movePiece(new Position('B', 1), new Position('B', 2));

    game.rewind({ from: 'B1', to: 'B2', enPassant: false, promotion: null });
    expect(game.board.getPiece(new Position('B', 2).toSquare())).toBe(null);

    game.fastForward({
      from: 'B1',
      to: 'B2',
      enPassant: false,
      promotion: null,
    });
    expect(game.board.getPiece(new Position('B', 2).toSquare())).not.toBe(null);

    game.movePiece(new Position('E', 7), new Position('E', 5));
    game.movePiece(new Position('F', 5), new Position('E', 5));
    expect(game.board.getPiece(new Position('F', 5).toSquare())).toBe(null);

    game.rewind({
      from: 'F5',
      to: 'E5',
      capturedPiece: 'p',
      enPassant: false,
      promotion: null,
    });
    expect(game.board.getPiece(new Position('F', 5).toSquare())).not.toBe(null);
    expect(game.board.getPiece(new Position('E', 7).toSquare())).toBe(null);

    game.rewind({ from: 'E7', to: 'E5', enPassant: false, promotion: null });
    expect(game.board.getPiece(new Position('E', 5).toSquare())).toBe(null);
    expect(game.board.getPiece(new Position('E', 7).toSquare())).not.toBe(null);

    game.fastForward({
      from: 'E7',
      to: 'E5',
      enPassant: false,
      promotion: null,
    });
    expect(game.board.getPiece(new Position('E', 5).toSquare())).not.toBe(null);

    game.fastForward({
      from: 'F5',
      to: 'E5',
      capturedPiece: 'p',
      enPassant: false,
      promotion: null,
    });
    expect(game.board.getPiece(new Position('F', 5).toSquare())).toBe(null);
  });

  test('fastForward adds promoted pieces for every promotion type', () => {
    const promotions: Array<{
      promotion: NonNullable<Move['promotion']>;
      ctor: new (...args: never[]) => HexchessPiece;
      color: 'white' | 'black';
    }> = [
      { promotion: 'Q', ctor: Queen, color: 'white' },
      { promotion: 'q', ctor: Queen, color: 'black' },
      { promotion: 'R', ctor: Rook, color: 'white' },
      { promotion: 'r', ctor: Rook, color: 'black' },
      { promotion: 'B', ctor: Bishop, color: 'white' },
      { promotion: 'b', ctor: Bishop, color: 'black' },
      { promotion: 'N', ctor: Knight, color: 'white' },
      { promotion: 'n', ctor: Knight, color: 'black' },
    ];

    for (const { promotion, ctor, color } of promotions) {
      const board = createMinimalBoard();
      const fromPosition =
        color === 'white' ? new Position('C', 3) : new Position('C', 6);
      const toPosition =
        color === 'white' ? new Position('C', 4) : new Position('C', 5);
      board.addPiece(new Queen(color, fromPosition));
      const game = new Game(board);

      const move: Move = {
        from: fromPosition.toSquare(),
        to: toPosition.toSquare(),
        enPassant: false,
        promotion,
      };

      game.fastForward(move);
      const promotedPiece = game.board.getPiece(toPosition.toSquare());
      expect(promotedPiece).toBeInstanceOf(ctor);
      expect(promotedPiece?.color).toBe(color);
    }
  });

  test('rewind reinstates promoted pawns for both colors', () => {
    const promotions: Array<{
      promotion: NonNullable<Move['promotion']>;
      expectedColor: 'white' | 'black';
    }> = [
      { promotion: 'Q', expectedColor: 'white' },
      { promotion: 'q', expectedColor: 'black' },
    ];

    for (const { promotion, expectedColor } of promotions) {
      const board = createMinimalBoard();
      const fromPosition = new Position('C', 3);
      const toPosition = new Position('C', 4);
      board.addPiece(new Queen(expectedColor, toPosition));
      const game = new Game(board);

      const move: Move = {
        from: fromPosition.toSquare(),
        to: toPosition.toSquare(),
        enPassant: false,
        promotion,
      };

      game.rewind(move);
      const pawn = game.board.getPiece(fromPosition.toSquare());
      expect(pawn).toBeInstanceOf(Pawn);
      expect(pawn?.color).toBe(expectedColor);
      expect(game.board.getPiece(toPosition.toSquare())).toBe(null);
    }
  });

  test('rewind restores every captured piece type', () => {
    const capturedCases: Array<{
      capturedPiece: Piece;
      enPassant: boolean;
      expectedSquare: string;
      expectedColor: 'white' | 'black';
      ctor: new (...args: never[]) => HexchessPiece;
    }> = [
      {
        capturedPiece: 'p',
        enPassant: true,
        expectedSquare: 'C5',
        expectedColor: 'black',
        ctor: Pawn,
      },
      {
        capturedPiece: 'p',
        enPassant: false,
        expectedSquare: 'C4',
        expectedColor: 'black',
        ctor: Pawn,
      },
      {
        capturedPiece: 'P',
        enPassant: true,
        expectedSquare: 'C5',
        expectedColor: 'white',
        ctor: Pawn,
      },
      {
        capturedPiece: 'P',
        enPassant: false,
        expectedSquare: 'C4',
        expectedColor: 'white',
        ctor: Pawn,
      },
      {
        capturedPiece: 'k',
        enPassant: false,
        expectedSquare: 'C4',
        expectedColor: 'black',
        ctor: King,
      },
      {
        capturedPiece: 'K',
        enPassant: false,
        expectedSquare: 'C4',
        expectedColor: 'white',
        ctor: King,
      },
      {
        capturedPiece: 'q',
        enPassant: false,
        expectedSquare: 'C4',
        expectedColor: 'black',
        ctor: Queen,
      },
      {
        capturedPiece: 'Q',
        enPassant: false,
        expectedSquare: 'C4',
        expectedColor: 'white',
        ctor: Queen,
      },
      {
        capturedPiece: 'r',
        enPassant: false,
        expectedSquare: 'C4',
        expectedColor: 'black',
        ctor: Rook,
      },
      {
        capturedPiece: 'R',
        enPassant: false,
        expectedSquare: 'C4',
        expectedColor: 'white',
        ctor: Rook,
      },
      {
        capturedPiece: 'b',
        enPassant: false,
        expectedSquare: 'C4',
        expectedColor: 'black',
        ctor: Bishop,
      },
      {
        capturedPiece: 'B',
        enPassant: false,
        expectedSquare: 'C4',
        expectedColor: 'white',
        ctor: Bishop,
      },
      {
        capturedPiece: 'n',
        enPassant: false,
        expectedSquare: 'C4',
        expectedColor: 'black',
        ctor: Knight,
      },
      {
        capturedPiece: 'N',
        enPassant: false,
        expectedSquare: 'C4',
        expectedColor: 'white',
        ctor: Knight,
      },
    ];

    for (const scenario of capturedCases) {
      const board = createMinimalBoard();
      const fromPosition = new Position('C', 3);
      const toPosition = new Position('C', 4);
      board.addPiece(new Queen('white', toPosition));
      const game = new Game(board);

      const move: Move = {
        from: fromPosition.toSquare(),
        to: toPosition.toSquare(),
        enPassant: scenario.enPassant,
        promotion: null,
        capturedPiece: scenario.capturedPiece,
      };

      game.rewind(move);
      const restoredSquare = Position.fromString(
        scenario.expectedSquare,
      ).toSquare();
      const restoredPiece = game.board.getPiece(restoredSquare);
      expect(restoredPiece).toBeInstanceOf(scenario.ctor);
      expect(restoredPiece?.color).toBe(scenario.expectedColor);
    }
  });

  test('Can only en passant for one turn after the pawn moves', () => {
    const game = new Game();
    game.movePiece(new Position('D', 3), new Position('D', 5));
    game.movePiece(new Position('E', 7), new Position('E', 5));

    let whitePawn = game.board.getPiece('D5');
    expect(whitePawn).toBeInstanceOf(Pawn);
    expect((whitePawn as Pawn).didMoveTwoSquares).toBe(false);

    let blackPawn = game.board.getPiece('E5');
    expect(blackPawn).toBeInstanceOf(Pawn);
    expect((blackPawn as Pawn).didMoveTwoSquares).toBe(true);

    game.movePiece(new Position('B', 1), new Position('B', 2));
    blackPawn = game.board.getPiece('E5');
    expect((blackPawn as Pawn).didMoveTwoSquares).toBe(false);

    whitePawn = game.board.getPiece('D5');
    const allMoves = whitePawn?.allSquareMoves(game.board);
    expect(allMoves?.find((move) => move.toSquare() === 'E6')).toBe(undefined);
  });
});
