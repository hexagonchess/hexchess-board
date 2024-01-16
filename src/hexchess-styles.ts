import {css} from 'lit';

export const styles = css`
  :host {
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
    background-color: var(--hexchess-board-bg, #fcfaf2);
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

  .possible-move > polygon {
    fill: var(--hexchess-possible-move-bg, #a68a2d88);
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
