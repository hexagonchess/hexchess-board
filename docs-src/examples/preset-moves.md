---
layout: example.11ty.cjs
title: <hexchess-board> ⌲ Examples ⌲ Preset Moves
tags: example
name: Preset Moves
description: Analyzing a game that has a specific set of moves played.
---

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

<h3>HTML</h3>

Here we're building on the keyboard listener example, so you can use your left and right arrow keys to fast forward and rewind.

Because Hexchess is much newer, we've decided to disambiguate the moves as much as possible. So while a king's pawn opening might be notated as `1. E4` followed by `1. E5`, in HexChess we want to show both the starting and the ending squares. So the white pawn moving from `B1` to `B3` would be notated as `B1-B3`.

To indicate a capture, we use the `x` instead of the `-` sign. So if a pawn on B4 captured a piece on C4, we would say `B4xC4`.

En passant captures are notated with an `$` at the end. This is done to simplify the format of notations into a standard of a square, followed by `x` or `-`, followed by a square, and then either `$` or `=`.

Since hexagonal chess has no castling, we do not need to deal with that notation.

Lastly, promotion is handled with the `=` sign. So a white pawn that moved from `A5` to `A6` and became a Rook would be written as `A5-A6=R`.

For your convenience, the moves string is case insensitive. In the case of promotions, even if it was written as `a5-a6=r`, the board would know to place a *white* rook because we maintain state and know the pawn was white.

```html
<div style="width: 575px; height: 500px">
  <hexchess-board
    id="hexchess-board"
    board="start"
    frozen
    orientation="white"
    moves="B1-B3,B7-B5"
  ></hexchess-board>
</div>
```

<div style="width: 575px; height: 500px">
  <hexchess-board
    id="hexchess-board"
    board="start"
    frozen=true
    orientation="white"
    moves="B1-B3,B7-B5"
  ></hexchess-board>
</div>