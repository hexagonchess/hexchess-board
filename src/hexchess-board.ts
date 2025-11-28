import { AudioManager, type SoundPack } from './audio';
import { Board } from './board';
import {
  type BoardAnimation,
  type BoardChange,
  type BoardState,
  BoardStateMachine,
  type GameOverState,
  type RewoundState,
  type WaitingState,
} from './board-state';
import { Game } from './game';
import { styles } from './hexchess-styles';
import {
  DEFAULT_PIECE_SIZE,
  PIECE_ASSET_IDS,
  PIECE_ASSET_URLS,
  renderPiece,
} from './piece';
import type { Color, Move, Orientation, Piece, Role, TileColor } from './types';
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
import {
  type Column,
  type ColumnConfig,
  type Square,
  boardToFen,
  fenToBoard,
} from './utils';

export { AudioManager, DEFAULT_SOUND_PACK } from './audio';
export type { SoundEvent, SoundPack } from './audio';

type CanvasColors = {
  board: string;
  tiles: Record<TileColor, string>;
  selectedTiles: Record<TileColor, string>;
  label: string;
  possibleMove: string;
  opponentMove: string;
  possibleCapture: string;
  strokes: Record<TileColor, string> & { opponent: string };
};

type ActiveHistoryAnimation = BoardAnimation & {
  duration: number;
  progress: number;
  startTime: number;
};

type ColorScheme = 'auto' | 'light' | 'dark';

/**
 * A hexagonal chess board used for playing Glinsky-style hex chess.
 *
 * Player variables
 * @cssprop [--hexchess-playername-size=1.4rem]                - The font size of the player names.
 * @cssprop [--hexchess-playername-color=black]                - The color of the player names.
 *
 * Board variables
 * @cssprop [--hexchess-board-bg=#ffffff]                        - The background color of the whitespace of the board (not tiles).
 * @cssprop [--hexchess-board-bg-light=#ffffff]                  - Light mode override for the board background color.
 * @cssprop [--hexchess-board-bg-dark=#050b16]                   - Dark mode override for the board background color.
 * @cssprop [--hexchess-white-bg=#a5c8df]                        - The background color of the white tiles.
 * @cssprop [--hexchess-white-bg-light=#a5c8df]                  - Light mode override for the white tiles.
 * @cssprop [--hexchess-white-bg-dark=#2f6b8f]                   - Dark mode override for the white tiles.
 * @cssprop [--hexchess-selected-white-bg=#a96a41]               - The background color of a white tile that's selected to be moved.
 * @cssprop [--hexchess-selected-white-bg-light=#a96a41]         - Light mode override for selected white tiles.
 * @cssprop [--hexchess-selected-white-bg-dark=#d0894c]          - Dark mode override for selected white tiles.
 * @cssprop [--hexchess-black-bg=#4180a9]                        - The background color of the black tiles.
 * @cssprop [--hexchess-black-bg-light=#4180a9]                  - Light mode override for the black tiles.
 * @cssprop [--hexchess-black-bg-dark=#0f2b40]                   - Dark mode override for the black tiles.
 * @cssprop [--hexchess-selected-black-bg=#a96a41]               - The background color of a black tile that's selected to be moved.
 * @cssprop [--hexchess-selected-black-bg-light=#a96a41]         - Light mode override for selected black tiles.
 * @cssprop [--hexchess-selected-black-bg-dark=#d0894c]          - Dark mode override for selected black tiles.
 * @cssprop [--hexchess-grey-bg=#80b1d0]                         - The background color of the grey tiles.
 * @cssprop [--hexchess-grey-bg-light=#80b1d0]                   - Light mode override for the grey tiles.
 * @cssprop [--hexchess-grey-bg-dark=#1f4767]                    - Dark mode override for the grey tiles.
 * @cssprop [--hexchess-selected-grey-bg=#a96a41]                - The background color of a grey tile that's selected to be moved.
 * @cssprop [--hexchess-selected-grey-bg-light=#a96a41]          - Light mode override for selected grey tiles.
 * @cssprop [--hexchess-selected-grey-bg-dark=#d0894c]           - Dark mode override for selected grey tiles.
 * @cssprop [--hexchess-label-bg=#ffffff]                        - The background color of the column and row labels.
 * @cssprop [--hexchess-label-bg-light=#ffffff]                  - Light mode override for label color.
 * @cssprop [--hexchess-label-bg-dark=#f6f7fb]                   - Dark mode override for label color.
 * @cssprop [--hexchess-label-size=12px]                         - The font size of the column and row labels.
 * @cssprop [--hexchess-possible-move-bg=#e4c7b7]                - The fill color of the small dot shown on a hexagon indicating this is a legal move.
 * @cssprop [--hexchess-possible-move-bg-light=#a96a41]          - Light mode override for the legal move dot.
 * @cssprop [--hexchess-possible-move-bg-dark=#f3c989]           - Dark mode override for the legal move dot.
 * @cssprop [--hexchess-possible-move-opponent-bg=#e3e3e3]       - The fill color of the small dot shown on a hexagon indicating this is a move an opponent piece can make.
 * @cssprop [--hexchess-possible-move-opponent-bg-light=#e3e3e3] - Light mode override for the opponent move dot.
 * @cssprop [--hexchess-possible-move-opponent-bg-dark=#4c627d]  - Dark mode override for the opponent move dot.
 * @cssprop [--hexchess-possible-capture-bg=#e4c7b7]             - The stroke color of the large circle outlining a piece that can be captured.
 * @cssprop [--hexchess-possible-capture-bg-light=#a96a41]       - Light mode override for the capture ring color.
 * @cssprop [--hexchess-possible-capture-bg-dark=#f3c989]        - Dark mode override for the capture ring color.
 * @cssprop [--hexchess-possible-move-stroke-white=#e4c7b7]      - The outline color of a hexagon when the user drags over a white square, trying to move there.
 * @cssprop [--hexchess-possible-move-stroke-white-light=#a96a41] - Light mode override for white square drag outlines.
 * @cssprop [--hexchess-possible-move-stroke-white-dark=#f3c989]  - Dark mode override for white square drag outlines.
 * @cssprop [--hexchess-possible-move-stroke-grey=#e4c7b7]        - The outline color of a hexagon when the user drags over a grey square, trying to move there.
 * @cssprop [--hexchess-possible-move-stroke-grey-light=#a96a41]  - Light mode override for grey square drag outlines.
 * @cssprop [--hexchess-possible-move-stroke-grey-dark=#f3c989]   - Dark mode override for grey square drag outlines.
 * @cssprop [--hexchess-possible-move-stroke-black=#e4c7b7]       - The outline color of a hexagon when the user drags over a black square, trying to move there.
 * @cssprop [--hexchess-possible-move-stroke-black-light=#a96a41] - Light mode override for black square drag outlines.
 * @cssprop [--hexchess-possible-move-stroke-black-dark=#f3c989]  - Dark mode override for black square drag outlines.
 * @cssprop [--hexchess-possible-move-stroke-opponent=#e3e3e3]    - The outline of a square when dragging an opponent piece to a possible move.
 * @cssprop [--hexchess-possible-move-stroke-opponent-light=#e3e3e3] - Light mode override for opponent drag outlines.
 * @cssprop [--hexchess-possible-move-stroke-opponent-dark=#4c627d]  - Dark mode override for opponent drag outlines.
 *
 * @attr color-scheme  - Force `light`, `dark`, or `auto` (default) theming. When unset, the component follows the page/system preference.
 *
 * Custom events
 * @fires gameover        - Fired when the game is over.
 * @fires move            - Fired when a move is made on the board.
 * @fires promoting       - Fired when a pawn is ready to promote.
 * @fires promoted        - Fired when a pawn has been promoted to a piece.
 * @fires furthestback    - Fired when the game is rewound to its starting position.
 * @fires furthestforward - Fired when a game is fast forwarded back to its current position.
 */
