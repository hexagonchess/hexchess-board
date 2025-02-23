import {
  LitElement,
  PropertyValues,
  TemplateResult,
  html,
  nothing,
  svg,
} from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Board } from './board';
import {
  BoardChange,
  BoardState,
  BoardStateMachine,
  CancelSelectionSoonState,
  DragPieceState,
  MouseDownPieceSelected,
  RewoundState,
  WaitingState,
} from './board-state';
import { Game } from './game';
import { styles } from './hexchess-styles';
import { DEFAULT_PIECE_SIZE, renderPiece } from './piece';
import { Color, Move, Orientation, Piece, Role, TileColor } from './types';
import {
  ALL_SQUARES,
  ANNOTATED_BLACK_SQUARES,
  ANNOTATED_WHITE_SQUARES,
  BLACK_COLUMN_LABEL_SQUARES,
  COLUMN_ARRAY,
  WHITE_COLUMN_LABEL_SQUARES,
  movesToString,
  stringToMoves,
} from './utils';
import { Column, ColumnConfig, Square, boardToFen, fenToBoard } from './utils';

/**
 * A hexagonal chess board used for playing Glinsky-style hex chess.
 *
 * Player variables
 * @cssprop [--hexchess-playername-size=1.4rem]                - The font size of the player names.
 * @cssprop [--hexchess-playername-color=black]                - The color of the player names.
 *
 * Board variables
 * @cssprop [--hexchess-board-bg=#ffffff]                      - The background color of the whitespace of the board (not tiles).
 * @cssprop [--hexchess-white-bg=#a5c8df]                      - The background color of the white tiles.
 * @cssprop [--hexchess-selected-white-bg=#a96a41]             - The background color of a white tile that's selected to be moved.
 * @cssprop [--hexchess-black-bg=#4180a9]                      - The background color of the black tiles.
 * @cssprop [--hexchess-selected-black-bg=#a96a41]             - The background color of a black tile that's selected to be moved.
 * @cssprop [--hexchess-grey-bg=#80b1d0]                       - The background color of the grey tiles.
 * @cssprop [--hexchess-selected-grey-bg=#a96a41]              - The background color of a grey tile that's selected to be moved.
 * @cssprop [--hexchess-label-bg=#ffffff]                      - The background color of the column and row labels.
 * @cssprop [--hexchess-label-size=12px]                       - The font size of the column and row labels.
 * @cssprop [--hexchess-possible-move-bg=#e4c7b7]              - The fill color of the small dot shown on a hexagon indicating this is a legal move.
 * @cssprop [--hexchess-possible-move-opponent-bg=#e3e3e3]     - The fill color of the small dot shown on a hexagon indicating this is a move an opponent piece can make.
 * @cssprop [--hexchess-possible-capture-bg=#e4c7b7]           - The stroke color of the large circle outlining a piece that can be captured.
 * @cssprop [--hexchess-possible-move-stroke-white=#e4c7b7]    - The outline color of a hexagon when the user drags over a white square, trying to move there.
 * @cssprop [--hexchess-possible-move-stroke-grey=#e4c7b7]     - The outline color of a hexagon when the user drags over a grey square, trying to move there.
 * @cssprop [--hexchess-possible-move-stroke-black=#e4c7b7]    - The outline color of a hexagon when the user drags over a black square, trying to move there.
 * @cssprop [--hexchess-possible-move-stroke-opponent=#e3e3e3] - The outline of a square when dragging an opponent piece to a possible move.
 *
 * Custom events
 * @fires gameover        - Fired when the game is over.
 * @fires move            - Fired when a move is made on the board.
 * @fires promoting       - Fired when a pawn is ready to promote.
 * @fires promoted        - Fired when a pawn has been promoted to a piece.
 * @fires furthestback    - Fired when the game is rewound to its starting position.
 * @fires furthestforward - Fired when a game is fast forwarded back to its current position.
 */
@customElement('hexchess-board')
export class HexchessBoard extends LitElement {
  static override styles = styles;

  private _boardHeight = 250;
  private _boardWidth = 250;
  private _capturedPieceSize = 0;
  private _capturedPiecePadding = 0.2;
  private _capturedPieceGroupPadding = 1;
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
  private _pieceSize = DEFAULT_PIECE_SIZE;
  private _polygonWidth = 29;
  private _polygonHeight = 22;
  private _originalDragPosition: { x: number; y: number } | null = null;
  private _originalTurn: 'white' | 'black' = 'white';
  private _originalBoard: Board | undefined = undefined;
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
  private _stateMachine = new BoardStateMachine(
    () => this._emitFurthestBack(),
    () => this._emitFurthestForward(),
  );
  private _customEventsPaused = false;

