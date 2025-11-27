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
});
