import {BoardState, getNewState} from './board-state';
import {
  ANNOTATED_BLACK_SQUARES,
  ANNOTATED_WHITE_SQUARES,
  BLACK_COLUMN_LABEL_SQUARES,
  COLUMN_ARRAY,
  Orientation,
  WHITE_COLUMN_LABEL_SQUARES,
  emptyBoard,
  stringToMoves,
} from './utils';
import {LitElement, html, svg, nothing} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import {
  Board,
  Color,
  Column,
  ColumnConfig,
  PIECE_SIZE,
  Square,
  TileColor,
  boardToFen,
  fenToBoard,
} from './utils';
import {renderPiece} from './piece';
import {styles} from './hexchess-styles';

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
  static override styles = styles;

  private _state: BoardState = {
    board: emptyBoard,
    legalMoves: {},
    moves: [],
    name: 'WAITING',
    turn: 0,
  };
  @query('.drag-piece')
  private _draggedDiv?: HTMLDivElement;
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
    type: Object,
  })
  get board(): Board {
    return this._state.board;
  }

  set board(board: Board) {
    const oldValue = this._state.board;
    this._state.board = board;
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
    return this._state.moves;
  }

  set moves(moves: Square[][]) {
    const oldValue = this._state.moves;
    this._state.moves = moves;
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

    if (newState.didChange) {
      this._initialDragPosition = {x: event.clientX, y: event.clientY};
      this._state = newState.state;
      this.requestUpdate('board');
    }
  }

  private _handleMouseEnter(square: Square) {
    if (this._state.name !== 'DRAG_PIECE') {
      return;
    }

    const newState = getNewState(this._state, {
      name: 'MOUSE_MOVE_SQUARE',
      square,
    });
    if (newState.didChange) {
      this._state = newState.state;
      this.requestUpdate('board');
    }
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
    if (newState?.didChange) {
      this._state = newState.state;
      this.requestUpdate('board');
    }
  }

  private _handleMouseMove(event: MouseEvent | PointerEvent) {
    if (
      this._state.name !== 'DRAG_PIECE' &&
      this._state.name !== 'MOUSE_DOWN_PIECE_SELECTED'
    ) {
      return;
    }

    const deltaX = event.clientX - this._initialDragPosition!.x;
    const deltaY = event.clientY - this._initialDragPosition!.y;
    if (this._draggedDiv) {
      this._draggedDiv.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
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

    if (newState.didChange) {
      this._state = newState.state;
      this.requestUpdate('board');
    }
  }

  // ----------------------
  // Private helper methods
  // ----------------------

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

  // -----------------
  // Rendering methods
  // -----------------

  private _renderDraggedPiece() {
    const stateName = this._state.name;
    if (stateName !== 'DRAG_PIECE') {
      return nothing;
    }
    const piece = renderPiece(this._state.selectedPiece, PIECE_SIZE);
    return html`<div class="drag-piece">${piece}</div>`;
  }

  private _renderPiece(column: Column, row: number, size: number) {
    const square = `${column}${row}` as keyof Board;
    if (!(square in this._state.board) || this._state.board[square] === null) {
      return nothing;
    }
    if (this._state.name === 'DRAG_PIECE' && this._state.square === square) {
      return nothing;
    }
    return renderPiece(this._state.board[square]!, size);
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
      this._state.name === 'MOUSE_DOWN_PIECE_SELECTED'
        ? 'cursor-grabbing'
        : 'cursor-grab';

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
    return boardToFen(this._state.board);
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
    if (newState.didChange) {
      this._state = newState.state;
      this.requestUpdate('board');
    }
  }

  /**
   * Fast forwards one move to the next position.
   * If there are no next moves, this does nothing.
   */
  fastForward() {
    const newState = getNewState(this._state, {name: 'FAST_FORWARD'});
    if (newState.didChange) {
      this._state = newState.state;
      this.requestUpdate('board');
    }
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
    this._state.legalMoves = this._convertToLegalMoveMap(moves);
    this.requestUpdate('board');
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
    if (newState.didChange) {
      this._state = newState.state;
      this.requestUpdate('board');
    }
    return newState.didChange;
  }

  /**
   * Resets and unfreezes the board to the default start state.
   */
  reset() {
    this._state = {
      name: 'WAITING',
      board: JSON.parse(JSON.stringify(emptyBoard)),
      moves: [],
      legalMoves: {},
      turn: 0,
    };
    this.frozen = false;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hexchess-board': HexchessBoard;
  }
}