  // -----------------
  // Public properties
  // -----------------

  /**
   * Whose turn it is initially
   */
  @property({
    converter: (value: string | null | undefined): 'white' | 'black' =>
      value === 'black' ? 'black' : 'white',
    type: String,
  })
  get turn(): string {
    return this._state.game.turn % 2 === 0 ? 'white' : 'black';
  }

  set turn(turn: 'white' | 'black') {
    this._originalTurn = turn;
    this._state.game = new Game(
      this._state.game.board,
      turn === 'white' ? 0 : 1,
    );
  }

  /**
   * A hex-FEN notation describing the state of the board.
   * If the string is empty, no pieces will be rendered.
   */
  @property({
    converter: (value: string | null | undefined): Board =>
      fenToBoard(value ?? ''),
    type: Object,
  })
  get board(): Board {
    return this._state.game.board;
  }

  set board(board: Board) {
    this._originalBoard = board;

    const emptyBoard = Board.empty();
    for (const square of ALL_SQUARES) {
      const piece = board.getPiece(square);
      if (piece) {
        emptyBoard.addPieceFromString(square, piece.toString() as Piece);
      }
    }

    const turn = this._originalTurn === 'white' ? 0 : 1;
    const newGame = new Game(emptyBoard, turn);
    this._state.game = newGame;
    this._state.moves = [];
    (this._state as WaitingState).legalMoves = newGame.allLegalMoves();
    this.requestUpdate('board');
  }

  /**
   * A list of moves made on the board.
   * This is useful for analyzing games already played or certain pre-determined openings.
   */
  @property({
    converter: (value: string | null | undefined): Move[] =>
      stringToMoves(value ?? ''),
    type: Array,
  })
  get moves(): Move[] {
    return this._state.moves;
  }

  set moves(moves: Move[]) {
    for (const move of moves) {
      const newState = this._stateMachine.getNewState(this._state, {
        name: 'PROGRAMMATIC_MOVE',
        move: [move.from, move.to],
      });
      this._reconcileNewState(newState);
      if (move.promotion) {
        const newState = this._stateMachine.getNewState(this._state, {
          name: 'PROMOTE',
          piece: move.promotion,
        });
        this._reconcileNewState(newState);
      }
    }
    for (let i = 0; i < moves.length; i++) {
      const newState = this._stateMachine.getNewState(this._state, {
        name: 'REWIND',
      });
      this._reconcileNewState(newState);
    }
    this.requestUpdate('board');
  }

  /**
   * Black's player name
   */
  @property({ attribute: 'black-player-name', type: String })
  blackPlayerName = 'Black';

  /**
   * White's player name
   */
  @property({ attribute: 'white-player-name', type: String })
  whitePlayerName = 'White';

  /**
   * The orientation of the board.
   */
  @property({
    converter: (value: string | null | undefined): 'black' | 'white' =>
      value === 'black' ? 'black' : 'white',
  })
  orientation: Orientation = 'white';

  /**
   * The role of the player.
   * If `white`, you can only make moves when it is white's turn.
   * If `black`, you can only make moves when it is black's turn.
   * If `spectator`, then you cannot make moves at all via the UI.
   * If `analyzer`, then you can make moves for both sides, and it simuluates a local game.
   */
  @property({
    attribute: 'player-role',
    converter: (value: string | null | undefined): Role => {
      if (value === 'white' || value === 'black' || value === 'spectator') {
        return value;
      }

      return 'analyzer';
    },
  })
  playerRole: Role = 'analyzer';

  /**
   * Show the board coordinates on the bottom and left sides of the board.
   */
  @property({ attribute: 'hide-coordinates', type: Boolean })
  hideCoordinates = false;

  /**
   * Do not allow any other moves beyond the predetermined ones set in the `moves` property.
   */
  @property({ type: Boolean })
  frozen = false;

  /**
   * Clicking on an opponent's piece shows all the squares it can move to
   */
  @property({ attribute: 'show-hints', type: Boolean })
  showHints = true;

  /**
   * Hide player names - usually only used for custom websites to render player names separately.
   */
  @property({ attribute: 'hide-playernames', type: Boolean })
  hidePlayerNames = false;

  /**
   * Hide captured pieces - usually only used for custom websites to render captured pieces separately.
   */
  @property({ attribute: 'hide-capturedpieces', type: Boolean })
  hideCapturedPieces = false;

