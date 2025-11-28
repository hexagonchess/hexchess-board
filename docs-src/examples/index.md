---
layout: example.11ty.cjs
title: <hexchess-board> ⌲ Examples ⌲ Basic
tags: example
name: Keyboard input
description: Common keyboard operations
---

<script src="https://unpkg.com/@webcomponents/webcomponentsjs@latest/webcomponents-loader.js"></script>
<script type="module" src="https://esm.sh/@hexchess/hexchess-board@latest/hexchess-board.js?module"></script>

<script>
  document.addEventListener('keydown', (event) => {
    event.preventDefault();
    if (event.code === 'ArrowRight') {
      document.querySelector('hexchess-board').fastForward();
    } else if (event.code === 'ArrowLeft') {
      document.querySelector('hexchess-board').rewind();
    }
  });
  document.addEventListener('keyup', (event) => {
    event.preventDefault();
    if (event.code === 'KeyF') {
      document.querySelector('hexchess-board').flip();
    } else if (event.code === 'ArrowUp') {
      document.querySelector('hexchess-board').rewindAll();
    } else if (event.code === 'ArrowDown') {
      document.querySelector('hexchess-board').fastForwardAll();
    }
  });
</script>
<div style="width: 575px; height: 500px">
  <hexchess-board
    id="hexchess-board"
    board="start"
    orientation="white"
  ></hexchess-board>
</div>

<h3>HTML</h3>

<p>This chessboard responds to the rewind and fast forward commands along with flipping the orientation of the board.</p>

```html
<script>
  document.addEventListener('keydown', (event) => {
    event.preventDefault();
    if (event.code === 'ArrowRight') {
      document.querySelector('hexchess-board').fastForward();
    } else if (event.code === 'ArrowLeft') {
      document.querySelector('hexchess-board').rewind();
    }
  });
  document.addEventListener('keyup', (event) => {
    event.preventDefault();
    if (event.code === 'KeyF') {
      document.querySelector('hexchess-board').flip();
    } else if (event.code === 'ArrowUp') {
      document.querySelector('hexchess-board').rewindAll();
    } else if (event.code === 'ArrowDown') {
      document.querySelector('hexchess-board').fastForwardAll();
    }
  });
</script>
<div style="width: 100vw; height: 100vh">
  <hexchess-board
    id="hexchess-board"
    board="start"
    orientation="white"
  ></hexchess-board>
</div>
```
