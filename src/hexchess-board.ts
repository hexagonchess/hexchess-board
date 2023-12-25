import {
  ANNOTATED_BLACK_SQUARES,
  ANNOTATED_WHITE_SQUARES,
  BLACK_COLUMN_LABEL_SQUARES,
  COLUMN_ARRAY,
  Orientation,
  Piece,
  WHITE_COLUMN_LABEL_SQUARES,
  emptyBoard,
  stringToMoves,
} from './utils';
import {LitElement, html, css, svg, nothing} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import {
  Board,
  Color,
  Column,
  ColumnConfig,
  FullBoard,
  PIECE_SIZE,
  Square,
  TileColor,
  boardToFen,
  fenToBoard,
} from './utils';
import {renderPiece} from './piece';

/**
 * A hexagonal chess board used for playing Glinsky-style hex chess.
 *
 * @cssprop [--hexchess-white-bg=#0fafdb]          - The background color of the white tiles.
 * @cssprop [--hexchess-selected-white-bg=#a68a2d] - The background color of a white tile that's selected to be moved.
 * @cssprop [--hexchess-black-bg=#2a5966]          - The background color of the black tiles.
 * @cssprop [--hexchess-selected-black-bg=#a68a2d] - The background color of a black tile that's selected to be moved.
 * @cssprop [--hexchess-grey-bg=#24829c]           - The background color of the grey tiles.
 * @cssprop [--hexchess-selected-grey-bg=#a68a2d]  - The background color of a grey tile that's selected to be moved.
 * @cssprop [--hexchess-label-bg=#ffffff]          - The background color of the column and row labels.
 * @cssprop [--hexchess-label-size=12px]           - The font size of the column and row labels.
 * @cssprop [--hexchess-possible-move-bg=#a68a2d]  - The fill color of the small circle shown on a hexagon indicating this is a legal move.
 */
@customElement('hexchess-board')
export class HexchessBoard extends LitElement {
  static override styles = css`
    .cursor-grab {
      cursor: grab;
    }

    .cursor-grabbing {
      cursor: grabbing;
    }

    polygon .possible-move {
      stroke: var(--hexchess-possible-move-stroke, #a68a2d);
      stroke-width: 10;
    }

    .label {
      fill: var(--hexchess-label-bg, #ffffff);
      font-size: var(--hexchess-label-size, 12px);
    }

    .white {
      fill: var(--hexchess-white-bg, #0fafdb);
    }
    .selected .white {
      fill: var(--hexchess-selected-white-bg, #a68a2d);
    }

    .black {
      fill: var(--hexchess-black-bg, #2a5966);
    }
    .selected .black {
      fill: var(--hexchess-selected-black-bg, #a68a2d);
    }

    .grey {
      fill: var(--hexchess-grey-bg, #24829c);
    }
    .selected .grey {
      fill: var(--hexchess-selected-grey-bg, #a68a2d);
    }

    .possible-move {
      fill: var(--hexchess-possible-move-bg, #a68a2d);
    }

    .drag-piece {
      position: absolute;
      z-index: 10;
    }
  `;

  private _currentMove = -1;
  private _currentPosition: Board = {};
  private _from: Square | null = null;
  private _legalMoves?: Record<Square, Set<Square>> = undefined;
  private _moves: Square[][] = [];
  private _turn = 0;
  private _draggedPiece: Piece | null = null;
  @query('.drag-piece')
  private _draggedDiv?: HTMLDivElement;
  private _draggedSquare: Square | null = null;
  private _initialDragPosition: {x: number; y: number} | null = null;

  // -----------------
  // Public properties
  // -----------------

  /**
   * A hex-FEN notation describing the state of the board.
   * If the string is empty, no pieces will be rendered.
   */
  @property({
    converter: (value: string | null | undefined) => fenToBoard(value ?? ''),
  })
  get board(): Board {
    return this._currentPosition;
  }

  set board(board: Board) {
    const oldValue = this._currentPosition;
    this._currentPosition = board;
    this.requestUpdate('board', oldValue);
  }

  /**
   * A list of moves made on the board.
   * This is useful for analyzing games already played or certain pre-determined openings.
   */
  @property({
    converter: (value: string | null | undefined) => stringToMoves(value ?? ''),
    type: Array,
  })
  get moves(): Square[][] {
    return this._moves;
  }

