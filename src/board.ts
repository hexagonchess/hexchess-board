import { Bishop } from './bishop';
import { King } from './king';
import { Knight } from './knight';
import { Pawn } from './pawn';
import { Position } from './position';
import { Queen } from './queen';
import { Rook } from './rook';
import { Color, HexchessPiece, Piece } from './types';
import { Square } from './utils';

export class Board {
  readonly pieces: Record<Square, HexchessPiece | null>;

  static clone(board: Board): Board {
    const clone = Board.empty();
    for (const piece of Object.values(board.pieces)) {
      if (piece === null) {
        continue;
      }
      if (piece instanceof Pawn) {
        clone.addPiece(
          new Pawn(piece.color, piece.position, piece.didMoveTwoSquares),
        );
      } else if (piece instanceof King) {
        clone.addPiece(new King(piece.color, piece.position));
      } else if (piece instanceof Queen) {
        clone.addPiece(new Queen(piece.color, piece.position));
      } else if (piece instanceof Rook) {
        clone.addPiece(new Rook(piece.color, piece.position));
      } else if (piece instanceof Bishop) {
        clone.addPiece(new Bishop(piece.color, piece.position));
      } else if (piece instanceof Knight) {
        clone.addPiece(new Knight(piece.color, piece.position));
      } else {
        throw new Error('Invalid piece type');
      }
    }
    return clone;
  }

  static empty(): Board {
    const positions = Object.fromEntries(
      Position.allPositions().map((pos) => [pos.toSquare(), null]),
    ) as Record<Square, HexchessPiece | null>;
    return new Board(positions);
  }

  static new(): Board {
    const positions = Object.fromEntries(
      Position.allPositions().map((pos) => [pos.toSquare(), null]),
    ) as Record<Square, HexchessPiece | null>;
    positions.B1 = new Pawn('white', new Position('B', 1));
    positions.B7 = new Pawn('black', new Position('B', 7));

    positions.C1 = new Rook('white', new Position('C', 1));
    positions.C2 = new Pawn('white', new Position('C', 2));
    positions.C7 = new Pawn('black', new Position('C', 7));
    positions.C8 = new Rook('black', new Position('C', 8));

    positions.D1 = new Knight('white', new Position('D', 1));
    positions.D3 = new Pawn('white', new Position('D', 3));
    positions.D7 = new Pawn('black', new Position('D', 7));
    positions.D9 = new Knight('black', new Position('D', 9));

    positions.E1 = new Queen('white', new Position('E', 1));
    positions.E4 = new Pawn('white', new Position('E', 4));
    positions.E7 = new Pawn('black', new Position('E', 7));
    positions.E10 = new Queen('black', new Position('E', 10));

    positions.F1 = new Bishop('white', new Position('F', 1));
    positions.F2 = new Bishop('white', new Position('F', 2));
    positions.F3 = new Bishop('white', new Position('F', 3));
    positions.F5 = new Pawn('white', new Position('F', 5));
    positions.F7 = new Pawn('black', new Position('F', 7));
    positions.F9 = new Bishop('black', new Position('F', 9));
    positions.F10 = new Bishop('black', new Position('F', 10));
    positions.F11 = new Bishop('black', new Position('F', 11));

    positions.G1 = new King('white', new Position('G', 1));
    positions.G4 = new Pawn('white', new Position('G', 4));
    positions.G7 = new Pawn('black', new Position('G', 7));
    positions.G10 = new King('black', new Position('G', 10));

    positions.H1 = new Knight('white', new Position('H', 1));
    positions.H3 = new Pawn('white', new Position('H', 3));
    positions.H7 = new Pawn('black', new Position('H', 7));
    positions.H9 = new Knight('black', new Position('H', 9));

    positions.I1 = new Rook('white', new Position('I', 1));
    positions.I2 = new Pawn('white', new Position('I', 2));
    positions.I7 = new Pawn('black', new Position('I', 7));
    positions.I8 = new Rook('black', new Position('I', 8));

    positions.K1 = new Pawn('white', new Position('K', 1));
    positions.K7 = new Pawn('black', new Position('K', 7));

    return new Board(positions);
  }

