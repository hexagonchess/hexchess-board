---
layout: page.11ty.cjs
title: <hexchess-board> ⌲ Examples ⌲ Player Roles
tags: example
name: Player Roles
description: Set player roles
---

<script src="https://unpkg.com/@webcomponents/webcomponentsjs@latest/webcomponents-loader.js"></script>
<script type="module" src="https://esm.sh/@hexchess/hexchess-board@latest/hexchess-board.js?module"></script>

<script>
  document.addEventListener('keydown', (event) => {
    event.preventDefault();
  });
  document.addEventListener('keyup', (event) => {
    event.preventDefault();
    if (event.code === 'KeyF') {
      document.querySelector('hexchess-board').flip();
    } else if (event.code === 'ArrowRight') {
      document.querySelector('hexchess-board').fastForward();
    } else if (event.code === 'ArrowLeft') {
      document.querySelector('hexchess-board').rewind();
    }
  });
  window.onload = () => {
    document.querySelector('hexchess-board').resize();
  };
</script>

In case you are using these boards in conjunction with a web server, you'll want to set player roles. With player roles, the current viewer of the board can be assigned to one of the following:

* spectator - No mouse-based move operations will be allowed (but programmatic moves will still be allowed). This is intended to let spectators follow along with a game two others are playing

* white - Only make moves when it is white's turn

* black - Only make moves when it is black's turn

* analysis - Make moves for both sides. Intended for local play (two players sharing the same device) or analyzing a set of moves played in a game. **This is the default.**

```html
<div style="width: 575px; height: 500px">
  <hexchess-board
    id="hexchess-board"
    board="start"
    orientation="white"
    player-role="white"
  ></hexchess-board>
</div>
```

<div style="width: 575px; height: 500px">
  <hexchess-board
    id="hexchess-board"
    board="start"
    orientation="white"
    player-role="white"
  ></hexchess-board>
</div>