  set moves(moves: Square[][]) {
    const oldValue = this._moves;
    this._moves = moves;
    this.requestUpdate('moves', oldValue);
  }

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
  width?: number;

  // ---------------
  // Event listeners
  // ---------------

  private _handleMouseDown(event: MouseEvent, square: Square) {
    // Only primary button interactions
    if (event.button !== 0) {
      return;
    }

    // Ignore attempts at moving if not viewing the latest board state
    if (this._currentMove !== this._moves.length - 1) {
      return;
    }

    if (this._from === null) {
      if (Object.keys(this._currentPosition).length === 0) {
        return;
      }

      const fullBoard = this._currentPosition as FullBoard;
      if (fullBoard[square] === null) {
        return;
      }

      const piece = fullBoard[square];
      if (piece === null) {
        return;
      }

      this._draggedPiece = piece;
      this._initialDragPosition = {x: event.clientX, y: event.clientY};
      if (this._draggedDiv) {
        this._draggedDiv.style.left = `${event.clientX}px`;
        this._draggedDiv.style.top = `${event.clientY}px`;
      }
      this._from = square;
      this.requestUpdate('board');
      return;
    }
  }

  private _handleMouseUp(event: MouseEvent, square: Square) {
    // only primary button interactions
    if (event.button !== 0) {
      this._draggedSquare = null;
      this._draggedPiece = null;
      this._from = null;
      this.requestUpdate('board');
      return;
    }

    if (this._from === null) {
      this._draggedSquare = null;
      this._draggedPiece = null;
      this._from = null;
      this.requestUpdate('board');
      return;
    }

    if (this._legalMoves && !(this._from in this._legalMoves)) {
      this._draggedSquare = null;
      this._from = null;
      this._draggedPiece = null;
      this.requestUpdate('board');
      return;
    }
    if (
      this._legalMoves &&
      this._from in this._legalMoves &&
      !this._legalMoves[this._from].has(square)
    ) {
      this._draggedSquare = null;
      this._draggedPiece = null;
      this._from = null;
      this.requestUpdate('board');
      return;
    }

    this.move(this._from, square);
  }

  private _handleMouseEnter(square: Square) {
    this._draggedSquare = square;
  }

  private _handleMouseMove(event: MouseEvent) {
    if (!this._draggedPiece || !this._from || !this._draggedDiv) {
      this._from = null;
      this._draggedPiece = null;
      return;
    }

    const deltaX = event.clientX - this._initialDragPosition!.x;
    const deltaY = event.clientY - this._initialDragPosition!.y;
    this._draggedDiv.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
  }

  // ----------------------
  // Private helper methods
  // ----------------------

  private _applyMove(from: Square, to: Square) {
    const fullBoard = this._currentPosition as FullBoard;
    const piece = fullBoard[from];
    fullBoard[from] = null;
    fullBoard[to] = piece;
    this._legalMoves = this._recalculateLegalMoves(fullBoard);

    this.requestUpdate('board');
  }

