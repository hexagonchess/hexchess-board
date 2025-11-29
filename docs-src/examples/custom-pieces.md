---
layout: example.11ty.cjs
title: <hexchess-board> ⌲ Examples ⌲ Custom pieces
tags: example
name: Custom pieces
description: Override the built-in set with slots
---

<script src="https://unpkg.com/@webcomponents/webcomponentsjs@latest/webcomponents-loader.js"></script>
<script type="module" src="https://esm.sh/@hexchess/hexchess-board@latest/hexchess-board.js?module"></script>

<div style="width: 575px; height: 500px">
  <hexchess-board board="start">
    <img
      slot="piece-white-king"
      src="https://raw.githubusercontent.com/clarkerubber/Staunton-Pieces/master/Trophies/Big-Gold-Cup.png"
      alt="White king trophy"
    />
    <img
      slot="piece-black-king"
      src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Set_chess_rdt45.svg"
      alt="Black glass king"
    />
  </hexchess-board>
</div>

<h3>HTML</h3>

```html
<hexchess-board board="start">
  <img
    slot="piece-white-king"
    src="https://raw.githubusercontent.com/clarkerubber/Staunton-Pieces/master/Trophies/Big-Gold-Cup.png"
    alt="White king trophy"
  />
  <img
    slot="piece-black-king"
    src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Set_chess_rdt45.svg"
    alt="Black glass king"
  />
</hexchess-board>
```

Add `<img>` tags for any other slot (`piece-white-queen`, `piece-black-pawn`, etc.) to override more pieces. Every surface of the component (canvas, captured pieces, promotions) swaps to the provided art automatically.