  constructor(pieces: Record<Square, HexchessPiece | null>) {
    this.pieces = pieces;
  }

  private _canMoveTo(from: Position, to: Position): boolean {
    const piece = this.pieces[from.toSquare()];
    if (piece === null) {
      return false;
    }
    if (!(to.toSquare() in this.pieces)) {
      return false;
    }
    if (this.pieces[to.toSquare()] !== null) {
      return false;
    }
    return piece
      .allSquareMoves(this)
      .some((pos) => pos.col === to.col && pos.row === to.row);
  }

  private _resetPawnsDidMoveTwoSquares() {
    for (const [square, piece] of Object.entries(this.pieces)) {
      if (piece === null || !(piece instanceof Pawn)) {
        return;
      }

      this.pieces[square as Square] = new Pawn(
        piece.color,
        piece.position,
        false,
      );
    };
  }

  getKing(color: Omit<Color, 'grey'>): King {
    for (const piece of Object.values(this.pieces)) {
      if (piece instanceof King && piece.color === color) {
        return piece;
      }
    }
    throw new Error(`No ${color} king found`);
  }

  numPieces(): number {
    const squares = Object.keys(this.pieces) as Square[];
    return squares.filter((s: Square) => this.getPiece(s) !== null).length;
  }

  getPieces(color: Omit<Color, 'grey'>): HexchessPiece[] {
    return Object.values(this.pieces).filter(
      (piece) => piece !== null && piece.color === color,
    ) as HexchessPiece[];
  }

  getPiece(square: Square): HexchessPiece | null {
    return this.pieces[square] || null;
  }

  hasOppositeColorPiece(square: Square, color: Omit<Color, 'grey'>): boolean {
    const piece = this.getPiece(square);
    return piece !== null && piece.color !== color;
  }

  removePiece(square: Square): void {
    this.pieces[square] = null;
  }

  addPiece(piece: HexchessPiece): void {
    this.pieces[piece.position.toSquare()] = piece;
  }

  addPieceFromString(square: Square, piece: Piece | null): void {
    if (piece === null) {
      this.pieces[square] = null;
      return;
    }
    switch (piece) {
      case 'p': {
        this.pieces[square] = new Pawn('black', Position.fromString(square));
        break;
      }
      case 'P': {
        this.pieces[square] = new Pawn('white', Position.fromString(square));
        break;
      }
      case 'r': {
        this.pieces[square] = new Rook('black', Position.fromString(square));
        break;
      }
      case 'R': {
        this.pieces[square] = new Rook('white', Position.fromString(square));
        break;
      }
      case 'n': {
        this.pieces[square] = new Knight('black', Position.fromString(square));
        break;
      }
      case 'N': {
        this.pieces[square] = new Knight('white', Position.fromString(square));
        break;
      }
      case 'b': {
        this.pieces[square] = new Bishop('black', Position.fromString(square));
        break;
      }
      case 'B': {
        this.pieces[square] = new Bishop('white', Position.fromString(square));
        break;
      }
      case 'q': {
        this.pieces[square] = new Queen('black', Position.fromString(square));
        break;
      }
      case 'Q': {
        this.pieces[square] = new Queen('white', Position.fromString(square));
        break;
      }
      case 'k': {
        this.pieces[square] = new King('black', Position.fromString(square));
        break;
      }
      case 'K': {
        this.pieces[square] = new King('white', Position.fromString(square));
        break;
      }
    }
  }

