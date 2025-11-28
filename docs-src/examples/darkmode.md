---
layout: example.11ty.cjs
title: <hexchess-board> ⌲ Examples ⌲ Dark Mode
tags: example
name: Dark Mode
description: Dark and light modes are both supported.
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
  window.onload = () => {
    document.querySelector('hexchess-board').resize();
  };
</script>

We support `light`, `dark`, and window default color schemes.

```html
<div style="width: 575px; height: 500px">
  <hexchess-board
    id="hexchess-board"
    board="start"
    orientation="white"
    moves="B1-B3,B7-B5,C2-C4,D7-D5,C4xD5p,F11xB3P,C1xC7p"
    color-scheme="dark"
  ></hexchess-board>
</div>
```

<div style="width: 575px; height: 500px">
  <hexchess-board
    id="hexchess-board"
    board="start"
    orientation="white"
    moves="B1-B3,B7-B5,C2-C4,D7-D5,C4xD5p,F11xB3P,C1xC7p"
    color-scheme="dark"
  ></hexchess-board>
</div>
