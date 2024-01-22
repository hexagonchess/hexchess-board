---
layout: example.11ty.cjs
title: <hexchess-board> ⌲ Examples ⌲ Customizing colors
tags: example
name: Customizing colors
description: Changing the look and feel of the board
---

<style>
    hexchess-board {
        --hexchess-label-bg: #0a10bf;
        --hexchess-playername-color: #cc4e47;
        --hexchess-board-bg: #ccf7c6;
        --hexchess-white-bg: #e39ac2;
        --hexchess-black-bg: #eb0985;
        --hexchess-grey-bg: #bf508d;
    }
</style>

<div style="width: 575px; height: 500px;">
    <hexchess-board />
</div>

<h3>HTML</h3>

```css
hexchess-board {
    --hexchess-label-bg: #0a10bf;
    --hexchess-playername-color: #cc4e47;
    --hexchess-board-bg: #ccf7c6;
    --hexchess-white-bg: #e39ac2;
    --hexchess-black-bg: #eb0985;
    --hexchess-grey-bg: #bf508d;
}
```

```html
<hexchess-board />
```
