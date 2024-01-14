import {
  BoardChange,
  BoardState,
  CancelSelectionSoonState,
  DragPieceState,
  MouseDownPieceSelected,
  getNewState,
} from './board-state';
import {
  ALL_SQUARES,
  ANNOTATED_BLACK_SQUARES,
  ANNOTATED_WHITE_SQUARES,
  BLACK_COLUMN_LABEL_SQUARES,
  COLUMN_ARRAY,
  WHITE_COLUMN_LABEL_SQUARES,
  stringToMoves,
} from './utils';
import {LitElement, html, svg, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {Column, ColumnConfig, Square, boardToFen, fenToBoard} from './utils';
import {styles} from './hexchess-styles';
import {DEFAULT_PIECE_SIZE, renderPiece} from './piece';
import {Color, Move, Orientation, Piece, TileColor} from './types';
import {Board} from './board';
import {Game, GameState} from './game';

/**
 * A hexagonal chess board used for playing Glinsky-style hex chess.
 *
 * Player variables
 * @cssprop [--hexchess-playername-size=1.4rem]      - The font size of the player names.
 * @cssprop [--hexchess-playername-color=black]      - The color of the player names.
 *
 * Board variables
 * @cssprop [--hexchess-board-bg=#fcfaf2]            - The background color of the whitespace of the board (not tiles).
 * @cssprop [--hexchess-white-bg=#0fafdb]            - The background color of the white tiles.
 * @cssprop [--hexchess-selected-white-bg=#a68a2d]   - The background color of a white tile that's selected to be moved.
 * @cssprop [--hexchess-black-bg=#2a5966]            - The background color of the black tiles.
 * @cssprop [--hexchess-selected-black-bg=#a68a2d]   - The background color of a black tile that's selected to be moved.
 * @cssprop [--hexchess-grey-bg=#24829c]             - The background color of the grey tiles.
 * @cssprop [--hexchess-selected-grey-bg=#a68a2d]    - The background color of a grey tile that's selected to be moved.
 * @cssprop [--hexchess-label-bg=#ffffff]            - The background color of the column and row labels.
 * @cssprop [--hexchess-label-size=12px]             - The font size of the column and row labels.
 * @cssprop [--hexchess-possible-move-bg=#a68a2d]    - The fill color of the small dot shown on a hexagon indicating this is a legal move.
 * @cssprop [--hexchess-attempted-move-bg=#a68a2d88] - The fill color of a hexgon when the user drags over a square, trying to move there.
 *
 * Custom events
 * @fires move      - Fired when a move is made on the board.
 * @fires promoting - Fired when a pawn is ready to promote.
 * @fires promoted  - Fired when a pawn has been promoted to a piece.
 */
@customElement('hexchess-board')
export class HexchessBoard extends LitElement {
  static override styles = styles;

  private _capturedPieceScaleFactor = 0.6;
  private _capturedPieceGroupPadding = 10;
  private _columnConfig: ColumnConfig = {} as ColumnConfig;
  private _draggedPiece: SVGElement | null = null;
  private _hexagonPoints: Record<Square, number[][]> = {} as Record<
    Square,
    number[][]
  >;
  private _hexagonPointsAsString: Record<Square, string> = {} as Record<
    Square,
    string
  >;
  private _lastKnownWidth: number | null = null;
  private _polygonWidth = 0;
  private _polygonHeight = 0;
  private _originalDragPosition: {x: number; y: number} | null = null;
  private _squareCenters: Record<Square, [number, number]> | null = null;
  private _state: BoardState = {
    capturedPieces: {},
    game: new Game(),
    legalMoves: new Game().allLegalMoves(),
    moves: [],
    name: 'WAITING',
    scoreBlack: 42,
    scoreWhite: 42,
  };

  // -----------------
  // Public properties
  // -----------------

  /**
   * A hex-FEN notation describing the state of the board.
   * If the string is empty, no pieces will be rendered.
   */
  @property({
    converter: (value: string | null | undefined) => fenToBoard(value ?? ''),
    type: Object,
  })
  get board(): Board {
    return this._state.game.board;
  }

  set board(board: Board) {
    this._state.game = new Game(board);
    this.requestUpdate('board');
  }

  /**
   * A list of moves made on the board.
   * This is useful for analyzing games already played or certain pre-determined openings.
   */
  @property({
    converter: (value: string | null | undefined) => stringToMoves(value ?? ''),
    type: Array,
  })
  get moves(): Move[] {
    return this._state.moves;
  }

  set moves(moves: Move[]) {
    const oldValue = this._state.moves;
    this._state.moves = moves;
    this.requestUpdate('moves', oldValue);
  }

  /**
   * Black's player name
   */
  @property({type: String})
  blackPlayerName = 'Black';

  /**
   * White's player name
   */
  @property({type: String})
  whitePlayerName = 'White';

  /**
   * The orientation of the board.
   */
  @property({
    converter: (value: string | null | undefined) =>
      value === 'black' ? 'black' : 'white',
  })
  orientation: Orientation = 'white';

  /**
   * Show the board coordinates on the bottom and left sides of the board.
   */
  @property({type: Boolean})
  hideCoordinates = false;

  /**
   * The height of the board.
   */
  @property({type: Number})
  height = 1000;

  /**
   * Do not allow any other moves beyond the predetermined ones set in the `moves` property.
   */
  @property({type: Boolean})
  frozen = false;

  /**
   * The width of the board.
   * If not provided, the board will use the default width.
   */
  @property({type: Number})
  width = 1150;

  constructor() {
    super();
    this._recalculateBoardCoordinates(this.width, this.height);
  }

  // ---------------
  // Event listeners
  // ---------------

  override connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener('pointerup', this._handleMouseUp.bind(this));
    window.addEventListener('pointermove', this._handleMouseMove.bind(this));
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener('pointerup', this._handleMouseUp);
    window.removeEventListener('pointermove', this._handleMouseMove);
  }

  private _handleMouseDown(event: MouseEvent | PointerEvent) {
    event.preventDefault();

    // Only primary button interactions
    if (event.button !== 0) {
      return;
    }

    if (!this._hexagonPoints) {
      return;
    }

    const square = this._getSquareFromClick(event);
    let newState;
    if (square === null) {
      newState = getNewState(this._state, {name: 'MOUSE_DOWN_OUTSIDE_BOARD'});
    } else {
      newState = getNewState(this._state, {
        name: 'MOUSE_DOWN',
        square,
      });
    }

    if (
      newState.state.name === 'MOUSE_DOWN_PIECE_SELECTED' ||
      newState.state.name === 'CANCEL_SELECTION_SOON'
    ) {
      this._draggedPiece = this.renderRoot.querySelector(`.piece-${square}`);
      this._draggedPiece?.classList.add('drag-piece');
      if (this._draggedPiece) {
        const boundingRect = this._draggedPiece.getBoundingClientRect();
        this._originalDragPosition = {
          x: boundingRect.left,
          y: boundingRect.top,
        };
        const isLeftOf = event.clientX < boundingRect.left;
        const deltaX = isLeftOf
          ? event.clientX - boundingRect.left - boundingRect.width / 2
          : event.clientX - boundingRect.right + boundingRect.width / 2;
        const isAboveOf = event.clientY < boundingRect.top;
        const deltaY = isAboveOf
          ? event.clientY - boundingRect.top - boundingRect.height / 2
          : event.clientY - boundingRect.bottom + boundingRect.height / 2;
        this._draggedPiece.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      }
    }

    this._reconcileNewState(newState);
  }

  private _handleMouseEnter(square: Square) {
    if (this._state.name !== 'DRAG_PIECE') {
      return;
    }

    const newState = getNewState(this._state, {
      name: 'MOUSE_MOVE_SQUARE',
      square,
    });
    this._reconcileNewState(newState);
  }

  private _handleMouseUp(event: MouseEvent | PointerEvent) {
    const square = this._getSquareFromClick(event);
    let newState;
    if (!square) {
      newState = getNewState(this._state, {
        name: 'MOUSE_UP_OUTSIDE_BOARD',
      });
    } else {
      newState = getNewState(this._state, {
        name: 'MOUSE_UP',
        square,
      });
    }

    // Set new position of piece
    const state = this._state as
      | MouseDownPieceSelected
      | DragPieceState
      | CancelSelectionSoonState;
    const originalPiece = this._state.game.board.getPiece(state.square);
    const newPiece = newState.state.game.board.getPiece(state.square);
    if (this._draggedPiece) {
      if (originalPiece === newPiece) {
        // 1. The piece didn't move and needs to go back to the square center
        this._draggedPiece.style.transform = 'none';
      } else {
        // 2. The piece moved and needs to go to the center of the new square
        this._draggedPiece.classList.remove(
          `piece-${state.square}`,
          'drag-piece'
        );
        this._draggedPiece.classList.add(
          `piece-${
            (
              newState.state as
                | MouseDownPieceSelected
                | DragPieceState
                | CancelSelectionSoonState
            ).square
          }`
        );
      }
    }

    this._draggedPiece?.classList.remove('drag-piece');
    this._draggedPiece = null;
    this._originalDragPosition = null;

    this._reconcileNewState(newState);
  }

  private _handleMouseMove(event: MouseEvent | PointerEvent) {
    if (
      this._state.name !== 'DRAG_PIECE' &&
      this._state.name !== 'MOUSE_DOWN_PIECE_SELECTED' &&
      this._state.name !== 'CANCEL_SELECTION_SOON'
    ) {
      return;
    }

    if (this._draggedPiece) {
      const newXPos = Math.min(
        Math.max(DEFAULT_PIECE_SIZE / 2, event.clientX),
        this.width - DEFAULT_PIECE_SIZE / 2
      );
      const newYPos = Math.min(
        Math.max(DEFAULT_PIECE_SIZE / 2, event.clientY),
        this.height - DEFAULT_PIECE_SIZE / 2
      );
      const deltaX = newXPos - this._originalDragPosition!.x;
      const deltaY = newYPos - this._originalDragPosition!.y;
      this._draggedPiece.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    }

    const square = this._getSquareFromClick(event);
    let newState;
    if (square) {
      newState = getNewState(this._state, {
        name: 'MOUSE_MOVE_SQUARE',
        square,
      });
    } else {
      newState = getNewState(this._state, {
        name: 'MOUSE_MOVE_OUTSIDE_BOARD',
      });
    }

    this._reconcileNewState(newState);
  }

  // ----------------------
  // Private helper methods
  // ----------------------

  private _reconcileNewState(newState: BoardChange) {
    if (newState.didChange) {
      if (
        newState.state.game.state() === GameState.PROMOTING &&
        this._state.game.state() !== GameState.PROMOTING
      ) {
        const move = newState.state.moves[newState.state.moves.length - 1];
        this.dispatchEvent(
          new CustomEvent('promoting', {detail: {location: move.to}})
        );
      } else if (
        this._state.game.state() === GameState.PROMOTING &&
        newState.state.game.state() !== GameState.PROMOTING
      ) {
        // TODO
        this.dispatchEvent(new CustomEvent('promoted'));
      } else if (newState.state.moves.length > this._state.moves.length) {
        const move = newState.state.moves[newState.state.moves.length - 1];
        this.dispatchEvent(
          new CustomEvent('move', {detail: {from: move.from, to: move.to}})
        );
      }
      this._state = newState.state;
      this.requestUpdate('board');
    }
  }

  private _calculateHexagonPoints(width: number, height: number): number[][] {
    const quarterWidth = width / 4;
    const threeQuarterWidth = quarterWidth * 3;
    const halfHeight = height / 2;
    return [
      [quarterWidth, 0],
      [threeQuarterWidth, 0],
      [width, halfHeight],
      [threeQuarterWidth, height],
      [quarterWidth, height],
      [0, halfHeight],
    ];
  }

  private _calculateHexagonPointsAsString(
    width: number,
    height: number
  ): string {
    const quarterWidth = width / 4;
    const threeQuarterWidth = quarterWidth * 3;
    const halfHeight = height / 2;
    return `${quarterWidth},0 ${threeQuarterWidth},0 ${width},${halfHeight} ${threeQuarterWidth},${height} ${quarterWidth},${height} 0,${halfHeight}`;
  }

  private _calculateColumnConfig(
    boardWidth: number,
    boardHeight: number
  ): ColumnConfig {
    const polygonWidth = boardWidth / 8.5;
    const polygonHeight = boardHeight / 11;
    const polygonHalfHeight = polygonHeight / 2;
    const polygonQuarterWidth = polygonWidth / 4;

    const offsetFY = 0;
    const offsetEY = polygonHalfHeight;
    const offsetDY = polygonHeight;
    const offsetCY = polygonHeight + polygonHalfHeight;
    const offsetBY = polygonHeight * 2;
    const offsetAY = polygonHeight * 2 + polygonHalfHeight;
    const offsetGY = offsetEY;
    const offsetHY = offsetDY;
    const offsetIY = offsetCY;
    const offsetKY = offsetBY;
    const offsetLY = offsetAY;

    const offsetAX = 0;
    const offsetBX = offsetAX + polygonQuarterWidth * 3;
    const offsetCX = offsetBX + polygonQuarterWidth * 3;
    const offsetDX = offsetCX + polygonQuarterWidth * 3;
    const offsetEX = offsetDX + polygonQuarterWidth * 3;
    const offsetFX = offsetEX + polygonQuarterWidth * 3;
    const offsetGX = offsetFX + polygonQuarterWidth * 3;
    const offsetHX = offsetGX + polygonQuarterWidth * 3;
    const offsetIX = offsetHX + polygonQuarterWidth * 3;
    const offsetKX = offsetIX + polygonQuarterWidth * 3;
    const offsetLX = offsetKX + polygonQuarterWidth * 3;

    const whiteStart: Color[] = ['white', 'black', 'grey'];
    const greyStart: Color[] = ['grey', 'white', 'black'];
    const blackStart: Color[] = ['black', 'grey', 'white'];

    if (this.orientation === 'black') {
      return {
        L: {x: offsetAX, y: offsetAY, colors: blackStart},
        K: {x: offsetBX, y: offsetBY, colors: greyStart},
        I: {x: offsetCX, y: offsetCY, colors: whiteStart},
        H: {x: offsetDX, y: offsetDY, colors: blackStart},
        G: {x: offsetEX, y: offsetEY, colors: greyStart},
        F: {x: offsetFX, y: offsetFY, colors: whiteStart},
        E: {x: offsetGX, y: offsetGY, colors: greyStart},
        D: {x: offsetHX, y: offsetHY, colors: blackStart},
        C: {x: offsetIX, y: offsetIY, colors: whiteStart},
        B: {x: offsetKX, y: offsetKY, colors: greyStart},
        A: {x: offsetLX, y: offsetLY, colors: blackStart},
      };
    }

    return {
      A: {x: offsetAX, y: offsetAY, colors: blackStart},
      B: {x: offsetBX, y: offsetBY, colors: greyStart},
      C: {x: offsetCX, y: offsetCY, colors: whiteStart},
      D: {x: offsetDX, y: offsetDY, colors: blackStart},
      E: {x: offsetEX, y: offsetEY, colors: greyStart},
      F: {x: offsetFX, y: offsetFY, colors: whiteStart},
      G: {x: offsetGX, y: offsetGY, colors: greyStart},
      H: {x: offsetHX, y: offsetHY, colors: blackStart},
      I: {x: offsetIX, y: offsetIY, colors: whiteStart},
      K: {x: offsetKX, y: offsetKY, colors: greyStart},
      L: {x: offsetLX, y: offsetLY, colors: blackStart},
    };
  }

  private _calculateSquareCenters(
    columnConfig: ColumnConfig
  ): Record<Square, [number, number]> {
    const centers = {} as Record<Square, [number, number]>;

    for (const square of ALL_SQUARES) {
      const offSets = this._getOffsets(square, columnConfig);
      centers[square] = [
        offSets[0] + this._polygonWidth / 2,
        offSets[1] + this._polygonHeight / 2,
      ];
    }

    return centers;
  }

  private _getSquareFromClick(event: MouseEvent | PointerEvent): Square | null {
    if (!event.target) {
      return null;
    }

    if (!(event.target instanceof SVGElement)) {
      return null;
    }

    const parent = event.target.parentElement;
    if (!parent) {
      return null;
    }

    const dataset = parent.dataset;
    if (!dataset || !('square' in dataset)) {
      return null;
    }

    return dataset.square as Square;
  }

  private _getOffsets(square: Square, config: ColumnConfig): [number, number] {
    const column = square[0] as Column;
    const row = parseInt(square.slice(1));

    const xOffset = config[column].x;
    const baseOffset = config[column].y;
    const numHexagons = this._numberOfHexagons(column);

    const yOffset =
      this.orientation === 'white'
        ? baseOffset + this._polygonHeight * (numHexagons - row)
        : baseOffset + this._polygonHeight * (row - 1);
    return [xOffset, yOffset];
  }

  private _numberOfHexagons(column: Column): number {
    switch (column) {
      case 'A':
      case 'L':
        return 6;
      case 'B':
      case 'K':
        return 7;
      case 'C':
      case 'I':
        return 8;
      case 'D':
      case 'H':
        return 9;
      case 'E':
      case 'G':
        return 10;
      case 'F':
        return 11;
    }
  }

  private _recalculateBoardCoordinates(width: number, height: number) {
    this._polygonWidth = width / 8.5;
    this._polygonHeight = height / 11;
    this._columnConfig = this._calculateColumnConfig(width, height);
    this._squareCenters = this._calculateSquareCenters(this._columnConfig);
    for (const column of COLUMN_ARRAY) {
      const numHexagons = this._numberOfHexagons(column);
      for (let row = 1; row <= numHexagons; row++) {
        const square = `${column}${row}` as Square;
        const [xOffset, yOffset] = this._getOffsets(square, this._columnConfig);
        this._hexagonPoints[square] = this._calculateHexagonPoints(
          this._polygonWidth,
          this._polygonHeight
        ).map((point) => [point[0] + xOffset, point[1] + yOffset]);
        this._hexagonPointsAsString[square] =
          this._calculateHexagonPointsAsString(
            this._polygonWidth,
            this._polygonHeight
          );
      }
    }
  }

  // -----------------
  // Rendering methods
  // -----------------

  private _renderScore(x: number, y: number, score: number | undefined) {
    if (!score) {
      return nothing;
    }

    if (score === 0 || score < 0) {
      return nothing;
    }

    return svg`<text class="score" dominant-baseline="hanging" x="${x}" y="${y}">(+${score})</text>`;
  }

  private _renderCapturedPieceGroup(
    piece: Piece,
    numPieces: number,
    x: number,
    y: number
  ) {
    return svg`
      ${[...Array(numPieces).keys()].map((numPiece) => {
        return renderPiece(
          piece,
          x + DEFAULT_PIECE_SIZE * this._capturedPieceScaleFactor * numPiece,
          y
        );
      })}
    `;
  }

  private _renderOneSideCapturedPieces(
    pieces: Partial<Record<Piece, number>>,
    x: number,
    y: number,
    score: number
  ) {
    const pawn = 'p' in pieces ? 'p' : 'P' in pieces ? 'P' : undefined;
    const bishop = 'b' in pieces ? 'b' : 'B' in pieces ? 'B' : undefined;
    const knight = 'n' in pieces ? 'n' : 'N' in pieces ? 'N' : undefined;
    const rook = 'r' in pieces ? 'r' : 'R' in pieces ? 'R' : undefined;
    const queen = 'q' in pieces ? 'q' : 'Q' in pieces ? 'Q' : undefined;

    const bishopX = pawn
      ? x +
        DEFAULT_PIECE_SIZE *
          this._capturedPieceScaleFactor *
          (pieces[pawn] ?? 0) +
        this._capturedPieceGroupPadding
      : x;
    const knightX = bishop
      ? bishopX +
        DEFAULT_PIECE_SIZE *
          this._capturedPieceScaleFactor *
          (pieces[bishop] ?? 0) +
        this._capturedPieceGroupPadding
      : bishopX;
    const rookX = knight
      ? knightX +
        DEFAULT_PIECE_SIZE *
          this._capturedPieceScaleFactor *
          (pieces[knight] ?? 0) +
        this._capturedPieceGroupPadding
      : knightX;
    const queenX = rook
      ? rookX +
        DEFAULT_PIECE_SIZE *
          this._capturedPieceScaleFactor *
          (pieces[rook] ?? 0) +
        this._capturedPieceGroupPadding
      : rookX;
    const scoreX = queen
      ? queenX + DEFAULT_PIECE_SIZE + 2 * this._capturedPieceGroupPadding
      : queenX + 2 * this._capturedPieceGroupPadding;

    const capturedPawns = pawn
      ? this._renderCapturedPieceGroup(pawn, pieces[pawn]!, x, y)
      : nothing;
    const capturedBishops = bishop
      ? this._renderCapturedPieceGroup(bishop, pieces[bishop]!, bishopX, y)
      : nothing;
    const capturedKnights = knight
      ? this._renderCapturedPieceGroup(knight, pieces[knight]!, knightX, y)
      : nothing;
    const capturedRooks = rook
      ? this._renderCapturedPieceGroup(rook, pieces[rook]!, rookX, y)
      : nothing;
    const capturedQueens = queen
      ? this._renderCapturedPieceGroup(queen, pieces[queen]!, queenX, y)
      : nothing;

    return svg`
      <g class="captured-pieces" transform="scale(${
        this._capturedPieceScaleFactor
      })">
        ${capturedPawns}
        ${capturedBishops}
        ${capturedKnights}
        ${capturedRooks}
        ${capturedQueens}
        ${this._renderScore(
          scoreX,
          y + DEFAULT_PIECE_SIZE * this._capturedPieceScaleFactor,
          score
        )}
      </g>
    `;
  }

  private _renderCapturedPieces() {
    const isOrientationWhite = this.orientation === 'white';
    const x = isOrientationWhite
      ? this._columnConfig.A.x
      : this._columnConfig.L.x;
    const topY = this._getOffsets(
      isOrientationWhite ? 'E10' : 'E1',
      this._columnConfig
    )[1];
    const bottomY =
      (this._getOffsets(
        isOrientationWhite ? 'E1' : 'E10',
        this._columnConfig
      )[1] +
        this._polygonHeight) /
      this._capturedPieceScaleFactor;

    const whitePieceKeys = Object.keys(this._state.capturedPieces).filter(
      (letter) => letter.toUpperCase() === letter
    );
    const blackPieceKeys = Object.keys(this._state.capturedPieces).filter(
      (letter) => letter.toLowerCase() === letter
    );

    if (whitePieceKeys.length === 0 && blackPieceKeys.length === 0) {
      return nothing;
    }

    const whitePieces = whitePieceKeys.reduce((acc, piece) => {
      const p = piece as Piece;
      acc[p] = this._state.capturedPieces[p];
      return acc;
    }, {} as Partial<Record<Piece, number>>);

    const blackPieces = blackPieceKeys.reduce((acc, piece) => {
      const p = piece as Piece;
      acc[p] = this._state.capturedPieces[p];
      return acc;
    }, {} as Partial<Record<Piece, number>>);

    const whiteScore = this._state.scoreWhite - this._state.scoreBlack;
    const blackScore = this._state.scoreBlack - this._state.scoreWhite;

    return svg`
      <g id="captured-pieces-top">
      ${this._renderOneSideCapturedPieces(
        isOrientationWhite ? whitePieces : blackPieces,
        x,
        topY,
        isOrientationWhite ? blackScore : whiteScore
      )}
      </g>
      <g id="captured-pieces-bottom">
      ${this._renderOneSideCapturedPieces(
        isOrientationWhite ? blackPieces : whitePieces,
        x,
        bottomY,
        isOrientationWhite ? whiteScore : blackScore
      )}
      </g>
    `;
  }

  private _renderPiece(square: Square) {
    if (
      !(square in this._state.game.board.pieces) ||
      this._state.game.board.getPiece(square) === null
    ) {
      return nothing;
    }
    const piece = this._state.game.board.getPiece(square)!;
    const [x, y] = this._squareCenters![square];
    return html`
      <div style="left: ${x}px; top: ${y}px" class="piece piece-${square}">
        ${renderPiece(piece.toString(), x, y)}
      </div>
    `;
  }

  private _renderPieces() {
    const squares = Object.keys(this._state.game.board.pieces) as Square[];
    return html`${squares.map((square) => this._renderPiece(square))}`;
  }

  private _renderColumnLabel(
    column: Column,
    row: number,
    polygonWidth: number,
    polygonHeight: number
  ) {
    if (this.hideCoordinates) {
      return nothing;
    }

    const square = `${column}${row}` as Square;
    if (
      this.orientation === 'white' &&
      !WHITE_COLUMN_LABEL_SQUARES.includes(square)
    ) {
      return nothing;
    }
    if (
      this.orientation === 'black' &&
      !BLACK_COLUMN_LABEL_SQUARES.includes(square)
    ) {
      return nothing;
    }

    return svg`
      <text
        x=${polygonWidth * 0.75 - 10}
        y=${polygonHeight - 4}
        class="label"
      >
        ${column}
      </text>
    `;
  }

  private _renderCoordinate(column: Column, row: number, polygonWidth: number) {
    if (this.hideCoordinates) {
      return nothing;
    }

    const square = `${column}${row}` as Square;
    if (
      this.orientation === 'white' &&
      !ANNOTATED_WHITE_SQUARES.includes(square)
    ) {
      return nothing;
    }
    if (
      this.orientation === 'black' &&
      !ANNOTATED_BLACK_SQUARES.includes(square)
    ) {
      return nothing;
    }
    return svg`
      <text
        x=${polygonWidth / 4 + 3}
        y=${13}
        class="label"
      >
        ${row}
      </text>
    `;
  }

  private _renderColumn(column: Column) {
    const colors = this._columnConfig[column].colors;

    const numHexagons = this._numberOfHexagons(column);

    return svg`
      <g id="column-${column}">
        ${[...Array(numHexagons).keys()].map((i) => {
          // Helper methods
          const square = `${column}${i + 1}` as Square;

          // Base background color, except for classes defined below
          const color =
            i % 3 === 0 ? colors[0] : i % 3 === 1 ? colors[1] : colors[2];

          // Rendering classes
          const isSelected =
            this._state.name !== 'WAITING' &&
            this._state.name !== 'REWOUND' &&
            this._state.square === square;
          const selectedClass = isSelected ? 'selected' : '';
          let isPossibleMove;
          if (this._state.name === 'DRAG_PIECE') {
            isPossibleMove =
              this._state.dragSquare === square &&
              this._state.square !== square;
          } else {
            isPossibleMove = false;
          }
          const possibleMove = isPossibleMove ? 'possible-move' : '';
          const classes = `${selectedClass} ${possibleMove}`;

          // Offsets
          const offset = this._getOffsets(square, this._columnConfig);
          return svg`
            <g
              @pointerenter=${() => this._handleMouseEnter(square)}
              class=${classes}
              data-square=${square}
              transform="translate(${offset[0]},${offset[1]})"
            >
              ${this._renderHexagon(
                this._polygonWidth,
                this._polygonHeight,
                color
              )}
              ${this._renderDot(
                this._polygonWidth,
                this._polygonHeight,
                column,
                i + 1
              )}
              ${this._renderColumnLabel(
                column,
                i + 1,
                this._polygonWidth,
                this._polygonHeight
              )}
              ${this._renderCoordinate(column, i + 1, this._polygonWidth)}
            </g>
          `;
        })}
      </g>
    `;
  }

  private _renderDot(
    width: number,
    height: number,
    column: Column,
    row: number
  ) {
    if (this._state.name === 'WAITING' || this._state.name === 'REWOUND') {
      return nothing;
    }

    const square = `${column}${row}` as Square;
    if (this._state.square === square) {
      return nothing;
    }
    if (!this._state.legalMoves[this._state.square]?.has(square)) {
      return nothing;
    }

    const radius = Math.min(this._polygonHeight, this._polygonWidth) / 6;
    return svg`<circle
      cx=${width / 2}
      cy=${height / 2}
      r=${radius}
      class="possible-move" />`;
  }

  private _renderHexagon(width: number, height: number, color: TileColor) {
    return svg`<polygon
      points=${this._calculateHexagonPointsAsString(width, height)}
      class="${color}" />`;
  }

  private _renderBoard() {
    const cursorClass =
      this._state.name === 'DRAG_PIECE' ||
      this._state.name === 'MOUSE_DOWN_PIECE_SELECTED' ||
      this._state.name === 'CANCEL_SELECTION_SOON'
        ? 'cursor-grabbing'
        : 'cursor-grab';

    return html`
      <div>
        <svg
          width="${this.width}"
          height="${this.height}"
          viewbox="0 0 ${this.width} ${this.height}"
          class="board ${cursorClass}"
          @pointerdown=${(event: MouseEvent | PointerEvent) =>
            this._handleMouseDown(event)}
          @pointerup=${(event: MouseEvent | PointerEvent) =>
            this._handleMouseUp(event)}
          @pointermove=${(event: MouseEvent) =>
            requestAnimationFrame(() => this._handleMouseMove(event))}
        >
          <g>
            ${COLUMN_ARRAY.map((column) => {
              return svg`${this._renderColumn(column)}`;
            })}
          </g>
          <g>${this._renderPlayers()}</g>
        </svg>
        ${this._renderPieces()} ${this._renderCapturedPieces()}
      </div>
    `;
  }

  private _renderPlayer(
    name: string,
    x: number,
    y: number,
    alignment: 'auto' | 'hanging'
  ) {
    return svg`
      <text dominant-baseline="${alignment}" x="${x}" y="${y}" class="username">${name}</text>
    `;
  }

  private _renderPlayers() {
    const isOrientationWhite = this.orientation === 'white';
    const x = isOrientationWhite
      ? this._columnConfig.A.x
      : this._columnConfig.L.x;
    const topY = this._getOffsets(
      isOrientationWhite ? 'F11' : 'F1',
      this._columnConfig
    )[1];
    const bottomY =
      this._getOffsets(
        isOrientationWhite ? 'F1' : 'F11',
        this._columnConfig
      )[1] + this._polygonHeight;
    const topName = isOrientationWhite
      ? this.blackPlayerName
      : this.whitePlayerName;
    const bottomName = isOrientationWhite
      ? this.whitePlayerName
      : this.blackPlayerName;
    return svg`
      ${this._renderPlayer(topName, x, topY, 'hanging')}
      ${this._renderPlayer(bottomName, x, bottomY, 'auto')}
    `;
  }

  override render() {
    if (this.width && this._lastKnownWidth !== this.width) {
      this._recalculateBoardCoordinates(this.width, this.height);
    }
    return html` ${this._renderBoard()} `;
  }

  // --------------
  // Public methods
  // --------------

  /**
   * Converts to a hex-FEN notation describing the state of the board.
   */
  fen(): string {
    return boardToFen(this._state.game.board);
  }

  /**
   * Flip the orientation of the board.
   */
  flip() {
    if (this.orientation === 'white') {
      this.orientation = 'black';
    } else {
      this.orientation = 'white';
    }
  }

  /**
   * Rewinds one move to a previous position.
   * If there are no previous moves, this does nothing.
   */
  rewind() {
    const newState = getNewState(this._state, {name: 'REWIND'});
    this._reconcileNewState(newState);
  }

  /**
   * Fast forwards one move to the next position.
   * If there are no next moves, this does nothing.
   */
  fastForward() {
    const newState = getNewState(this._state, {name: 'FAST_FORWARD'});
    this._reconcileNewState(newState);
  }

  /**
   * Prevent any more moves to the game.
   * Usually called when the game is over.
   */
  freeze() {
    this.frozen = true;
  }

  /**
   * Make a move on the board.
   *
   * @returns Whether or not the move can be made.
   */
  move(from: Square, to: Square): boolean {
    // No moves if board is frozen
    if (this.frozen) {
      return false;
    }

    const newState = getNewState(this._state, {
      name: 'PROGRAMMATIC_MOVE',
      move: [from, to],
    });
    this._reconcileNewState(newState);
    return newState.didChange;
  }

  /**
   * Resets and unfreezes the board to the default start state.
   */
  reset() {
    const newGame = new Game();
    this._state = {
      capturedPieces: {},
      game: newGame,
      legalMoves: newGame.allLegalMoves(),
      moves: [],
      name: 'WAITING',
      scoreBlack: 42,
      scoreWhite: 42,
    };
    this.frozen = false;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hexchess-board': HexchessBoard;
  }
}
