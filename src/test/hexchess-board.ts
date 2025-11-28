/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { HexchessBoard } from '../hexchess-board.js';

import { assert } from '@open-wc/testing';

suite('hexchess-board', () => {
  teardown(() => {
    const instances = document.querySelectorAll('hexchess-board');
    for (const element of instances) {
      element.remove();
    }
  });

  test('is defined', () => {
    const el = document.createElement('hexchess-board');
    assert.instanceOf(el, HexchessBoard);
  });

  test('renders a canvas once connected', async () => {
    const el = document.createElement('hexchess-board') as HexchessBoard;
    document.body.appendChild(el);
    await el.updateComplete;
    const canvas = el.shadowRoot?.querySelector('canvas');
    assert.instanceOf(canvas, HTMLCanvasElement);
  });

  test('updates player names when property changes', async () => {
    const el = document.createElement('hexchess-board') as HexchessBoard;
    document.body.appendChild(el);
    await el.updateComplete;
    el.blackPlayerName = 'Tester';
    await el.updateComplete;
    const usernames = Array.from(
      el.shadowRoot?.querySelectorAll('.username') ?? [],
    ).map((node) => node.textContent ?? '');
    assert.isTrue(
      usernames.some((text) => text.includes('Tester')),
      'player name should reflect property update',
    );
  });

  test('reflects colorScheme changes through the attribute', async () => {
    const el = document.createElement('hexchess-board') as HexchessBoard;
    document.body.appendChild(el);
    await el.updateComplete;
    el.colorScheme = 'dark';
    assert.strictEqual(el.getAttribute('color-scheme'), 'dark');
    el.colorScheme = 'auto';
    assert.isNull(el.getAttribute('color-scheme'));
  });

  test('reacts to color-scheme attribute changes', async () => {
    const el = document.createElement('hexchess-board') as HexchessBoard;
    document.body.appendChild(el);
    await el.updateComplete;
    el.setAttribute('color-scheme', 'light');
    assert.strictEqual(el.colorScheme, 'light');
    el.setAttribute('color-scheme', 'dark');
    assert.strictEqual(el.colorScheme, 'dark');
    el.removeAttribute('color-scheme');
    assert.strictEqual(el.colorScheme, 'auto');
  });

  test('allows theme specific CSS overrides', async () => {
    const el = document.createElement('hexchess-board') as HexchessBoard;
    document.body.appendChild(el);
    await el.updateComplete;

    el.colorScheme = 'dark';
    el.style.setProperty('--hexchess-board-bg-dark', '#010203');
    await el.updateComplete;
    assert.strictEqual(el.__testingResolvedColors.board, '#010203');

    el.colorScheme = 'light';
    el.style.setProperty('--hexchess-board-bg-light', '#112233');
    await el.updateComplete;
    assert.strictEqual(el.__testingResolvedColors.board, '#112233');
  });
});
