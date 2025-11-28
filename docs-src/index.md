---
layout: page.11ty.cjs
title: <hexchess-board> ⌲ Home
---

<script src="https://unpkg.com/@webcomponents/webcomponentsjs@latest/webcomponents-loader.js"></script>
<script type="module" src="https://esm.sh/@hexchess/hexchess-board@latest/hexchess-board.js?module"></script>

# &lt;hexchess-board>

`<hexchess-board>` is a fully functional chess engine for hexagonal chess. You can either play a full game from start to finish or analyze a game by passing in a predetermined set of moves. It enforces all the moves of hexagonal chess, from en passant to checkmate.

## As easy as HTML

<section class="columns">
  <div>

`<hexchess-board>` is just an HTML element. You can it anywhere you can use HTML!

```html
<hexchess-board board="start" orientation="white" />
```

  </div>
  <div>

<div style="width: 575px; height: 500px">
<hexchess-board id="board-one" board="start" orientation="white" />
</div>

  </div>
</section>

## Declarative rendering

<section class="columns">
  <div>

`<hexchess-board>` can be used with declarative rendering libraries like Angular, React, Vue, and lit-html

```js
import {html, render} from 'lit-html';

const name = 'lit-html';

render(
  html`
    <h2>This is a &lt;hexchess-board&gt;</h2>
    <hexchess-board board="start" orientation="black" />
  `,
  document.body
);
```

  </div>
  <div>

<div style="width: 575px; height: 500px">
<hexchess-board id="board-two" board="start" orientation="black" />
</div>

  </div>
</section>

## Sound effects

Built-in cues (move, capture, check, checkmate, victory, defeat, and draw) reuse [Lichess's standard sound pack](https://github.com/lichess-org/lila/tree/master/public/sound/standard) and are preloaded as soon as the element is connected. Toggle them with the boolean `muted` attribute or the declarative `audio="off"` attribute, or swap individual files by setting the `soundPack` property from JavaScript. Defaults stream from the mirrored copies at `https://hexagonchess.github.io/hexchess-board/assets/audio/*.mp3` (see `docs/assets/audio/LICENSE` for AGPL terms), so host your own files if you need different URLs or offline access.

```html
<hexchess-board id="audio-board" board="start"></hexchess-board>
<button id="prime-audio">Enable audio</button>
<script type="module">
  const board = document.querySelector('#audio-board');
  primeAudio.addEventListener('click', async () => {
    await board.prepareAudio();
    board.soundPack = {
      move: '/assets/sounds/move.mp3',
      capture: null, // disable capture cue
    };
  });
</script>
```

The `prepareAudio()` helper lets you unlock and preload sounds during your own UI gesture (to satisfy autoplay restrictions) if your players won't click on the board directly.