  movePiece(from: Position, to: Position, override = false): void {
    if (!this._canMoveTo(from, to) && !override) {
      throw new Error(
        `Invalid move from ${from.toSquare()} to ${to.toSquare()}`,
      );
    }

    this._resetPawnsDidMoveTwoSquares();

    const piece = this.getPiece(from.toSquare());
    this.pieces[from.toSquare()] = null;
    if (piece instanceof Pawn) {
      const didMoveTwoSquares = Position.areTwoSquaresApartVertically(from, to);
      this.pieces[to.toSquare()] = new Pawn(piece.color, to, didMoveTwoSquares);
    } else if (piece instanceof King) {
      this.pieces[to.toSquare()] = new King(piece.color, to);
    } else if (piece instanceof Queen) {
      this.pieces[to.toSquare()] = new Queen(piece.color, to);
    } else if (piece instanceof Rook) {
      this.pieces[to.toSquare()] = new Rook(piece.color, to);
    } else if (piece instanceof Bishop) {
      this.pieces[to.toSquare()] = new Bishop(piece.color, to);
    } else if (piece instanceof Knight) {
      this.pieces[to.toSquare()] = new Knight(piece.color, to);
    } else {
      throw new Error('Invalid piece type');
    }
  }

  promotePawn(
    square: Square,
    newPiece: Omit<Piece, 'k' | 'K' | 'p' | 'P'>,
  ): void {
    const possiblePawn = this.getPiece(square);
    if (possiblePawn === null || !(possiblePawn instanceof Pawn)) {
      throw new Error(`No pawn found at ${square}`);
    }

    if (!possiblePawn.canBePromoted()) {
      throw new Error(`Pawn at ${square} cannot be promoted`);
    }

    switch (newPiece) {
      case 'q':
      case 'Q': {
        this.pieces[square] = new Queen(
          possiblePawn.color,
          possiblePawn.position,
        );
        break;
      }
      case 'r':
      case 'R': {
        this.pieces[square] = new Rook(
          possiblePawn.color,
          possiblePawn.position,
        );
        break;
      }
      case 'b':
      case 'B': {
        this.pieces[square] = new Bishop(
          possiblePawn.color,
          possiblePawn.position,
        );
        break;
      }
      case 'n':
      case 'N': {
        this.pieces[square] = new Knight(
          possiblePawn.color,
          possiblePawn.position,
        );
        break;
      }
    }
    this._resetPawnsDidMoveTwoSquares();
  }

  capturePiece(from: Position, to: Position): void {
    const fromPiece = this.getPiece(from.toSquare());
    const toPiece = this.getPiece(to.toSquare());
    if (fromPiece === null || toPiece === null) {
      throw new Error(
        "Both pieces must be non-null to capture - did you mean move?",
      );
    }

    if (fromPiece.color === toPiece.color) {
      throw new Error("Cannot capture your own piece");
    }

    if (toPiece instanceof King) {
      throw new Error("Cannot capture a king");
    }

    this.pieces[from.toSquare()] = null;
    if (fromPiece instanceof Pawn) {
      this.pieces[to.toSquare()] = new Pawn(fromPiece.color, to, false);
    } else if (fromPiece instanceof King) {
      this.pieces[to.toSquare()] = new King(fromPiece.color, to);
    } else if (fromPiece instanceof Queen) {
      this.pieces[to.toSquare()] = new Queen(fromPiece.color, to);
    } else if (fromPiece instanceof Rook) {
      this.pieces[to.toSquare()] = new Rook(fromPiece.color, to);
    } else if (fromPiece instanceof Bishop) {
      this.pieces[to.toSquare()] = new Bishop(fromPiece.color, to);
    } else if (fromPiece instanceof Knight) {
      this.pieces[to.toSquare()] = new Knight(fromPiece.color, to);
    } else {
      throw new Error('Invalid piece type');
    }

    this._resetPawnsDidMoveTwoSquares();
  }

  enPassant(from: Position, to: Position): void {
    const fromPiece = this.getPiece(from.toSquare());
    if (fromPiece === null || !(fromPiece instanceof Pawn)) {
      throw new Error(`No pawn found at ${from.toSquare()}`);
    }

    this.pieces[from.toSquare()] = null;
    let newPosition: Position | null;
    if (fromPiece.color === 'white') {
      newPosition = to.getBottomPosition();
    } else {
      newPosition = to.getTopPosition();
    }
    if (newPosition === null) {
      throw new Error('This is impossible');
    }
    this.pieces[newPosition.toSquare()] = null;
    this.pieces[to.toSquare()] = new Pawn(fromPiece.color, to, false);
    this._resetPawnsDidMoveTwoSquares();
  }
}