  private _columnConfig(boardWidth: number, boardHeight: number): ColumnConfig {
    const polygonWidth = boardWidth / 12;
    const polygonHeight = boardHeight / 12;
    const polygonHalfHeight = polygonHeight / 2;
    const polygonQuarterWidth = polygonWidth / 4;

    const offsetFX = boardWidth / 2 - polygonWidth * 2;
    const offsetFY = 0;

    const offsetEX = offsetFX - polygonQuarterWidth * 3;
    const offsetEY = polygonHalfHeight;

    const offsetDX = offsetEX - polygonQuarterWidth * 3;
    const offsetDY = polygonHeight;

    const offsetCX = offsetDX - polygonQuarterWidth * 3;
    const offsetCY = polygonHeight + polygonHalfHeight;

    const offsetBX = offsetCX - polygonQuarterWidth * 3;
    const offsetBY = polygonHeight * 2;

    const offsetAX = offsetBX - polygonQuarterWidth * 3;
    const offsetAY = polygonHeight * 2 + polygonHalfHeight;

    const offsetGX = offsetFX + polygonQuarterWidth * 3;
    const offsetGY = offsetEY;

    const offsetHX = offsetGX + polygonQuarterWidth * 3;
    const offsetHY = offsetDY;

    const offsetIX = offsetHX + polygonQuarterWidth * 3;
    const offsetIY = offsetCY;

    const offsetKX = offsetIX + polygonQuarterWidth * 3;
    const offsetKY = offsetBY;

    const offsetLX = offsetKX + polygonQuarterWidth * 3;
    const offsetLY = offsetAY;

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

  private _convertToLegalMoveMap(
    moves: Square[][]
  ): Record<Square, Set<Square>> {
    const newLegalMoves: Partial<Record<Square, Set<Square>>> = {};
    for (const move of moves) {
      if (!(move[0] in newLegalMoves)) {
        newLegalMoves[move[0]] = new Set([move[1]]);
      } else {
        newLegalMoves[move[0]]!.add(move[1]);
      }
    }

    return newLegalMoves as Record<Square, Set<Square>>;
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

  private _recalculateLegalMoves(_fullBoard: FullBoard) {
    return undefined;
  }

  // -----------------
  // Rendering methods
  // -----------------

  private _renderDraggedPiece() {
    const piece = !this._draggedPiece
      ? nothing
      : renderPiece(this._draggedPiece, PIECE_SIZE);
    return html`<div class="drag-piece">${piece}</div>`;
  }

  private _renderPiece(column: Column, row: number, size: number) {
    const square = `${column}${row}` as keyof Board;
    if (!this._currentPosition[square] || this._from === square) {
      return nothing;
    }
    return renderPiece(this._currentPosition[square], size);
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

  private _renderColumn(
    column: Column,
    width: number,
    height: number,
    config: ColumnConfig
  ) {
    const xOffset = config[column].x;
    const yOffset = config[column].y;
    const colors = config[column].colors;

    const numHexagons = this._numberOfHexagons(column);
    const getYOffset = (row: number) => {
      if (this.orientation === 'white') {
        return yOffset + height * (numHexagons - row);
      }
      return yOffset + height * row;
    };

    return svg`
      <g id="column-${column}">
        ${[...Array(numHexagons).keys()].map((i) => {
          const color =
            i % 3 === 0 ? colors[0] : i % 3 === 1 ? colors[1] : colors[2];
          const selectedClass =
            this._from === `${column}${i + 1}` ? 'selected' : '';
          const possibleMove =
            this._draggedSquare === `${column}${i + 1}` ? 'possible-move' : '';
          const classes = `${selectedClass} ${possibleMove}`;
          return svg`
            <g
              class=${classes}
              transform="translate(${xOffset},${getYOffset(i)})"
              @mousedown=${(event: MouseEvent) =>
                this._handleMouseDown(event, `${column}${i + 1}` as Square)}
              @pointermove=${(event: MouseEvent) =>
                requestAnimationFrame(() => this._handleMouseMove(event))}
              @mouseenter=${() =>
                this._handleMouseEnter(`${column}${i + 1}` as Square)}
              @mouseup=${(event: MouseEvent) =>
                this._handleMouseUp(event, `${column}${i + 1}` as Square)}
            >
              ${this._renderHexagon(width, height, color)}
              ${this._renderDot(width, height, column, i + 1)}
              ${this._renderColumnLabel(column, i + 1, width, height)}
              ${this._renderCoordinate(column, i + 1, width)}
              <g transform="translate(${width / 2 - 45 / 2},${
            height / 2 - 45 / 2
          })">
                ${this._renderPiece(column, i + 1, PIECE_SIZE)}
              </g>
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
    if (this._from === null) {
      return nothing;
    }
    if (!this._legalMoves) {
      return nothing;
    }
    if (this._currentMove !== this._moves.length - 1) {
      return nothing;
    }

    const square = `${column}${row}` as Square;
    if (this._from === square) {
      return nothing;
    }

    if (!(this._from in this._legalMoves)) {
      return nothing;
    }
    if (!this._legalMoves[this._from].has(square)) {
      return nothing;
    }

    const radius = Math.min(width / 10, 5);
    return svg`<circle
      cx=${width / 2}
      cy=${height / 2}
      r=${radius}
      class="possible-move" />`;
  }

  private _renderHexagon(width: number, height: number, color: TileColor) {
    const quarterWidth = width / 4;
    const threeQuarterWidth = quarterWidth * 3;
    const halfHeight = height / 2;
    const points = `${quarterWidth},0 ${threeQuarterWidth},0 ${width},${halfHeight} ${threeQuarterWidth},${height} ${quarterWidth},${height} 0,${halfHeight}`;
    return svg`<polygon
      points=${points}
      class="${color}" />`;
  }

  private _renderBoard(width: number, height: number) {
    const polygonWidth = width / 12;
    const polygonHeight = height / 12;
    const columnConfig = this._columnConfig(width, height);
    const cursorClass = this._draggedPiece ? 'cursor-grabbing' : 'cursor-grab';

    return html`
      <div class=${cursorClass}>
        <svg width="${width}" height="${height}">
          ${COLUMN_ARRAY.map((column) => {
            return svg`
              <g id="column-${column}">
                ${this._renderColumn(
                  column,
                  polygonWidth,
                  polygonHeight,
                  columnConfig
                )}
              </g>
            `;
          })}
        </svg>
        ${this._renderDraggedPiece()}
      </div>
    `;
  }

  override render() {
    return html` ${this._renderBoard(this.width ?? this.height, this.height)} `;
  }

  // --------------
  // Public methods
  // --------------

  /**
   * Converts to a hex-FEN notation describing the state of the board.
   */
  fen(): string {
    return boardToFen(this._currentPosition);
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
    if (this._currentMove === -1) {
      return;
    }

    const from = this._moves[this._currentMove][1];
    const to = this._moves[this._currentMove][0];
    this._applyMove(from, to);
    this._currentMove -= 1;
  }

  /**
   * Fast forwards one move to the next position.
   * If there are no next moves, this does nothing.
   */
  fastForward() {
    if (this._currentMove === this._moves.length - 1) {
      return;
    }

    this._currentMove += 1;
    const from = this._moves[this._currentMove][0];
    const to = this._moves[this._currentMove][1];
    this._applyMove(from, to);
  }

  /**
   * Prevent any more moves to the game.
   * Usually called when the game is over.
   */
  freeze() {
    this.frozen = true;
  }

  /**
   * Sets all legal moves for the current latest board configuration.
   * Useful if you want to offload legal move computation to a different chess engine,
   * or alternatively if you have a set of limited possibilities you want to explore.
   *
   * Without this, the component will do its best effort to compute legal moves on its own.
   */
  setLegalMoves(moves: Square[][]) {
    this._legalMoves = this._convertToLegalMoveMap(moves);
    this.requestUpdate('board');
  }

  /**
   * Make a move on the board.
   *
   * @returns Whether or not the move can be made.
   */
  move(
    from: Square,
    to: Square,
    newLegalMoves: Square[][] | undefined = undefined
  ): boolean {
    // No moves if board is frozen
    if (this.frozen) {
      return false;
    }

    // Cannot move if looking at an empty board
    if (Object.keys(this._currentPosition).length === 0) {
      return false;
    }

    // Cannot move if you're looking at a previous move
    if (this._currentMove !== this._moves.length - 1) {
      return false;
    }

    // Cannot move a piece that isn't there
    const fullBoard = this._currentPosition as FullBoard;
    if (!fullBoard[from]) {
      return false;
    }

    const isMovingWhitePiece =
      fullBoard[from] === fullBoard[from]?.toUpperCase();
    // Cannot move black pieces if it's white's turn
    if (this._turn % 2 === 0 && !isMovingWhitePiece) {
      return false;
    }
    // Cannot move white pieces if it's black's turn
    if (this._turn % 2 === 1 && isMovingWhitePiece) {
      return false;
    }

    // Cannot take a piece of the same color
    const isTargetingWhitePiece =
      fullBoard[to] === fullBoard[to]?.toUpperCase();
    if (fullBoard[to] !== null) {
      if (
        (isMovingWhitePiece && isTargetingWhitePiece) ||
        (!isMovingWhitePiece && !isTargetingWhitePiece)
      ) {
        return false;
      }
    }

    // Cannot capture a king
    if (fullBoard[to]?.toUpperCase() === 'K') {
      return false;
    }

    // Disallow illegal move
    if (this._legalMoves) {
      if (!(from in this._legalMoves)) {
        return false;
      }
      if (!this._legalMoves[from].has(to)) {
        return false;
      }
    }

    if (newLegalMoves) {
      this._legalMoves = this._convertToLegalMoveMap(newLegalMoves);
    }
    this._from = null;
    this._draggedPiece = null;
    this._moves.push([from, to]);
    this._currentMove += 1;
    this._turn += 1;
    this._applyMove(from, to);
    return true;
  }

  /**
   * Resets and unfreezes the board to the default start state.
   */
  reset() {
    this._currentPosition = JSON.parse(JSON.stringify(emptyBoard));
    this.frozen = false;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hexchess-board': HexchessBoard;
  }
}
