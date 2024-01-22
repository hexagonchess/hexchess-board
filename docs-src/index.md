---
layout: page.11ty.cjs
title: <hexchess-board> ⌲ Home
---

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
