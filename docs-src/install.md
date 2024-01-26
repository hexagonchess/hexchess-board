---
layout: page.11ty.cjs
title: <hexchess-board> ⌲ Install
---

# Install

`<hexchess-board>` is distributed on npm, so you can install it locally or use it via npm CDNs like unpkg.com.

## Local Installation

```bash
npm i hexchess-board
```

## CDN

npm CDNs like [unpkg.com]() can directly serve files that have been published to npm. This works great for standard JavaScript modules that the browser can load natively.

For this element to work from unpkg.com specifically, you need to include the `?module` query parameter, which tells unpkg.com to rewrite "bare" module specifiers to full URLs.

### HTML

```html
<!-- Polyfills only needed for Firefox and Edge. -->
<script src="https://unpkg.com/@webcomponents/webcomponentsjs@latest/webcomponents-loader.js"></script>
<!-- Do NOT use unpkg due to https://github.com/mjackson/unpkg/issues/351 -->
<script type="module" src="https://esm.sh/@hexchess/hexchess-board@latest/hexchess-board.js?module"></script>
```

### JavaScript

```html
import { HexchessBoard } from 'https://esm.sh/@hexchess/hexchess-board@latest/hexchess-board.js?module';
```

### NPM

```bash
npm install '@hexchess/hexchess-board'
```