  constructor() {
    super();
    this._recalculateBoardCoordinates();
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

  protected override firstUpdated(_changedProperties: PropertyValues): void {
    this.resize();
  }

  private _handlePromotion(piece: Omit<Piece, 'p' | 'P' | 'k' | 'K'>) {
    const newState = this._stateMachine.getNewState(this._state, {
      name: 'PROMOTE',
      piece,
    });
    this._reconcileNewState(newState);
  }

  private _handleMouseDown(event: MouseEvent | PointerEvent) {
    event.preventDefault();
    if (this.frozen || this.playerRole === 'spectator') {
      return;
    }

    // Only primary button interactions
    if (event.button !== 0) {
      return;
    }

    if (!this._hexagonPoints) {
      return;
    }

    if (this.playerRole === 'white' && this._state.game.turn % 2 !== 0) {
      return;
    }

    if (this.playerRole === 'black' && this._state.game.turn % 2 !== 1) {
      return;
    }

    const square = this._getSquareFromClick(event);
    let newState: BoardChange;
    if (square === null) {
      newState = this._stateMachine.getNewState(this._state, {
        name: 'MOUSE_DOWN_OUTSIDE_BOARD',
      });
    } else {
      newState = this._stateMachine.getNewState(this._state, {
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
    if (this._state.name !== 'DRAG_PIECE' || this.frozen) {
      return;
    }

    const newState = this._stateMachine.getNewState(this._state, {
      name: 'MOUSE_MOVE_SQUARE',
      square,
    });
    this._reconcileNewState(newState);
  }

  private _handleMouseUp(event: MouseEvent | PointerEvent) {
    if (this.frozen) {
      return;
    }

    const square = this._getSquareFromClick(event);
    let newState: BoardChange;
    if (!square) {
      newState = this._stateMachine.getNewState(this._state, {
        name: 'MOUSE_UP_OUTSIDE_BOARD',
      });
    } else {
      newState = this._stateMachine.getNewState(this._state, {
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
          'drag-piece',
        );
        this._draggedPiece.classList.add(
          `piece-${
            (
              newState.state as
                | MouseDownPieceSelected
                | DragPieceState
                | CancelSelectionSoonState
            ).square
          }`,
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

    if (this.frozen) {
      return;
    }

    if (this._draggedPiece) {
      if (
        !this._originalDragPosition ||
        !this._originalDragPosition.x ||
        !this._originalDragPosition.y
      ) {
        throw new Error('Cannot drag when originalDragPosition is not defined');
      }
      const deltaX = event.clientX - this._originalDragPosition.x;
      const deltaY = event.clientY - this._originalDragPosition.y;
      this._draggedPiece.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    }

    const square = this._getSquareFromClick(event);
    let newState: BoardChange;
    if (square) {
      newState = this._stateMachine.getNewState(this._state, {
        name: 'MOUSE_MOVE_SQUARE',
        square,
      });
    } else {
      newState = this._stateMachine.getNewState(this._state, {
        name: 'MOUSE_MOVE_OUTSIDE_BOARD',
      });
    }

    this._reconcileNewState(newState);
  }

  // ----------------------
  // Private helper methods
  // ----------------------

  private _reconcileNewState(newState: BoardChange) {
    if (!newState.didChange) {
      return;
    }
    if (newState.state.name !== 'REWOUND') {
      if (
        newState.state.name === 'PROMOTING' &&
        this._state.name !== 'PROMOTING'
      ) {
        const move = newState.state.moves[newState.state.moves.length - 1];
        if (!this._customEventsPaused) {
          this.dispatchEvent(
            new CustomEvent('promoting', {
              detail: {
                from: move.from,
                to: move.to,
                isCapture: !!move.capturedPiece,
              },
            }),
          );
        }
      } else if (
        this._state.name === 'PROMOTING' &&
        newState.state.name !== 'PROMOTING'
      ) {
        const move = newState.state.moves[newState.state.moves.length - 1];
        if (!this._customEventsPaused) {
          this.dispatchEvent(
            new CustomEvent('promoted', {
              detail: { piece: move.promotion },
            }),
          );
        }
      } else if (newState.state.name === 'GAMEOVER') {
        if (!this._customEventsPaused) {
          this.dispatchEvent(
            new CustomEvent('gameover', {
              detail: { outcome: newState.state.outcome },
            }),
          );
        }
      } else if (newState.state.moves.length > this._state.moves.length) {
        const move = newState.state.moves[newState.state.moves.length - 1];
        const piece = this.board.getPiece(move.to);
        if (!this._customEventsPaused) {
          this.dispatchEvent(
            new CustomEvent('move', {
              detail: {
                move: movesToString([move]),
                isCapture: !!move.capturedPiece,
                piece: piece?.toString(),
              },
            }),
          );
        }
      }
    }
    this._state = newState.state;
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
    height: number,
  ): string {
    const quarterWidth = width / 4;
    const threeQuarterWidth = quarterWidth * 3;
    const halfHeight = height / 2;
    return `${quarterWidth},0 ${threeQuarterWidth},0 ${width},${halfHeight} ${threeQuarterWidth},${height} ${quarterWidth},${height} 0,${halfHeight}`;
  }

  private _calculateColumnConfig(
    boardWidth: number,
    boardHeight: number,
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
        L: { x: offsetAX, y: offsetAY, colors: blackStart },
        K: { x: offsetBX, y: offsetBY, colors: greyStart },
        I: { x: offsetCX, y: offsetCY, colors: whiteStart },
        H: { x: offsetDX, y: offsetDY, colors: blackStart },
        G: { x: offsetEX, y: offsetEY, colors: greyStart },
        F: { x: offsetFX, y: offsetFY, colors: whiteStart },
        E: { x: offsetGX, y: offsetGY, colors: greyStart },
        D: { x: offsetHX, y: offsetHY, colors: blackStart },
        C: { x: offsetIX, y: offsetIY, colors: whiteStart },
        B: { x: offsetKX, y: offsetKY, colors: greyStart },
        A: { x: offsetLX, y: offsetLY, colors: blackStart },
      };
    }

    return {
      A: { x: offsetAX, y: offsetAY, colors: blackStart },
      B: { x: offsetBX, y: offsetBY, colors: greyStart },
      C: { x: offsetCX, y: offsetCY, colors: whiteStart },
      D: { x: offsetDX, y: offsetDY, colors: blackStart },
      E: { x: offsetEX, y: offsetEY, colors: greyStart },
      F: { x: offsetFX, y: offsetFY, colors: whiteStart },
      G: { x: offsetGX, y: offsetGY, colors: greyStart },
      H: { x: offsetHX, y: offsetHY, colors: blackStart },
      I: { x: offsetIX, y: offsetIY, colors: whiteStart },
      K: { x: offsetKX, y: offsetKY, colors: greyStart },
      L: { x: offsetLX, y: offsetLY, colors: blackStart },
    };
  }

  private _calculateSquareCenters(
    columnConfig: ColumnConfig,
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

  private _recalculateBoardCoordinates() {
    this._boardWidth = Math.max(this.offsetWidth, 250);
    this._boardHeight = Math.max(this.offsetHeight, 250);
    this._polygonWidth = Math.max(this._boardWidth / 8.5, 10);
    this._polygonHeight = Math.max(this._boardHeight / 11, 10);
    this._columnConfig = this._calculateColumnConfig(
      this._boardWidth,
      this._boardHeight,
    );
    this._squareCenters = this._calculateSquareCenters(this._columnConfig);
    this._capturedPieceSize = Math.floor(this._columnConfig.E.x / 10);
    for (const column of COLUMN_ARRAY) {
      const numHexagons = this._numberOfHexagons(column);
      for (let row = 1; row <= numHexagons; row++) {
        const square = `${column}${row}` as Square;
        const [xOffset, yOffset] = this._getOffsets(square, this._columnConfig);
        this._hexagonPoints[square] = this._calculateHexagonPoints(
          this._polygonWidth,
          this._polygonHeight,
        ).map((point) => [point[0] + xOffset, point[1] + yOffset]);
        this._hexagonPointsAsString[square] =
          this._calculateHexagonPointsAsString(
            this._polygonWidth,
            this._polygonHeight,
          );
      }
    }
  }

  private _getColorForSquare(square: Square): TileColor {
    const colors = this._columnConfig[square[0] as Column].colors;
    const number = parseInt(square.slice(1));
    return number % 3 === 0
      ? colors[0]
      : number % 3 === 1
        ? colors[1]
        : colors[2];
  }

  // -----------------
  // Rendering methods
  // -----------------

  private _renderPromotionOptions() {
    if (this._state.name !== 'PROMOTING') {
      return nothing;
    }

    const square = this._state.moves[this._state.moves.length - 1].to;
    const column = square[0] as Column;
    const isWhite = this._state.game.turn % 2 === 0;
    const isTop =
      (this._state.game.turn % 2 === 0 && this.orientation === 'white') ||
      (this._state.game.turn % 2 === 1 && this.orientation === 'black');
    const x = this._columnConfig[column].x;
    const y = isTop
      ? this._columnConfig[column].y
      : this._columnConfig[column].y +
        this._polygonHeight * (this._numberOfHexagons(column) - 4);

    const options: Piece[] =
      isWhite && isTop
        ? ['Q', 'R', 'B', 'N']
        : isWhite && !isTop
          ? ['N', 'B', 'R', 'Q']
          : !isWhite && isTop
            ? ['q', 'r', 'b', 'n']
            : ['n', 'b', 'r', 'q'];

    return html`
      <div class="promotion" style="top: ${y}px; left: ${x}px;">
        ${options.map((option) => {
          return html`
            <div
              class="hexagon"
              style="width: ${this._polygonWidth}px; height: ${
                this._polygonHeight
              }px; background-color: var(--hexchess-board-bg, #fcfaf2);"
              @click=${() => this._handlePromotion(option)}
            >
              ${renderPiece(option, this._pieceSize, false)}
            </div>
          `;
        })}
      </div>
    `;
  }

  private _renderScore(score: number | undefined) {
    if (!score) {
      return nothing;
    }

    if (score === 0 || score < 0) {
      return nothing;
    }

    return html`<p class="score">(+${score})</p>`;
  }

  private _renderCapturedPieceGroup(
    piece: Piece,
    numPieces: number,
    capturedPieceSize: number,
  ) {
    return html`
      <div class="captured-piece-group">
        ${[...Array(numPieces).keys()].map((numPiece) => {
          const padding =
            numPiece * capturedPieceSize * this._capturedPiecePadding;
          return html`
            <div style="position: relative; left: ${padding}px">
              ${renderPiece(piece, capturedPieceSize)}
            </div>
          `;
        })}
      </div>
    `;
  }

  private _renderOneSideCapturedPieces(
    pieces: Partial<Record<Piece, number>>,
    score: number,
  ) {
    if (this.hideCapturedPieces) {
      return nothing;
    }

    const pawn = 'p' in pieces ? 'p' : 'P' in pieces ? 'P' : undefined;
    const bishop = 'b' in pieces ? 'b' : 'B' in pieces ? 'B' : undefined;
    const knight = 'n' in pieces ? 'n' : 'N' in pieces ? 'N' : undefined;
    const rook = 'r' in pieces ? 'r' : 'R' in pieces ? 'R' : undefined;
    const queen = 'q' in pieces ? 'q' : 'Q' in pieces ? 'Q' : undefined;

    const capturedPawns = pawn
      ? this._renderCapturedPieceGroup(
          pawn,
          pieces[pawn] as number,
          this._capturedPieceSize,
        )
      : nothing;
    const capturedBishops = bishop
      ? this._renderCapturedPieceGroup(
          bishop,
          pieces[bishop] as number,
          this._capturedPieceSize,
        )
      : nothing;
    const capturedKnights = knight
      ? this._renderCapturedPieceGroup(
          knight,
          pieces[knight] as number,
          this._capturedPieceSize,
        )
      : nothing;
    const capturedRooks = rook
      ? this._renderCapturedPieceGroup(
          rook,
          pieces[rook] as number,
          this._capturedPieceSize,
        )
      : nothing;
    const capturedQueens = queen
      ? this._renderCapturedPieceGroup(
          queen,
          pieces[queen] as number,
          this._capturedPieceSize,
        )
      : nothing;

    return html`
      <div
        class="captured-pieces"
        style="column-gap: ${
          this._capturedPieceSize * this._capturedPieceGroupPadding
        }px;"
      >
        ${capturedPawns} ${capturedBishops} ${capturedKnights} ${capturedRooks}
        ${capturedQueens} ${this._renderScore(score)}
      </div>
    `;
  }

  private _renderPlayer(name: string, isWhite: boolean) {
    if (this.hidePlayerNames) {
      return nothing;
    }

    let outcome = '';
    if (this._state.name === 'GAMEOVER') {
      if (this._state.outcome === 'DRAW') {
        outcome = '🤝';
      } else if (this._state.outcome === 'WHITE_WINS') {
        if (isWhite) {
          outcome = '🏆';
        } else {
          outcome = '🏳️';
        }
      } else {
        if (isWhite) {
          outcome = '🏳️';
        } else {
          outcome = '🏆';
        }
      }
    }
    return html`<p class="username">${name} ${outcome}</p>`;
  }

  private _renderGameInfo() {
    const isOrientationWhite = this.orientation === 'white';

    const whitePieceKeys = Object.keys(this._state.capturedPieces).filter(
      (letter) => letter.toUpperCase() === letter,
    );
    const blackPieceKeys = Object.keys(this._state.capturedPieces).filter(
      (letter) => letter.toLowerCase() === letter,
    );

    const whitePieces = whitePieceKeys.reduce(
      (acc, piece) => {
        const p = piece as Piece;
        acc[p] = this._state.capturedPieces[p];
        return acc;
      },
      {} as Partial<Record<Piece, number>>,
    );

    const blackPieces = blackPieceKeys.reduce(
      (acc, piece) => {
        const p = piece as Piece;
        acc[p] = this._state.capturedPieces[p];
        return acc;
      },
      {} as Partial<Record<Piece, number>>,
    );

    const whiteScore = this._state.scoreWhite - this._state.scoreBlack;
    const blackScore = this._state.scoreBlack - this._state.scoreWhite;

    return html`
      <div
        class="player-info"
        style="row-gap: ${this._capturedPieceSize / 2}px;"
      >
        ${this._renderPlayer(
          isOrientationWhite ? this.blackPlayerName : this.whitePlayerName,
          !isOrientationWhite,
        )}
        ${this._renderOneSideCapturedPieces(
          isOrientationWhite ? whitePieces : blackPieces,
          isOrientationWhite ? blackScore : whiteScore,
        )}
      </div>
      <div
        class="player-info"
        style="row-gap: ${this._capturedPieceSize / 2}px"
      >
        ${this._renderOneSideCapturedPieces(
          isOrientationWhite ? blackPieces : whitePieces,
          isOrientationWhite ? whiteScore : blackScore,
        )}
        ${this._renderPlayer(
          isOrientationWhite ? this.whitePlayerName : this.blackPlayerName,
          isOrientationWhite,
        )}
      </div>
    `;
  }

  private _renderPiece(square: Square) {
    if (
      !(square in this._state.game.board.pieces) ||
      this._state.game.board.getPiece(square) === null
    ) {
      return nothing;
    }
    const piece = this._state.game.board.getPiece(square);
    if (!piece) {
      throw new Error('This is impossible');
    }
    const pos = this._squareCenters?.[square];
    if (!pos) {
      throw new Error('This is impossible');
    }
    return html`
      <div style="left: ${pos[0]}px; top: ${
        pos[1]
      }px" class="piece piece-${square}">
        ${renderPiece(piece.toString(), this._pieceSize)}
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
    polygonHeight: number,
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
    const numHexagons = this._numberOfHexagons(column);

    return svg`
      <g id="column-${column}">
        ${[...Array(numHexagons).keys()].map((i) => {
          // Helper methods
          const square = `${column}${i + 1}` as Square;

          // Base background color, except for classes defined below
          const color = this._getColorForSquare(square);

          // Rendering classes
          const isRecentFrom =
            this._state.name !== 'REWOUND' &&
            this._state.moves.length > 0 &&
            this._state.moves[this._state.moves.length - 1].from === square;
          const isRecentTo =
            this._state.name !== 'REWOUND' &&
            this._state.moves.length > 0 &&
            this._state.moves[this._state.moves.length - 1].to === square;
          const isSelected =
            this._state.name !== 'WAITING' &&
            this._state.name !== 'REWOUND' &&
            this._state.name !== 'PROMOTING' &&
            this._state.name !== 'GAMEOVER' &&
            this._state.square === square;
          const wasMostRecentMove =
            this._state.name !== 'REWOUND' &&
            this._state.moves.length > 0 &&
            (this._state.moves[this._state.moves.length - 1].to === square ||
              this._state.moves[this._state.moves.length - 1].from === square);
          const canHaveOpponentMove =
            this._state.name !== 'WAITING' &&
            this._state.name !== 'REWOUND' &&
            this._state.name !== 'PROMOTING' &&
            this._state.name !== 'GAMEOVER' &&
            this._state.opponentPieceMoves;
          const selectedClass =
            isSelected || isRecentFrom || isRecentTo
              ? canHaveOpponentMove && !wasMostRecentMove
                ? 'selected-opponent'
                : 'selected'
              : '';

          // Offsets
          const offset = this._getOffsets(square, this._columnConfig);
          return svg`
            <g
              @pointerenter=${() => this._handleMouseEnter(square)}
              class=${selectedClass}
              data-square=${square}
              transform="translate(${offset[0]},${offset[1]})"
            >
              ${this._renderHexagon(
                this._polygonWidth,
                this._polygonHeight,
                color,
              )}
              ${this._renderDot(
                this._polygonWidth,
                this._polygonHeight,
                column,
                i + 1,
              )}
              ${this._renderColumnLabel(
                column,
                i + 1,
                this._polygonWidth,
                this._polygonHeight,
              )}
              ${this._renderCoordinate(column, i + 1, this._polygonWidth)}
            </g>
          `;
        })}
      </g>
    `;
  }

  private _renderPossibleMove() {
    if (this._state.name !== 'DRAG_PIECE') {
      return nothing;
    }

    if (this._state.dragSquare === this._state.square) {
      return nothing;
    }

    const offset = this._getOffsets(this._state.dragSquare, this._columnConfig);
    const classBg:
      | 'possible-move-opponent'
      | 'possible-move-grey'
      | 'possible-move-white'
      | 'possible-move-black' = this._state.opponentPieceMoves
      ? 'possible-move-opponent'
      : `possible-move-${this._getColorForSquare(this._state.dragSquare)}`;
    return svg`
      <g
        transform="translate(${offset[0]},${offset[1]})"
      >
        ${this._renderHexagon(this._polygonWidth, this._polygonHeight, classBg)}
      </g>
    `;
  }

  private _renderDot(
    width: number,
    height: number,
    column: Column,
    row: number,
  ) {
    if (
      this._state.name === 'WAITING' ||
      this._state.name === 'REWOUND' ||
      this._state.name === 'PROMOTING' ||
      this._state.name === 'GAMEOVER'
    ) {
      return nothing;
    }

    const square = `${column}${row}` as Square;
    if (this._state.square === square) {
      return nothing;
    }
    if (
      (!this._state.opponentPieceMoves ||
        !this._state.opponentPieceMoves.includes(square)) &&
      !this._state.legalMoves[this._state.square]?.has(square)
    ) {
      return nothing;
    }

    if (this._state.game.board.getPiece(square) !== null) {
      return svg`<circle
        class="possible-capture"
        cx=${width / 2}
        cy=${height / 2}
        r=${Math.min(this._polygonHeight, this._polygonWidth) / 2.2} />
      `;
    }

    const radius = Math.min(this._polygonHeight, this._polygonWidth) / 6;
    const classBg = this._state.opponentPieceMoves
      ? 'opponent-move'
      : 'possible-move';
    return svg`<circle
      cx=${width / 2}
      cy=${height / 2}
      r=${radius}
      class=${classBg} />`;
  }

  private _renderHexagon(
    width: number,
    height: number,
    className:
      | TileColor
      | 'possible-move-white'
      | 'possible-move-black'
      | 'possible-move-grey'
      | 'possible-move-opponent',
  ) {
    return svg`<polygon
      points=${this._calculateHexagonPointsAsString(width, height)}
      class="${className}" />`;
  }

  private _renderBoard() {
    const cursorClass =
      this._state.name === 'DRAG_PIECE' ||
      this._state.name === 'MOUSE_DOWN_PIECE_SELECTED' ||
      this._state.name === 'CANCEL_SELECTION_SOON'
        ? 'cursor-grabbing'
        : 'cursor-grab';

    return html`
      <div id="root" style="width: 100%; height: 100%; position: relative;">
        <svg
          width="100%"
          height="100%"
          viewbox="0 0 ${this._boardWidth} ${this._boardHeight}"
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
          ${this._renderPossibleMove()}
        </svg>
        <div>${this._renderPieces()}</div>
        <div class="game-info" style="padding-left: 17px">
          ${this._renderGameInfo()}
        </div>
        ${this._renderPromotionOptions()}
      </div>
    `;
  }

  private _emitFurthestBack() {
    if (!this._customEventsPaused) {
      this.dispatchEvent(new CustomEvent('furthestback'));
    }
  }

  private _emitFurthestForward() {
    if (!this._customEventsPaused) {
      this.dispatchEvent(new CustomEvent('furthestforward'));
    }
  }

  override render(): TemplateResult {
    return html` ${this._renderBoard()} `;
  }

  // --------------
  // Public methods
  // --------------

  /**
   * Exports the current game to a CSV list of moves that can be fed back into this same component.
   */
  export(): string {
    return movesToString(this._state.moves);
  }

  /**
   * Converts to a hex-FEN notation describing the state of the board.
   * Includes the positions of all the pieces along with whose turn it is.
   */
  fen(): string {
    const pureFen = boardToFen(this._state.game.board);
    const isWhiteTurn = this._state.game.turn % 2 === 0;
    return `${isWhiteTurn ? 'WHITE' : 'BLACK'};${pureFen}`;
  }

  /**
   * Flip the orientation of the board.
   */
  flip(): void {
    if (this.orientation === 'white') {
      this.orientation = 'black';
    } else {
      this.orientation = 'white';
    }
    this._recalculateBoardCoordinates();
    this.requestUpdate('board');
  }

  /**
   * Resize the board based on the latest dimensions given to the shadow root.
   */
  resize(): void {
    this._recalculateBoardCoordinates();
    this._pieceSize = Math.min(this._polygonWidth, this._polygonHeight) * 0.8;
    this.requestUpdate('board');
  }

  /**
   * Rewinds one move to a previous position.
   * If there are no previous moves, this does nothing.
   */
  rewind(): void {
    const newState = this._stateMachine.getNewState(this._state, {
      name: 'REWIND',
    });
    this._reconcileNewState(newState);
  }

  /**
   * Rewinds all moves until the starting position of the board is reached.
   */
  rewindAll(): void {
    if (this._state.name !== 'REWOUND') {
      this.rewind();
    }
    for (let i = (this._state as RewoundState).currentTurn; i > 0; i--) {
      this.rewind();
    }
  }

  /**
   * Fast forwards one move to the next position.
   * If there are no next moves, this does nothing.
   */
  fastForward(): void {
    const newState = this._stateMachine.getNewState(this._state, {
      name: 'FAST_FORWARD',
    });
    this._reconcileNewState(newState);
  }

  /**
   * Fast forwards all moves until the current state of the board is reached.
   */
  fastForwardAll(): void {
    if (this._state.name !== 'REWOUND') {
      return;
    }
    for (
      let i = (this._state as RewoundState).currentTurn;
      i < this.moves.length;
      i++
    ) {
      this.fastForward();
    }
  }

  /**
   * Prevent any more moves to the game.
   * Usually called when the game is over.
   */
  freeze(): void {
    this.frozen = true;
  }

  /**
   * Unfreeze the board and re-enable moves to be made.
   */
  unfreeze(): void {
    this.frozen = false;
  }

  /**
   * Make a move on the board.
   *
   * @returns Whether or not the move can be made.
   */
  move(from: string): boolean;
  move(from: Square, to: Square): boolean;
  move(arg: string | Square, to?: Square): boolean {
    // No moves if board is frozen
    if (this.frozen) {
      console.error('The board is currently frozen.');
      return false;
    }

    if (typeof arg !== 'string') {
      console.error('`arg` must be a string');
      return false;
    }

    if (to === undefined) {
      try {
        const newMove = stringToMoves(arg);
        if (newMove.length !== 1) {
          console.error('Please provide only 1 move at a time.');
          return false;
        }
        const newState = this._stateMachine.getNewState(this._state, {
          name: 'PROGRAMMATIC_MOVE',
          move: [newMove[0].from, newMove[0].to],
        });
        this._reconcileNewState(newState);
        return newState.didChange;
      } catch (error) {
        console.error('Invalid FEN format move.');
        return false;
      }
    }

    if (!ALL_SQUARES.includes(to as Square)) {
      console.error(`${to} is not a valid square.`);
      return false;
    }

    const newState = this._stateMachine.getNewState(this._state, {
      name: 'PROGRAMMATIC_MOVE',
      move: [arg as Square, to as Square],
    });
    this._reconcileNewState(newState);
    return newState.didChange;
  }

  /**
   * Promote a pawn.
   * @returns Whether or not the promotion is valid.
   */
  promote(piece: Piece): boolean {
    if (this._state.name !== 'PROMOTING') {
      console.error('No piece currently eligible for promotion.');
      return false;
    }

    switch (piece) {
      case 'R':
      case 'r':
      case 'n':
      case 'N':
      case 'Q':
      case 'q':
      case 'B':
      case 'b':
        break;
      default:
        console.error(
          'Target promotion piece must be a queen, rook, bishop or knight.',
        );
        return false;
    }

    const isLowerCase = piece === piece.toLowerCase();
    if (this._state.game.turn % 2 === 0 && isLowerCase) {
      console.error("Cannot promote a black piece on white's turn.");
      return false;
    }
    if (this._state.game.turn % 2 === 1 && !isLowerCase) {
      console.error("Cannot promote a white piece on black's turn.");
      return false;
    }

    try {
      const newState = this._stateMachine.getNewState(this._state, {
        name: 'PROMOTE',
        piece,
      });
      this._reconcileNewState(newState);
      return newState.didChange;
    } catch (error) {
      console.error(`Unknown promotion error: ${error}.`);
      return false;
    }
  }

  /**
   * Resets and unfreezes the board to the default start state.
   */
  reset(): void {
    let newGame: Game;

    if (this._originalBoard) {
      // Create a fresh empty board
      const emptyBoard = Board.empty();

      // Copy each piece from the original board
      for (const square of ALL_SQUARES) {
        const piece = this._originalBoard.getPiece(square);
        if (piece) {
          emptyBoard.addPieceFromString(square, piece.toString() as Piece);
        }
      }

      // Create new game with original turn and board state
      const turn = this._originalTurn === 'white' ? 0 : 1;
      newGame = new Game(emptyBoard, turn);
    } else {
      // If no original board was set, create default game
      newGame = new Game();
    }

    // Reset state completely
    this._reconcileNewState({
      didChange: true,
      state: {
        capturedPieces: {},
        game: newGame,
        legalMoves: newGame.allLegalMoves(),
        moves: [],
        name: 'WAITING',
        scoreBlack: 42,
        scoreWhite: 42,
      },
    });

    this.frozen = false;
  }

  /**
   * Pauses all custom events from being emitted.
   * This is useful when replaying many pre-programmed moves.
   */
  stopCustomEvents(): void {
    this._customEventsPaused = true;
  }

  /**
   *
   */
  restartCustomEvents(): void {
    this._customEventsPaused = false;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hexchess-board': HexchessBoard;
  }
}
