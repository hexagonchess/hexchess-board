import type { Piece } from './types';

export const PIECE_VALUES: Record<Piece, number> = {
  k: 1_000,
  q: 9,
  b: 3,
  n: 3,
  r: 5,
  p: 1,
  K: 1_000,
  Q: 9,
  B: 3,
  N: 3,
  R: 5,
  P: 1,
};

export const DEFAULT_PIECE_SIZE = 60;

export const PIECE_ASSET_IDS: Record<Piece, keyof typeof PIECE_ASSET_URLS> = {
  k: 'black-king',
  q: 'black-queen',
  b: 'black-bishop',
  n: 'black-knight',
  r: 'black-rook',
  p: 'black-pawn',
  K: 'white-king',
  Q: 'white-queen',
  B: 'white-bishop',
  N: 'white-knight',
  R: 'white-rook',
  P: 'white-pawn',
};

export const renderPiece = (
  piece: Piece,
  size: number = DEFAULT_PIECE_SIZE,
  translate = true,
  srcOverride?: string,
): string => {
  if (piece === null) {
    return '';
  }
  const id = PIECE_ASSET_IDS[piece];
  if (!id) {
    return '';
  }
  const src = srcOverride ?? pieceUrls[id];
  if (!src) {
    return '';
  }
  const style = translate
    ? `transform: translate(-${size / 2}px, -${size / 2}px)`
    : '';
  return `<img
    src="${src}"
    style="${style}"
    class="piece"
    height="${size}"
    width="${size}"
  />`;
};

export const PIECE_ASSET_URLS = {
  'black-bishop':
    'https://upload.wikimedia.org/wikipedia/commons/8/81/Chess_bdt60.png?20120721213129',
  'white-bishop':
    'https://upload.wikimedia.org/wikipedia/commons/9/9b/Chess_blt60.png?20120721213130',
  'black-king':
    'https://upload.wikimedia.org/wikipedia/commons/e/e3/Chess_kdt60.png?20120721213131',
  'white-king':
    'https://upload.wikimedia.org/wikipedia/commons/3/3b/Chess_klt60.png?20120721213131',
  'black-knight':
    'https://upload.wikimedia.org/wikipedia/commons/f/f1/Chess_ndt60.png?20120721213132',
  'white-knight':
    'https://upload.wikimedia.org/wikipedia/commons/2/28/Chess_nlt60.png?20120721213133',
  'black-pawn':
    'https://upload.wikimedia.org/wikipedia/commons/c/cd/Chess_pdt60.png?20120721213133',
  'white-pawn':
    'https://upload.wikimedia.org/wikipedia/commons/0/04/Chess_plt60.png?20120721213134',
  'black-queen':
    'https://upload.wikimedia.org/wikipedia/commons/a/af/Chess_qdt60.png?20120721213134',
  'white-queen':
    'https://upload.wikimedia.org/wikipedia/commons/4/49/Chess_qlt60.png?20120721213135',
  'black-rook':
    'https://upload.wikimedia.org/wikipedia/commons/a/a0/Chess_rdt60.png?20120721213136',
  'white-rook':
    'https://upload.wikimedia.org/wikipedia/commons/5/5c/Chess_rlt60.png?20120721213128',
};

const pieceUrls = PIECE_ASSET_URLS;
