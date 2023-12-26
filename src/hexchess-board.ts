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

    .piece {
      fill: var(--hexchess-piece-bg, #000000);
      pointer-events: none;
    }

    .possible-move > polygon {
      fill: var(--hexchess-possible-move-bg, #a68a2d88);
    }

    .label {
      fill: var(--hexchess-label-bg, #ffffff);
      font-size: var(--hexchess-label-size, 12px);
      /* Disable user selection */
      /* https://stackoverflow.com/questions/826782/how-to-disable-text-selection-highlighting */
      -webkit-touch-callout: none; /* iOS Safari */
      -webkit-user-select: none; /* Safari */
      -khtml-user-select: none; /* Konqueror HTML */
      -moz-user-select: none; /* Old versions of Firefox */
      -ms-user-select: none; /* Internet Explorer/Edge */
      user-select: none; /* Non-prefixed version, currently supported by Chrome, Edge, Opera and Firefox */
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
  private _hexagonPoints: Record<Square, number[][]> = {} as Record<
    Square,
    number[][]
  >;
  private _lastKnownWidth: number | null = null;
  private _hexagonPointsAsString: Record<Square, string> = {} as Record<
    Square,
    string
  >;
  private _polygonWidth = 0;
  private _polygonHeight = 0;
  private _columnConfig: ColumnConfig = {} as ColumnConfig;
  private _offsets: Record<Square, [number, number]> = {} as Record<
    Square,
    [number, number]
  >;

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

  constructor() {
    super();
    if (!this.width) {
      this._lastKnownWidth = this.height;
    }
    this._recalculateBoardCoordinates(this.width ?? this.height, this.height);
  }

  // ---------------
  // Event listeners
  // ---------------

  private _handleMouseDown(event: MouseEvent | PointerEvent) {
    event.preventDefault();

    // Only primary button interactions
    if (event.button !== 0) {
      return;
    }

    // Ignore attempts at moving if not viewing the latest board state
    if (this._currentMove !== this._moves.length - 1) {
      return;
    }

    if (!this._hexagonPoints) {
      return;
    }

    const square = this._getSquareFromClick(event);
    if (square === null) {
      // Clicking outside the board should erase any previous clicks
      if (
        this._from !== null ||
        this._draggedPiece !== null ||
        this._draggedSquare !== null
      ) {
        this._from = null;
        this._draggedPiece = null;
        this._draggedSquare = null;
        this.requestUpdate('board');
      }
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
        // const deltaX = event.clientX - this._initialDragPosition!.x;
        // const deltaY = event.clientY - this._initialDragPosition!.y;
        // this._draggedDiv.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        this._draggedDiv.style.left = `${event.clientX}px`;
        this._draggedDiv.style.top = `${event.clientY}px`;
      }
      this._from = square;
      this.requestUpdate('board');
      return;
    }

    // Since this._from is not null, we know the user has clicked or dragged another piece

    // Now trying to click or drag on a different piece, erase the click entirely, or click to move
    if (square !== this._from) {
      if (Object.keys(this._currentPosition).length === 0) {
        this._from = null;
        this._draggedPiece = null;
        this._draggedSquare = null;
        this.requestUpdate('board');
        return;
      }

      // No piece is on this square - either the user is trying to move the piece here or erase the click
      const fullBoard = this._currentPosition as FullBoard;
      if (fullBoard[square] === null) {
        // Legal move, so we let the user make it
        if (
          this._legalMoves &&
          this._from in this._legalMoves &&
          this._legalMoves[this._from].has(square)
        ) {
          this.move(this._from, square);
          return;
        }

        // Erase the click
        this._from = null;
        this._draggedPiece = null;
        this._draggedSquare = null;
        this.requestUpdate('board');
        return;
      }

      // Clicking on an empty square - either making a move or erasing
      const piece = fullBoard[square];
      if (piece === null) {
        // Legal move, so we let the user make it
        if (
          this._legalMoves &&
          this._from in this._legalMoves &&
          this._legalMoves[this._from].has(square)
        ) {
          this.move(this._from, square);
          return;
        }

        // Illegal move, so we erase the click
        this._from = null;
        this._draggedPiece = null;
        this._draggedSquare = null;
        this.requestUpdate('board');
        return;
      }

      this._draggedPiece = piece;
      this._initialDragPosition = {x: event.clientX, y: event.clientY};
      if (this._draggedDiv) {
        // const deltaX = event.clientX - this._initialDragPosition!.x;
        // const deltaY = event.clientY - this._initialDragPosition!.y;
        // this._draggedDiv.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        this._draggedDiv.style.left = `${event.clientX}px`;
        this._draggedDiv.style.top = `${event.clientY}px`;
      }
      this._from = square;
      this.requestUpdate('board');
      return;
    }

    // User is clicking on the exact same piece they previously clicked on
    // They're either toggling it to be unselected or trying to drag/move it again
  }

  private _handleMouseEnter(square: Square) {
    if (!this._from || !this._draggedPiece || !this._draggedDiv) {
      return;
    }

    this._draggedSquare = square;
    this.requestUpdate('board');
  }

  private _handleMouseUp(event: MouseEvent | PointerEvent) {
    if (this._from === null) {
      this._draggedSquare = null;
      this._draggedPiece = null;
      this._from = null;
      this.requestUpdate('board');
      return;
    }

    if (this._legalMoves && !(this._from in this._legalMoves)) {
      this._draggedSquare = null;
      this._draggedPiece = null;
      this.requestUpdate('board');
      return;
    }

    const square = this._getSquareFromClick(event);
    if (square === null) {
      this._draggedSquare = null;
      this._draggedPiece = null;
      this.requestUpdate('board');
      return;
    }

    if (
      this._legalMoves &&
      this._from in this._legalMoves &&
      !this._legalMoves[this._from].has(square)
    ) {
      this._draggedPiece = null;
      this._draggedSquare = null;
      this.requestUpdate('board');
      return;
    }

    if (!this.move(this._from, square)) {
      this._draggedPiece = null;
      this._draggedSquare = null;
      this.requestUpdate('board');
    }
  }

  private _handleMouseMove(event: MouseEvent | PointerEvent) {
    if (!this._draggedPiece || !this._from || !this._draggedDiv) {
      this._draggedPiece = null;
      this._draggedSquare = null;
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
        ? baseOffset + this._polygonHeight * (numHexagons - (row - 1))
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
    this._polygonWidth = width / 12;
    this._polygonHeight = height / 12;
    this._columnConfig = this._calculateColumnConfig(width, height);
    for (const column of COLUMN_ARRAY) {
      const numHexagons = this._numberOfHexagons(column);
      for (let row = 1; row <= numHexagons; row++) {
        const square = `${column}${row}` as Square;
        const [xOffset, yOffset] = this._getOffsets(square, this._columnConfig);
        this._offsets[square] = [xOffset, yOffset];
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
    if (
      !this._currentPosition[square] ||
      (this._from === square && this._draggedSquare !== null)
    ) {
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

  private _renderColumn(column: Column) {
    const colors = this._columnConfig[column].colors;

    const numHexagons = this._numberOfHexagons(column);

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
          const square = `${column}${i + 1}` as Square;
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
              <g class="piece" transform="translate(${
                this._polygonWidth / 2 - 45 / 2
              },${this._polygonHeight / 2 - 45 / 2})">
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
    const cursorClass = this._draggedPiece ? 'cursor-grabbing' : 'cursor-grab';

    return html`
      <div
        class=${cursorClass}
        @pointerdown=${(event: MouseEvent | PointerEvent) =>
          this._handleMouseDown(event)}
        @pointerup=${(event: MouseEvent | PointerEvent) =>
          this._handleMouseUp(event)}
        @pointermove=${(event: MouseEvent) =>
          requestAnimationFrame(() => this._handleMouseMove(event))}
      >
        <svg width="${this.width}" height="${this.height}">
          ${COLUMN_ARRAY.map((column) => {
            return svg`${this._renderColumn(column)}`;
          })}
        </svg>
        ${this._renderDraggedPiece()}
      </div>
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