export class HexchessBoard extends HTMLElement {
  private _rootElement: HTMLDivElement | null = null;
  private _gameInfoContainer: HTMLDivElement | null = null;
  private _promotionHost: HTMLDivElement | null = null;
  private _styleElement: HTMLStyleElement | null = null;
  private _renderPending = false;
  private _needsRender = false;
  private _updateResolver: (() => void) | null = null;
  private _updateCompletePromise: Promise<void> = Promise.resolve();
  private _initialResizeDone = false;
  private readonly _boundCanvasPointerDown = (
    event: MouseEvent | PointerEvent,
  ) => this._handleMouseDown(event);
  private readonly _boundPromotionClick = (event: Event) =>
    this._handlePromotionClick(event);

  private _boardHeight = 250;
  private _boardWidth = 250;
  private _capturedPieceSize = 0;
  private _capturedPiecePadding = 0.2;
  private _capturedPieceGroupPadding = 1;
  private _columnConfig: ColumnConfig = {} as ColumnConfig;
  private _hexagonPoints: Record<Square, number[][]> = {} as Record<
    Square,
    number[][]
  >;
  private _canvas: HTMLCanvasElement | null = null;
  private _canvasCtx: CanvasRenderingContext2D | null = null;
  private _needsRedraw = true;
  private _drawScheduled = false;
  private _pieceImages: Partial<Record<Piece, HTMLImageElement>> = {};
  private _draggedSquare: Square | null = null;
  private _dragPointerDelta: { x: number; y: number } | null = null;
  private _pointerBoardPosition: { x: number; y: number } | null = null;
  private _pieceSize = DEFAULT_PIECE_SIZE;
  private _polygonWidth = 29;
  private _polygonHeight = 22;
  private _devicePixelRatio = window.devicePixelRatio || 1;
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
  private _activeHistoryAnimation: ActiveHistoryAnimation | null = null;
  private _historyAnimationQueue: BoardAnimation[] = [];
  private _historyAnimationDuration = 100;
  private _customEventsPaused = false;
  private readonly _audioManager = new AudioManager();
  private _soundPackOverrides: SoundPack | null = null;
  private _audioPreloadHandle: number | null = null;
  private _audioPreloadViaIdle = false;
  private _boundWindowPointerUp = (event: MouseEvent | PointerEvent) =>
    this._handleMouseUp(event);
  private _boundWindowPointerMove = (event: MouseEvent | PointerEvent) =>
    this._handleMouseMove(event);

  // -----------------
  // Public properties
  // -----------------

  /**
   * Whose turn it is initially
   */
  get turn(): string {
    return this._state.game.turn % 2 === 0 ? 'white' : 'black';
  }

  set turn(turn: 'white' | 'black') {
    this._originalTurn = turn;
    this._resetHistoryAnimations();
    this._state.game = new Game(
      this._state.game.board,
      turn === 'white' ? 0 : 1,
    );
    this.requestUpdate('board');
    this._scheduleRedraw();
  }

  /**
   * A hex-FEN notation describing the state of the board.
   * If the string is empty, no pieces will be rendered.
   */
  get board(): Board {
    return this._state.game.board;
  }

  set board(board: Board) {
    this._originalBoard = board;
    this._resetHistoryAnimations();

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
    this._scheduleRedraw();
  }

  /**
   * Duration in milliseconds for rewind/fast-forward animations.
   * Set to 0 to disable animations entirely.
   */
  get historyAnimationDuration(): number {
    return this._historyAnimationDuration;
  }

