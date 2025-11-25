import { css } from 'lit';

export const styles = css`
  :host {
    display: block;
    height: 100%;
    width: 100%;
    font-family: var(
      --hexchess-font,
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      system-ui,
      Helvetica,
      Arial,
      sans-serif
    );
    font-weight: 600;
  }

  .board {
    background-color: var(--hexchess-board-bg, #ffffff);
  }

  .board-canvas {
    display: block;
    width: 100%;
    height: 100%;
    touch-action: none;
  }

  .captured-pieces {
    display: flex;
    flex-direction: row;
    justify-content: start;
    align-items: center;
  }

  .cursor-grab {
    cursor: grab;
  }

  .cursor-grabbing {
    cursor: grabbing;
  }

  .game-info {
    position: absolute;
    top: 0px;
    left: 0px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    pointer-events: none;
    width: 100%;
    height: 100%;
    z-index: 3;
  }

  .hexagon {
    clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
    display: flex;
    justify-content: center;
    align-items: center;
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

  .piece {
    position: absolute;
    fill: var(--hexchess-piece-bg, #000000);
    pointer-events: none;
    z-index: 1;
  }

  .player-info {
    display: flex;
    flex-direction: column;
    justify-content: start;
  }

  .possible-capture {
    stroke: var(--hexchess-possible-capture-bg, #a96a41);
    stroke-width: 5;
    fill: none;
  }

  .possible-move-grey,
  .possible-move-black,
  .possible-move-opponent,
  .possible-move-white {
    stroke-width: 5;
    fill: none;
    pointer-events: none;
  }

  polygon.possible-move-white {
    stroke: var(--hexchess-possible-move-stroke-white, #a96a41);
  }
  polygon.possible-move-black {
    stroke: var(--hexchess-possible-move-stroke-black, #a96a41);
  }
  polygon.possible-move-grey {
    stroke: var(--hexchess-possible-move-stroke-grey, #a96a41);
  }
  polygon.possible-move-opponent {
    stroke: var(--hexchess-possible-move-stroke-opponent, #e3e3e3);
  }

  .score {
    margin: 0;
    padding: 0;
    color: var(--hexchess-score-color, black);
    font-size: var(--hexchess-score-size, 1.2rem);
  }

  .username {
    color: var(--hexchess-playername-color, black);
    font-size: var(--hexchess-playername-size, 1.4rem);
    margin: 0;
    padding: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .selected-opponent .white {
    fill: var(--hexchess-possible-move-opponent-bg, #e3e3e3);
  }
  .selected-opponent .black {
    fill: var(--hexchess-possible-move-opponent-bg, #e3e3e3);
  }
  .selected-opponent .grey {
    fill: var(--hexchess-possible-move-opponent-bg, #e3e3e3);
  }

  .white {
    fill: var(--hexchess-white-bg, #a5c8df);
  }
  .selected .white {
    fill: var(--hexchess-selected-white-bg, #e4c7b7);
  }

  .black {
    fill: var(--hexchess-black-bg, #4180a9);
  }
  .selected .black {
    fill: var(--hexchess-selected-black-bg, #e4c7b7);
  }

  .grey {
    fill: var(--hexchess-grey-bg, #80b1d0);
  }
  .selected .grey {
    fill: var(--hexchess-selected-grey-bg, #e4c7b7);
  }

  .possible-move {
    fill: var(--hexchess-possible-move-bg, #a96a41);
  }

  .opponent-move {
    fill: var(--hexchess-possible-move-opponent-bg, #e3e3e3);
  }

  .drag-piece {
    z-index: 2;
  }

  .promotion {
    cursor: pointer;
    filter: drop-shadow(2px 4px 6px black);
    position: absolute;
    display: flex;
    flex-direction: column;
    justify-content: start;
    z-index: 1;
  }
`;
