---
layout: example.11ty.cjs
title: <hexchess-board> ⌲ Examples ⌲ Hex-FEN
tags: example
name: Hex-FEN Notation
description: Customizing the board layout with Hex-FEN
---

Hex-FEN is a modification on the traditional [FEN Notation](https://en.wikipedia.org/wiki/Forsyth–Edwards_Notation) in Chess.

With Hex-FEN, we start column by column, starting with column A and ending with column L. Just like in traditional FEN, a number is used to convey the number of empty squares. So a completely empty board can be represented as `6/7/8/9/10/11/10/9/8/7/6`.

We also keep all the same notation as traditional FEN, so `K` means a white king, while `k` means a black king. `N` and `n` are for knights, `P` and `p` for pawns, etc.

We do enforce that each side must at least have one King, so imaginary positions consisting of all pawns for example will produce errors!

<script src="https://unpkg.com/@webcomponents/webcomponentsjs@latest/webcomponents-loader.js"></script>
<script type="module" src="https://esm.sh/@hexchess/hexchess-board@latest/hexchess-board.js?module"></script>

<div style="display: flex; flex-wrap: wrap;">
  <div>

```html
<!-- The starting position, but with only pawns and kings -->
<hexchess-board board="6/P5p/1P4p1/2P3p2/3P2p3/4P1p4/K2P2p2k/2P3p2/1P4p1/P5p/6">

```
  </div>

  <div>
    <div style="width: 575px; height: 500px">
        <hexchess-board board="6/P5p/1P4p1/2P3p2/3P2p3/4P1p4/K2P2p2k/2P3p2/1P4p1/P5p/6" />
    </div>
  </div>
</section>