  set historyAnimationDuration(duration: number) {
    const parsed = Number(duration);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      this._historyAnimationDuration = 0;
      this._resetHistoryAnimations();
      return;
    }
    this._historyAnimationDuration = parsed;
  }

  /**
   * A list of moves made on the board.
   * This is useful for analyzing games already played or certain pre-determined openings.
   */
  get moves(): Move[] {
    return this._state.moves;
  }

  set moves(moves: Move[]) {
    this._resetHistoryAnimations();
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
    this._scheduleRedraw();
  }

  /**
   * Black's player name
   */
  private _blackPlayerName = 'Black';
  get blackPlayerName(): string {
    return this._blackPlayerName;
  }
  set blackPlayerName(value: string) {
    const next = value ?? 'Black';
    if (this._blackPlayerName !== next) {
      this._blackPlayerName = next;
      this.requestUpdate('board');
    }
  }

  /**
   * White's player name
   */
  private _whitePlayerName = 'White';
  get whitePlayerName(): string {
    return this._whitePlayerName;
  }
  set whitePlayerName(value: string) {
    const next = value ?? 'White';
    if (this._whitePlayerName !== next) {
      this._whitePlayerName = next;
      this.requestUpdate('board');
    }
  }

  /**
   * The orientation of the board.
   */
  private _orientation: Orientation = 'white';
  get orientation(): Orientation {
    return this._orientation;
  }
  set orientation(value: Orientation) {
    const next = value === 'black' ? 'black' : 'white';
    if (next !== this._orientation) {
      this._orientation = next;
      this._recalculateBoardCoordinates();
      this._configureCanvasSize();
      this.requestUpdate('board');
      this._scheduleRedraw();
    }
  }

  /**
   * The role of the player.
   * If `white`, you can only make moves when it is white's turn.
   * If `black`, you can only make moves when it is black's turn.
   * If `spectator`, then you cannot make moves at all via the UI.
   * If `analyzer`, then you can make moves for both sides, and it simuluates a local game.
   */
  private _playerRole: Role = 'analyzer';
  get playerRole(): Role {
    return this._playerRole;
  }
  set playerRole(value: Role) {
    const next: Role =
      value === 'white' || value === 'black' || value === 'spectator'
        ? value
        : 'analyzer';
    if (next !== this._playerRole) {
      this._playerRole = next;
      this.requestUpdate('board');
    }
  }

  /**
   * Show the board coordinates on the bottom and left sides of the board.
   */
  private _hideCoordinates = false;
  get hideCoordinates(): boolean {
    return this._hideCoordinates;
  }
  set hideCoordinates(value: boolean) {
    const next = Boolean(value);
    if (next !== this._hideCoordinates) {
      this._hideCoordinates = next;
      this.requestUpdate('board');
      this._scheduleRedraw();
    }
  }

  /**
   * Do not allow any other moves beyond the predetermined ones set in the `moves` property.
   */
  private _frozen = false;
  get frozen(): boolean {
    return this._frozen;
  }
  set frozen(value: boolean) {
    this._frozen = Boolean(value);
  }

  /**
   * Clicking on an opponent's piece shows all the squares it can move to
   */
  private _showHints = true;
  get showHints(): boolean {
    return this._showHints;
  }
  set showHints(value: boolean) {
    const next = Boolean(value);
    if (next !== this._showHints) {
      this._showHints = next;
      this.requestUpdate('board');
      this._scheduleRedraw();
    }
  }

  /**
   * Hide player names - usually only used for custom websites to render player names separately.
   */
  private _hidePlayerNames = false;
  get hidePlayerNames(): boolean {
    return this._hidePlayerNames;
  }
  set hidePlayerNames(value: boolean) {
    const next = Boolean(value);
    if (next !== this._hidePlayerNames) {
      this._hidePlayerNames = next;
      this.requestUpdate('board');
    }
  }

  /**
   * Hide captured pieces - usually only used for custom websites to render captured pieces separately.
   */
  private _hideCapturedPieces = false;
  get hideCapturedPieces(): boolean {
    return this._hideCapturedPieces;
  }
  set hideCapturedPieces(value: boolean) {
    const next = Boolean(value);
    if (next !== this._hideCapturedPieces) {
      this._hideCapturedPieces = next;
      this.requestUpdate('board');
    }
  }

  /**
   * Mute all built-in sound effects.
   */
  private _muted = false;
  private _audioSetting: 'on' | 'off' = 'on';
  get muted(): boolean {
    return this._muted;
  }
  set muted(value: boolean) {
    const next = Boolean(value);
    if (next === this._muted) {
      return;
    }
    this._muted = next;
    this._audioManager.setMuted(next);
    const audioSetting = next ? 'off' : 'on';
    if (this._audioSetting !== audioSetting) {
      this._audioSetting = audioSetting;
      if (audioSetting === 'off') {
        this.setAttribute('audio', 'off');
      } else {
        this.removeAttribute('audio');
      }
    }
  }

  /**
   * Controls whether audio is enabled.
   * Use `'off'` to mute via the `audio="off"` attribute.
   */
  get audio(): 'on' | 'off' {
    return this._audioSetting;
  }
  set audio(value: 'on' | 'off') {
    const next = value === 'off' ? 'off' : 'on';
    if (next === this._audioSetting) {
      return;
    }
    this._audioSetting = next;
    if (next === 'off') {
      this.setAttribute('audio', 'off');
      this.muted = true;
    } else {
      this.removeAttribute('audio');
      this.muted = false;
    }
  }

  /**
   * Provide overrides for the built-in sound pack.
   * Pass `null` to revert to the default set of cues.
   */
  get soundPack(): SoundPack | null {
    return this._soundPackOverrides;
  }
  set soundPack(value: SoundPack | null) {
    if (value === this._soundPackOverrides) {
      return;
    }
    this._soundPackOverrides = value;
    this._audioManager.updateSoundPack(value);
    this._scheduleAudioPreload();
  }

  /**
   * Color scheme preference.
   * `auto` follows the user's OS/browser preference, `light` and `dark` force a theme.
   */
  private _colorScheme: ColorScheme = 'auto';
  private _prefersDarkModeMedia: MediaQueryList | null = null;
  private _boundPrefersColorSchemeChange:
    | ((event: MediaQueryListEvent) => void)
    | null = null;

  get colorScheme(): ColorScheme {
    return this._colorScheme;
  }

  set colorScheme(value: ColorScheme) {
    const next: ColorScheme =
      value === 'dark' || value === 'light' ? value : 'auto';
    if (next === this._colorScheme) {
      return;
    }
    this._colorScheme = next;
    if (next === 'auto') {
      this.removeAttribute('color-scheme');
    } else {
      this.setAttribute('color-scheme', next);
    }
    this._handleColorSchemeChange();
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._recalculateBoardCoordinates();
  }

  static get observedAttributes(): string[] {
    return [
      'turn',
      'board',
      'moves',
      'black-player-name',
      'white-player-name',
      'orientation',
      'player-role',
      'hide-coordinates',
      'frozen',
      'show-hints',
      'hide-playernames',
      'hide-capturedpieces',
      'history-animation-duration',
      'color-scheme',
      'audio',
      'muted',
    ];
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    newValue: string | null,
  ): void {
    switch (name) {
      case 'turn': {
        const next = newValue === 'black' ? 'black' : 'white';
        this.turn = next;
        break;
      }
      case 'board': {
        this.board = fenToBoard(newValue ?? '');
        break;
      }
      case 'moves': {
        this.moves = stringToMoves(newValue ?? '');
        break;
      }
      case 'black-player-name': {
        this.blackPlayerName = newValue ?? 'Black';
        break;
      }
      case 'white-player-name': {
        this.whitePlayerName = newValue ?? 'White';
        break;
      }
      case 'orientation': {
        const next = newValue === 'black' ? 'black' : 'white';
        this.orientation = next;
        break;
      }
      case 'player-role': {
        const role = (newValue ?? '') as Role;
        this.playerRole = role;
        break;
      }
      case 'hide-coordinates': {
        this.hideCoordinates = newValue !== null;
        break;
      }
      case 'frozen': {
        this.frozen = newValue !== null;
        break;
      }
      case 'show-hints': {
        this.showHints = newValue !== null;
        break;
      }
      case 'hide-playernames': {
        this.hidePlayerNames = newValue !== null;
        break;
      }
      case 'hide-capturedpieces': {
        this.hideCapturedPieces = newValue !== null;
        break;
      }
      case 'history-animation-duration': {
        this.historyAnimationDuration =
          newValue === null ? 0 : Number(newValue);
        break;
      }
      case 'color-scheme': {
        const next: ColorScheme =
          newValue === 'dark' || newValue === 'light' ? newValue : 'auto';
        if (next !== this._colorScheme) {
          this._colorScheme = next;
          this._handleColorSchemeChange();
        }
        break;
      }
      case 'audio': {
        const next = newValue === 'off' ? 'off' : 'on';
        if (next !== this._audioSetting) {
          this._audioSetting = next;
          this.muted = next === 'off';
        }
        break;
      }
      case 'muted': {
        this.muted = newValue !== null;
        break;
      }
      default:
        break;
    }
  }

  protected requestUpdate(_property?: string): void {
    this._needsRender = true;
    if (!this.isConnected || this._renderPending) {
      return;
    }
    this._renderPending = true;
    this._updateCompletePromise = new Promise((resolve) => {
      this._updateResolver = resolve;
    });
    queueMicrotask(() => {
      this._renderPending = false;
      if (this._needsRender) {
        this._needsRender = false;
        this._performDomUpdate();
      }
      if (this._updateResolver) {
        this._updateResolver();
        this._updateResolver = null;
      }
    });
  }

  get updateComplete(): Promise<void> {
    return this._updateCompletePromise;
  }

  private _performDomUpdate(): void {
    this._ensureDom();
    this._updateCanvasCursor();
    this._updateGameInfo();
    this._updatePromotionOverlay();
  }

  private _ensureDom(): void {
    const root = this.shadowRoot;
    if (!root) {
      return;
    }
    if (!this._styleElement) {
      const styleElement = document.createElement('style');
      styleElement.textContent = styles;
      root.appendChild(styleElement);
      this._styleElement = styleElement;
    }
    if (!this._rootElement) {
      const wrapper = document.createElement('div');
      wrapper.id = 'root';
      wrapper.style.width = '100%';
      wrapper.style.height = '100%';
      wrapper.style.position = 'relative';

      const canvas = document.createElement('canvas');
      canvas.classList.add('board-canvas', 'cursor-grab');
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.addEventListener('pointerdown', this._boundCanvasPointerDown);

      const gameInfo = document.createElement('div');
      gameInfo.classList.add('game-info');
      gameInfo.style.paddingLeft = '17px';

      const overlayHost = document.createElement('div');
      overlayHost.classList.add('promotion-host');
      overlayHost.addEventListener('click', this._boundPromotionClick);

      wrapper.append(canvas, gameInfo, overlayHost);
      root.append(wrapper);

      this._rootElement = wrapper;
      this._canvas = canvas;
      this._gameInfoContainer = gameInfo;
      this._promotionHost = overlayHost;

      this._captureCanvas();
      if (!this._initialResizeDone) {
        this._initialResizeDone = true;
        this.resize();
      } else {
        this._configureCanvasSize();
      }
    }
  }

  private _updateCanvasCursor(): void {
    if (!this._canvas) {
      return;
    }
    const isDragging =
      this._state.name === 'DRAG_PIECE' ||
      this._state.name === 'MOUSE_DOWN_PIECE_SELECTED' ||
      this._state.name === 'CANCEL_SELECTION_SOON';
    this._canvas.classList.toggle('cursor-grabbing', isDragging);
    this._canvas.classList.toggle('cursor-grab', !isDragging);
  }

  private _updateGameInfo(): void {
    if (!this._gameInfoContainer) {
      return;
    }
    this._gameInfoContainer.innerHTML = this._renderGameInfo();
  }

  private _updatePromotionOverlay(): void {
    if (!this._promotionHost) {
      return;
    }
    this._promotionHost.innerHTML = this._renderPromotionOptions();
  }

  private _getResolvedColorScheme(): 'light' | 'dark' {
    if (this._colorScheme === 'dark') {
      return 'dark';
    }
    if (this._colorScheme === 'light') {
      return 'light';
    }
    const mediaQuery = this._getPrefersDarkModeMedia();
    if (mediaQuery) {
      return mediaQuery.matches ? 'dark' : 'light';
    }
    return 'light';
  }

  private _getPrefersDarkModeMedia(): MediaQueryList | null {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return null;
    }
    if (!this._prefersDarkModeMedia) {
      this._prefersDarkModeMedia = window.matchMedia(
        '(prefers-color-scheme: dark)',
      );
    }
    return this._prefersDarkModeMedia;
  }

  private _startColorSchemeObserver() {
    const mediaQuery = this._getPrefersDarkModeMedia();
    if (!mediaQuery || this._boundPrefersColorSchemeChange) {
      return;
    }
    const handler = (_event: MediaQueryListEvent) => {
      if (this._colorScheme === 'auto') {
        this._handleColorSchemeChange();
      }
    };
    this._boundPrefersColorSchemeChange = handler;
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handler);
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(handler);
    }
  }

  private _stopColorSchemeObserver() {
    if (this._prefersDarkModeMedia && this._boundPrefersColorSchemeChange) {
      const handler = this._boundPrefersColorSchemeChange;
      if (
        typeof this._prefersDarkModeMedia.removeEventListener === 'function'
      ) {
        this._prefersDarkModeMedia.removeEventListener('change', handler);
      } else if (
        typeof this._prefersDarkModeMedia.removeListener === 'function'
      ) {
        this._prefersDarkModeMedia.removeListener(handler);
      }
    }
    this._prefersDarkModeMedia = null;
    this._boundPrefersColorSchemeChange = null;
  }

  private _handleColorSchemeChange() {
    this.requestUpdate('color-scheme');
    this._scheduleRedraw();
  }

  private _scheduleAudioPreload() {
    if (!this.isConnected || this._audioPreloadHandle !== null) {
      return;
    }
    const idleWindow = window as typeof window & {
      requestIdleCallback?: (
        callback: IdleRequestCallback,
        options?: IdleRequestOptions,
      ) => number;
    };
    const run = () => {
      this._audioPreloadHandle = null;
      void this._audioManager.preloadAll();
    };
    if (typeof idleWindow.requestIdleCallback === 'function') {
      this._audioPreloadViaIdle = true;
      this._audioPreloadHandle = idleWindow.requestIdleCallback(run);
      return;
    }
    this._audioPreloadViaIdle = false;
    this._audioPreloadHandle = window.setTimeout(run, 0);
  }

  private _cancelAudioPreload() {
    if (this._audioPreloadHandle === null) {
      return;
    }
    const idleWindow = window as typeof window & {
      cancelIdleCallback?: (handle: number) => void;
    };
    if (this._audioPreloadViaIdle && idleWindow.cancelIdleCallback) {
      idleWindow.cancelIdleCallback(this._audioPreloadHandle);
    } else {
      window.clearTimeout(this._audioPreloadHandle);
    }
    this._audioPreloadHandle = null;
  }

  private _upgradeProperties(properties: string[]) {
    for (const property of properties) {
      if (Object.prototype.hasOwnProperty.call(this, property)) {
        const value = (this as Record<string, unknown>)[property];
        delete (this as Record<string, unknown>)[property];
        (this as Record<string, unknown>)[property] = value;
      }
    }
  }

  // ---------------
  // Event listeners
  // ---------------

  connectedCallback(): void {
    this._upgradeProperties([
      'turn',
      'board',
      'moves',
      'blackPlayerName',
      'whitePlayerName',
      'orientation',
      'playerRole',
      'hideCoordinates',
      'frozen',
      'showHints',
      'hidePlayerNames',
      'hideCapturedPieces',
      'soundPack',
      'muted',
      'audio',
      'colorScheme',
    ]);
    window.addEventListener('pointerup', this._boundWindowPointerUp);
    window.addEventListener('pointermove', this._boundWindowPointerMove);
    this._startColorSchemeObserver();
    this._scheduleAudioPreload();
    this.requestUpdate('board');
  }

  disconnectedCallback(): void {
    window.removeEventListener('pointerup', this._boundWindowPointerUp);
    window.removeEventListener('pointermove', this._boundWindowPointerMove);
    this._stopColorSchemeObserver();
    this._cancelAudioPreload();
  }

  private _handlePromotion(piece: Omit<Piece, 'p' | 'P' | 'k' | 'K'>) {
    const newState = this._stateMachine.getNewState(this._state, {
      name: 'PROMOTE',
      piece,
    });
    this._reconcileNewState(newState);
  }

  private _handlePromotionClick(event: Event) {
    if (this._state.name !== 'PROMOTING') {
      return;
    }
    const target = (event.target as HTMLElement | null)?.closest(
      '[data-promotion-piece]',
    ) as HTMLElement | null;
    if (!target) {
      return;
    }
    const piece = target.getAttribute('data-promotion-piece');
    if (piece) {
      event.preventDefault();
      event.stopPropagation();
      this._handlePromotion(piece as Piece);
    }
  }

  private _handleMouseDown(event: MouseEvent | PointerEvent) {
    event.preventDefault();
    this._audioManager.allowPlayback();
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

    this._updatePointerPositionFromEvent(event);
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
      square &&
      (newState.state.name === 'MOUSE_DOWN_PIECE_SELECTED' ||
        newState.state.name === 'CANCEL_SELECTION_SOON')
    ) {
      this._draggedSquare = square;
      if (this._squareCenters && this._pointerBoardPosition) {
        const center = this._squareCenters[square];
        if (center) {
          this._dragPointerDelta = {
            x: this._pointerBoardPosition.x - center[0],
            y: this._pointerBoardPosition.y - center[1],
          };
        }
      }
    }

    this._reconcileNewState(newState);
  }

  private _handleMouseUp(event: MouseEvent | PointerEvent) {
    if (this.frozen) {
      return;
    }

    this._updatePointerPositionFromEvent(event);
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

    this._dragPointerDelta = null;
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

    this._updatePointerPositionFromEvent(event);
    this._scheduleRedraw();
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
    const previousState = this._state;
    if (newState.animation) {
      this._queueHistoryAnimation(newState.animation);
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
    this._handleSoundEffects(previousState, newState.state);
    this._state = newState.state;
    this._updateDragVisualState();
    this.requestUpdate('board');
    this._scheduleRedraw();
  }

  private _handleSoundEffects(
    previousState: BoardState,
    nextState: BoardState,
  ) {
    if (this._customEventsPaused) {
      return;
    }
    if (nextState.name === 'REWOUND') {
      return;
    }
    if (nextState.name === 'GAMEOVER') {
      if (previousState.name !== 'GAMEOVER') {
        this._playGameoverSound(nextState);
      }
      return;
    }
    if (nextState.moves.length <= previousState.moves.length) {
      return;
    }
    const move = nextState.moves[nextState.moves.length - 1];
    void this._audioManager.play(move.capturedPiece ? 'capture' : 'move');
    if (nextState.game.isInCheck()) {
      void this._audioManager.play('check');
    }
  }

  private _playGameoverSound(state: GameOverState) {
    if (state.outcome === 'DRAW') {
      void this._audioManager.play('draw');
      return;
    }
    const role = this.playerRole;
    if (role !== 'white' && role !== 'black') {
      void this._audioManager.play('checkmate');
      return;
    }
    const didWin =
      (role === 'white' && state.outcome === 'WHITE_WINS') ||
      (role === 'black' && state.outcome === 'BLACK_WINS');
    void this._audioManager.play(didWin ? 'victory' : 'defeat');
  }

  private _updateDragVisualState() {
    if (
      this._state.name === 'MOUSE_DOWN_PIECE_SELECTED' ||
      this._state.name === 'DRAG_PIECE' ||
      this._state.name === 'CANCEL_SELECTION_SOON'
    ) {
      this._draggedSquare = this._state.square;
    } else {
      this._draggedSquare = null;
      this._dragPointerDelta = null;
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

  private _getBoardCoordinatesFromEvent(
    event: MouseEvent | PointerEvent,
  ): { x: number; y: number } | null {
    if (!this._canvas) {
      return null;
    }

    const rect = this._canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return null;
    }
    const cssX = event.clientX - rect.left;
    const cssY = event.clientY - rect.top;
    const x = (cssX / rect.width) * this._boardWidth;
    const y = (cssY / rect.height) * this._boardHeight;
    return { x, y };
  }

  private _updatePointerPositionFromEvent(
    event: MouseEvent | PointerEvent,
  ): void {
    const coords = this._getBoardCoordinatesFromEvent(event);
    this._pointerBoardPosition = coords;
  }

  private _getSquareFromClick(event: MouseEvent | PointerEvent): Square | null {
    const coords = this._getBoardCoordinatesFromEvent(event);
    if (!coords) {
      return null;
    }

    for (const square of ALL_SQUARES) {
      const points = this._hexagonPoints[square];
      if (!points) {
        continue;
      }

      if (this._isPointInPolygon(coords.x, coords.y, points)) {
        return square;
      }
    }

    return null;
  }

  private _isPointInPolygon(
    x: number,
    y: number,
    polygon: number[][],
  ): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i++) {
      const xi = polygon[i][0];
      const yi = polygon[i][1];
      const xj = polygon[j][0];
      const yj = polygon[j][1];
      if (yi > y !== yj > y) {
        const slope = yj - yi;
        const intersect = x < ((xj - xi) * (y - yi)) / slope + xi;
        if (intersect) {
          inside = !inside;
        }
      }
    }
    return inside;
  }

  private _getOffsets(square: Square, config: ColumnConfig): [number, number] {
    const column = square[0] as Column;
    const row = parseInt(square.slice(1), 10);

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
      }
    }
  }

  private _getColorForSquare(square: Square): TileColor {
    const colors = this._columnConfig[square[0] as Column].colors;
    const number = parseInt(square.slice(1), 10);
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
      return '';
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

    const optionMarkup = options
      .map((option) => {
        return `<div
            class="hexagon"
            data-promotion-piece="${option}"
            style="width: ${this._polygonWidth}px; height: ${
              this._polygonHeight
            }px; background-color: var(--hexchess-board-bg, #fcfaf2);"
          >
            ${renderPiece(option, this._pieceSize, false)}
          </div>`;
      })
      .join('');

    return `<div class="promotion" style="top: ${y}px; left: ${x}px;">${optionMarkup}</div>`;
  }

  private _renderScore(score: number | undefined) {
    if (!score) {
      return '';
    }

    if (score === 0 || score < 0) {
      return '';
    }

    return `<p class="score">(+${score})</p>`;
  }

  private _renderCapturedPieceGroup(
    piece: Piece,
    numPieces: number,
    capturedPieceSize: number,
  ) {
    const pieces = [...Array(numPieces).keys()]
      .map((numPiece) => {
        const padding =
          numPiece * capturedPieceSize * this._capturedPiecePadding;
        return `<div style="position: relative; left: ${padding}px">
              ${renderPiece(piece, capturedPieceSize)}
            </div>`;
      })
      .join('');

    return `<div class="captured-piece-group">${pieces}</div>`;
  }

  private _renderOneSideCapturedPieces(
    pieces: Partial<Record<Piece, number>>,
    score: number,
  ) {
    if (this.hideCapturedPieces) {
      return '';
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
      : '';
    const capturedBishops = bishop
      ? this._renderCapturedPieceGroup(
          bishop,
          pieces[bishop] as number,
          this._capturedPieceSize,
        )
      : '';
    const capturedKnights = knight
      ? this._renderCapturedPieceGroup(
          knight,
          pieces[knight] as number,
          this._capturedPieceSize,
        )
      : '';
    const capturedRooks = rook
      ? this._renderCapturedPieceGroup(
          rook,
          pieces[rook] as number,
          this._capturedPieceSize,
        )
      : '';
    const capturedQueens = queen
      ? this._renderCapturedPieceGroup(
          queen,
          pieces[queen] as number,
          this._capturedPieceSize,
        )
      : '';

    return `<div
        class="captured-pieces"
        style="column-gap: ${
          this._capturedPieceSize * this._capturedPieceGroupPadding
        }px;"
      >
        ${capturedPawns} ${capturedBishops} ${capturedKnights} ${capturedRooks}
        ${capturedQueens} ${this._renderScore(score)}
      </div>`;
  }

  private _renderPlayer(name: string, isWhite: boolean) {
    if (this.hidePlayerNames) {
      return '';
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
    return `<p class="username">${this._escapeHtml(name)} ${outcome}</p>`;
  }

  private _escapeHtml(value: string): string {
    const replacements: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return value.replace(/[&<>"']/g, (character) => replacements[character]);
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

    return `
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

  private _captureCanvas() {
    this._canvasCtx = this._canvas?.getContext('2d') ?? null;
    this._configureCanvasSize();
  }

  private _configureCanvasSize() {
    if (!this._canvas) {
      return;
    }
    this._devicePixelRatio = window.devicePixelRatio || 1;
    this._canvas.width = this._boardWidth * this._devicePixelRatio;
    this._canvas.height = this._boardHeight * this._devicePixelRatio;
    this._canvas.style.width = `${this._boardWidth}px`;
    this._canvas.style.height = `${this._boardHeight}px`;
    if (!this._canvasCtx) {
      this._canvasCtx = this._canvas.getContext('2d');
    }
    this._scheduleRedraw();
  }

  private _scheduleRedraw() {
    this._needsRedraw = true;
    if (this._drawScheduled) {
      return;
    }
    this._drawScheduled = true;
    requestAnimationFrame(() => {
      this._drawScheduled = false;
      if (!this._needsRedraw) {
        return;
      }
      this._needsRedraw = false;
      this._drawBoardCanvas();
    });
  }

  private _drawBoardCanvas() {
    if (!this._canvas) {
      return;
    }
    if (!this._canvasCtx) {
      this._canvasCtx = this._canvas.getContext('2d');
    }
    const ctx = this._canvasCtx;
    if (!ctx) {
      return;
    }
    this._updateHistoryAnimations(this._now());
    const dpr = window.devicePixelRatio || 1;
    const targetWidth = this._boardWidth * dpr;
    const targetHeight = this._boardHeight * dpr;
    if (
      this._canvas.width !== targetWidth ||
      this._canvas.height !== targetHeight
    ) {
      this._configureCanvasSize();
    }
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, this._boardWidth, this._boardHeight);
    const styles = getComputedStyle(this);
    const colors = this._getCssColors(styles);
    ctx.fillStyle = colors.board;
    ctx.fillRect(0, 0, this._boardWidth, this._boardHeight);
    this._drawSquares(ctx, colors, styles);
    this._drawMoveIndicators(ctx, colors);
    this._drawDragTarget(ctx, colors);
    this._drawPieces(ctx);
    this._drawPendingHistoryAnimations(ctx);
    this._drawActiveHistoryAnimation(ctx);
    ctx.restore();
    if (this._activeHistoryAnimation) {
      this._scheduleRedraw();
    }
  }

  private _getCssColors(styles: CSSStyleDeclaration): CanvasColors {
    const resolvedScheme = this._getResolvedColorScheme();
    const readRaw = (name: string) => styles.getPropertyValue(name).trim();
    const readColor = (
      property: string,
      defaultProperty: string,
      fallback: string,
    ) => {
      const themedProperty = `${property}-${resolvedScheme}`;
      const themedValue = readRaw(themedProperty);
      if (themedValue) {
        return themedValue;
      }
      const value = readRaw(property);
      if (value) {
        return value;
      }
      const defaultValue = readRaw(defaultProperty);
      return defaultValue || fallback;
    };
    return {
      board: readColor(
        '--hexchess-board-bg',
        '--hexchess-default-board-bg',
        '#ffffff',
      ),
      tiles: {
        white: readColor(
          '--hexchess-white-bg',
          '--hexchess-default-white-bg',
          '#a5c8df',
        ),
        black: readColor(
          '--hexchess-black-bg',
          '--hexchess-default-black-bg',
          '#4180a9',
        ),
        grey: readColor(
          '--hexchess-grey-bg',
          '--hexchess-default-grey-bg',
          '#80b1d0',
        ),
      },
      selectedTiles: {
        white: readColor(
          '--hexchess-selected-white-bg',
          '--hexchess-default-selected-white-bg',
          '#e4c7b7',
        ),
        black: readColor(
          '--hexchess-selected-black-bg',
          '--hexchess-default-selected-black-bg',
          '#e4c7b7',
        ),
        grey: readColor(
          '--hexchess-selected-grey-bg',
          '--hexchess-default-selected-grey-bg',
          '#e4c7b7',
        ),
      },
      label: readColor(
        '--hexchess-label-bg',
        '--hexchess-default-label-bg',
        '#ffffff',
      ),
      possibleMove: readColor(
        '--hexchess-possible-move-bg',
        '--hexchess-default-possible-move-bg',
        '#a96a41',
      ),
      opponentMove: readColor(
        '--hexchess-possible-move-opponent-bg',
        '--hexchess-default-possible-move-opponent-bg',
        '#e3e3e3',
      ),
      possibleCapture: readColor(
        '--hexchess-possible-capture-bg',
        '--hexchess-default-possible-capture-bg',
        '#a96a41',
      ),
      strokes: {
        white: readColor(
          '--hexchess-possible-move-stroke-white',
          '--hexchess-default-possible-move-stroke-white',
          '#a96a41',
        ),
        black: readColor(
          '--hexchess-possible-move-stroke-black',
          '--hexchess-default-possible-move-stroke-black',
          '#a96a41',
        ),
        grey: readColor(
          '--hexchess-possible-move-stroke-grey',
          '--hexchess-default-possible-move-stroke-grey',
          '#a96a41',
        ),
        opponent: readColor(
          '--hexchess-possible-move-stroke-opponent',
          '--hexchess-default-possible-move-stroke-opponent',
          '#e3e3e3',
        ),
      },
    };
  }

  /**
   * @internal Exposed only for internal tests that need to inspect resolved colors.
   */
  get __testingResolvedColors(): CanvasColors {
    return this._getCssColors(getComputedStyle(this));
  }

  private _drawSquares(
    ctx: CanvasRenderingContext2D,
    colors: CanvasColors,
    styles: CSSStyleDeclaration,
  ) {
    const fontSizeRaw = styles.getPropertyValue('--hexchess-label-size').trim();
    const fontSize = Number.parseInt(fontSizeRaw, 10) || 12;
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';

    const highlightLastMove = this._state.name !== 'REWOUND';
    const recentMove =
      highlightLastMove && this._state.moves.length > 0
        ? this._state.moves[this._state.moves.length - 1]
        : null;
    const interactiveState =
      this._state.name !== 'WAITING' &&
      this._state.name !== 'REWOUND' &&
      this._state.name !== 'PROMOTING' &&
      this._state.name !== 'GAMEOVER';
    const selectedSquare = this._getSelectedSquare();

    for (const column of COLUMN_ARRAY) {
      const numHexagons = this._numberOfHexagons(column);
      for (let row = 1; row <= numHexagons; row++) {
        const square = `${column}${row}` as Square;
        const polygon = this._hexagonPoints[square];
        if (!polygon) {
          continue;
        }
        const tileColor = this._getColorForSquare(square);
        const isRecentFrom = highlightLastMove && recentMove?.from === square;
        const isRecentTo = highlightLastMove && recentMove?.to === square;
        const isSelected = interactiveState && selectedSquare === square;
        const wasMostRecentMove =
          highlightLastMove &&
          !!recentMove &&
          (recentMove.to === square || recentMove.from === square);
        const canHaveOpponentMove =
          interactiveState &&
          'opponentPieceMoves' in this._state &&
          !!this._state.opponentPieceMoves;

        let fillColor = colors.tiles[tileColor];
        if (isSelected || isRecentFrom || isRecentTo) {
          fillColor =
            canHaveOpponentMove && !wasMostRecentMove
              ? colors.opponentMove
              : colors.selectedTiles[tileColor];
        }

        this._tracePolygon(ctx, polygon);
        ctx.fillStyle = fillColor;
        ctx.fill();

        if (!this.hideCoordinates) {
          const offsets = this._getOffsets(square, this._columnConfig);
          if (this._shouldRenderColumnLabel(square)) {
            this._drawColumnLabel(ctx, column, offsets, colors.label, fontSize);
          }
          if (this._shouldRenderCoordinateLabel(square)) {
            this._drawCoordinateLabel(
              ctx,
              row,
              offsets,
              colors.label,
              fontSize,
            );
          }
        }
      }
    }
  }

  private _shouldRenderColumnLabel(square: Square): boolean {
    if (this.hideCoordinates) {
      return false;
    }
    return this.orientation === 'white'
      ? WHITE_COLUMN_LABEL_SQUARES.includes(square)
      : BLACK_COLUMN_LABEL_SQUARES.includes(square);
  }

  private _shouldRenderCoordinateLabel(square: Square): boolean {
    if (this.hideCoordinates) {
      return false;
    }
    return this.orientation === 'white'
      ? ANNOTATED_WHITE_SQUARES.includes(square)
      : ANNOTATED_BLACK_SQUARES.includes(square);
  }

  private _drawColumnLabel(
    ctx: CanvasRenderingContext2D,
    column: Column,
    offsets: [number, number],
    color: string,
    fontSize: number,
  ) {
    ctx.fillStyle = color;
    ctx.fillText(
      column,
      offsets[0] + this._polygonWidth * 0.75 - 10,
      offsets[1] + this._polygonHeight - fontSize / 4,
    );
  }

  private _drawCoordinateLabel(
    ctx: CanvasRenderingContext2D,
    row: number,
    offsets: [number, number],
    color: string,
    _fontSize: number,
  ) {
    ctx.fillStyle = color;
    ctx.fillText(
      row.toString(),
      offsets[0] + this._polygonWidth / 4 + 3,
      offsets[1] + 13,
    );
  }

  private _tracePolygon(ctx: CanvasRenderingContext2D, points: number[][]) {
    if (points.length === 0) {
      return;
    }
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i][0], points[i][1]);
    }
    ctx.closePath();
  }

  private _drawMoveIndicators(
    ctx: CanvasRenderingContext2D,
    colors: CanvasColors,
  ) {
    if (
      this._state.name === 'WAITING' ||
      this._state.name === 'REWOUND' ||
      this._state.name === 'PROMOTING' ||
      this._state.name === 'GAMEOVER'
    ) {
      return;
    }
    const selectedSquare = this._getSelectedSquare();
    if (!selectedSquare) {
      return;
    }
    const opponentMoves = this._state.opponentPieceMoves ?? [];
    const legalMoves = this._state.legalMoves[selectedSquare];

    for (const square of ALL_SQUARES) {
      if (square === selectedSquare) {
        continue;
      }
      const isOpponentMove = opponentMoves?.includes(square) ?? false;
      const isLegalMove = legalMoves?.has(square) ?? false;
      if (!isOpponentMove && !isLegalMove) {
        continue;
      }
      const center = this._squareCenters?.[square];
      if (!center) {
        continue;
      }
      const hasPiece = this._state.game.board.getPiece(square) !== null;
      if (hasPiece) {
        ctx.beginPath();
        ctx.strokeStyle = colors.possibleCapture;
        ctx.lineWidth = 5;
        ctx.arc(
          center[0],
          center[1],
          Math.min(this._polygonWidth, this._polygonHeight) / 2.2,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
        continue;
      }
      ctx.beginPath();
      ctx.fillStyle = isOpponentMove
        ? colors.opponentMove
        : colors.possibleMove;
      ctx.arc(
        center[0],
        center[1],
        Math.min(this._polygonWidth, this._polygonHeight) / 6,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  private _drawDragTarget(ctx: CanvasRenderingContext2D, colors: CanvasColors) {
    if (this._state.name !== 'DRAG_PIECE') {
      return;
    }
    if (this._state.dragSquare === this._state.square) {
      return;
    }
    const dragSquare = this._state.dragSquare;
    const polygon = this._hexagonPoints[dragSquare];
    if (!polygon) {
      return;
    }
    const tileColor = this._getColorForSquare(dragSquare);
    const strokeColor = this._state.opponentPieceMoves
      ? colors.strokes.opponent
      : colors.strokes[tileColor];
    this._tracePolygon(ctx, polygon);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 5;
    ctx.stroke();
  }

  private _drawPieces(ctx: CanvasRenderingContext2D) {
    const squares = Object.keys(this._state.game.board.pieces) as Square[];
    const draggingSquare = this._draggedSquare;
    const hiddenSquares = new Set<Square>();
    if (this._activeHistoryAnimation) {
      hiddenSquares.add(this._activeHistoryAnimation.to);
    }
    for (const animation of this._historyAnimationQueue) {
      hiddenSquares.add(animation.to);
    }
    let draggedPiece: Piece | null = null;

    for (const square of squares) {
      if (hiddenSquares.has(square)) {
        continue;
      }
      const piece = this._state.game.board.getPiece(square);
      if (!piece) {
        continue;
      }
      const pieceChar = piece.toString() as Piece;
      if (
        draggingSquare &&
        square === draggingSquare &&
        (this._state.name === 'MOUSE_DOWN_PIECE_SELECTED' ||
          this._state.name === 'CANCEL_SELECTION_SOON' ||
          this._state.name === 'DRAG_PIECE')
      ) {
        draggedPiece = pieceChar;
        continue;
      }
      this._drawPieceAtSquare(ctx, pieceChar, square);
    }

    if (draggedPiece) {
      this._drawDraggedPiece(ctx, draggedPiece);
    }
  }

  private _drawPieceAtSquare(
    ctx: CanvasRenderingContext2D,
    piece: Piece,
    square: Square,
  ) {
    if (!this._squareCenters) {
      return;
    }
    const center = this._squareCenters[square];
    if (!center) {
      return;
    }
    this._drawPiece(ctx, piece, center[0], center[1]);
  }

  private _drawDraggedPiece(ctx: CanvasRenderingContext2D, piece: Piece) {
    const center = this._getDraggedPieceCenter();
    if (!center) {
      return;
    }
    this._drawPiece(ctx, piece, center[0], center[1]);
  }

  private _drawPendingHistoryAnimations(ctx: CanvasRenderingContext2D) {
    if (!this._squareCenters || this._historyAnimationQueue.length === 0) {
      return;
    }
    for (const animation of this._historyAnimationQueue) {
      const center = this._squareCenters[animation.from];
      if (!center) {
        continue;
      }
      this._drawPiece(ctx, animation.piece, center[0], center[1]);
    }
  }

  private _drawActiveHistoryAnimation(ctx: CanvasRenderingContext2D) {
    if (!this._activeHistoryAnimation || !this._squareCenters) {
      return;
    }
    const fromCenter = this._squareCenters[this._activeHistoryAnimation.from];
    const toCenter = this._squareCenters[this._activeHistoryAnimation.to];
    if (!fromCenter || !toCenter) {
      return;
    }
    const progress = Math.min(
      Math.max(this._activeHistoryAnimation.progress ?? 0, 0),
      1,
    );
    const centerX = fromCenter[0] + (toCenter[0] - fromCenter[0]) * progress;
    const centerY = fromCenter[1] + (toCenter[1] - fromCenter[1]) * progress;
    this._drawPiece(ctx, this._activeHistoryAnimation.piece, centerX, centerY);
  }

  private _drawPiece(
    ctx: CanvasRenderingContext2D,
    piece: Piece,
    centerX: number,
    centerY: number,
  ) {
    const image = this._loadPieceImage(piece);
    if (!image) {
      return;
    }
    const size = this._pieceSize;
    ctx.drawImage(image, centerX - size / 2, centerY - size / 2, size, size);
  }

  private _queueHistoryAnimation(animation: BoardAnimation) {
    if (this._historyAnimationDuration <= 0) {
      return;
    }
    const activeDirection =
      this._activeHistoryAnimation?.direction ??
      this._historyAnimationQueue[0]?.direction;
    if (activeDirection && activeDirection !== animation.direction) {
      this._resetHistoryAnimations();
    }
    this._historyAnimationQueue.push({ ...animation });
    this._scheduleRedraw();
  }

  private _updateHistoryAnimations(now: number) {
    if (this._historyAnimationDuration <= 0) {
      if (
        this._activeHistoryAnimation ||
        this._historyAnimationQueue.length > 0
      ) {
        this._activeHistoryAnimation = null;
        this._historyAnimationQueue = [];
      }
      return;
    }
    if (this._activeHistoryAnimation) {
      const elapsed = now - this._activeHistoryAnimation.startTime;
      const progress = Math.min(
        elapsed / this._activeHistoryAnimation.duration,
        1,
      );
      this._activeHistoryAnimation.progress = progress;
      if (progress >= 1) {
        this._activeHistoryAnimation = null;
      }
    }
    if (
      !this._activeHistoryAnimation &&
      this._historyAnimationQueue.length > 0
    ) {
      const nextAnimation = this._historyAnimationQueue.shift();
      if (nextAnimation) {
        this._activeHistoryAnimation = {
          ...nextAnimation,
          duration: this._historyAnimationDuration,
          progress: 0,
          startTime: now,
        };
      }
    }
  }

  private _resetHistoryAnimations() {
    if (
      this._activeHistoryAnimation ||
      this._historyAnimationQueue.length > 0
    ) {
      this._activeHistoryAnimation = null;
      this._historyAnimationQueue = [];
      this._scheduleRedraw();
    }
  }

  private _now(): number {
    return typeof performance !== 'undefined' ? performance.now() : Date.now();
  }

  private _loadPieceImage(piece: Piece): HTMLImageElement | null {
    const assetId = PIECE_ASSET_IDS[piece];
    if (!assetId) {
      return null;
    }
    const cached = this._pieceImages[piece];
    if (cached) {
      return cached.complete ? cached : null;
    }
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = PIECE_ASSET_URLS[assetId];
    image.onload = () => this._scheduleRedraw();
    this._pieceImages[piece] = image;
    return image.complete ? image : null;
  }

  private _getSelectedSquare(): Square | null {
    switch (this._state.name) {
      case 'MOUSE_DOWN_PIECE_SELECTED':
      case 'MOUSE_UP_PIECE_SELECTED':
      case 'DRAG_PIECE':
      case 'CANCEL_SELECTION_SOON':
        return this._state.square;
      default:
        return null;
    }
  }

  private _getDraggedPieceCenter(): [number, number] | null {
    if (!this._pointerBoardPosition) {
      return null;
    }
    if (this._dragPointerDelta) {
      return [
        this._pointerBoardPosition.x - this._dragPointerDelta.x,
        this._pointerBoardPosition.y - this._dragPointerDelta.y,
      ];
    }
    return [this._pointerBoardPosition.x, this._pointerBoardPosition.y];
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
  }

  /**
   * Resize the board based on the latest dimensions given to the shadow root.
   */
  resize(): void {
    this._recalculateBoardCoordinates();
    this._pieceSize = Math.min(this._polygonWidth, this._polygonHeight) * 0.8;
    this._configureCanvasSize();
    this.requestUpdate('board');
    this._scheduleRedraw();
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
      } catch (_error) {
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
   * Preloads the configured audio files and unlocks playback.
   * Call this inside a user gesture handler if you need audio before any board interaction occurs.
   */
  async prepareAudio(): Promise<void> {
    this._audioManager.allowPlayback();
    await this._audioManager.preloadAll();
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

if (!customElements.get('hexchess-board')) {
  customElements.define('hexchess-board', HexchessBoard);
}

declare global {
  interface HTMLElementTagNameMap {
    'hexchess-board': HexchessBoard;
  }
}
