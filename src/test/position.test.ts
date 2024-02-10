import { Board } from '../board';
import { Position } from '../position';
import { describe, expect, test } from '@jest/globals';

describe('Position', () => {
  test('Column A should only have 1 through 6', () => {
    const rows = [...Array(11).keys()].map((key) => key + 1);
    for (const row of rows) {
      if (row < 7) {
        expect(Position.validatePosition('A', row)).toBe(true);
      } else {
        expect(Position.validatePosition('A', row)).toBe(false);
      }
    }
  });

  test('Column B should only have 1 through 7', () => {
    const rows = [...Array(11).keys()].map((key) => key + 1);
    for (const row of rows) {
      if (row < 8) {
        expect(Position.validatePosition('B', row)).toBe(true);
      } else {
        expect(Position.validatePosition('B', row)).toBe(false);
      }
    }
  });

  test('Column C should only have 1 through 8', () => {
    const rows = [...Array(11).keys()].map((key) => key + 1);
    for (const row of rows) {
      if (row < 9) {
        expect(Position.validatePosition('C', row)).toBe(true);
      } else {
        expect(Position.validatePosition('C', row)).toBe(false);
      }
    }
  });

  test('Column D should only have 1 through 9', () => {
    const rows = [...Array(11).keys()].map((key) => key + 1);
    for (const row of rows) {
      if (row < 10) {
        expect(Position.validatePosition('D', row)).toBe(true);
      } else {
        expect(Position.validatePosition('D', row)).toBe(false);
      }
    }
  });

  test('Column E should only have 1 through 10', () => {
    const rows = [...Array(11).keys()].map((key) => key + 1);
    for (const row of rows) {
      if (row < 11) {
        expect(Position.validatePosition('E', row)).toBe(true);
      } else {
        expect(Position.validatePosition('E', row)).toBe(false);
      }
    }
  });

  test('Column F should only have 1 through 11', () => {
    const rows = [...Array(11).keys()].map((key) => key + 1);
    for (const row of rows) {
      expect(Position.validatePosition('F', row)).toBe(true);
    }
  });

  test('Column G should only have 1 through 10', () => {
    const rows = [...Array(11).keys()].map((key) => key + 1);
    for (const row of rows) {
      if (row < 11) {
        expect(Position.validatePosition('G', row)).toBe(true);
      } else {
        expect(Position.validatePosition('G', row)).toBe(false);
      }
    }
  });

  test('Column H should only have 1 through 9', () => {
    const rows = [...Array(11).keys()].map((key) => key + 1);
    for (const row of rows) {
      if (row < 10) {
        expect(Position.validatePosition('H', row)).toBe(true);
      } else {
        expect(Position.validatePosition('H', row)).toBe(false);
      }
    }
  });

  test('Column I should only have 1 through 8', () => {
    const rows = [...Array(11).keys()].map((key) => key + 1);
    for (const row of rows) {
      if (row < 9) {
        expect(Position.validatePosition('I', row)).toBe(true);
      } else {
        expect(Position.validatePosition('I', row)).toBe(false);
      }
    }
  });

  test('Column K should only have 1 through 7', () => {
    const rows = [...Array(11).keys()].map((key) => key + 1);
    for (const row of rows) {
      if (row < 8) {
        expect(Position.validatePosition('K', row)).toBe(true);
      } else {
        expect(Position.validatePosition('K', row)).toBe(false);
      }
    }
  });

  test('Column L should only have 1 through 6', () => {
    const rows = [...Array(11).keys()].map((key) => key + 1);
    for (const row of rows) {
      if (row < 7) {
        expect(Position.validatePosition('L', row)).toBe(true);
      } else {
        expect(Position.validatePosition('L', row)).toBe(false);
      }
    }
  });

  test('There should be 91 total, unique valid positions', () => {
    const positions = Position.allPositions();
    expect(positions.length).toBe(91);
    const unique = new Set(positions);
    expect(unique.size).toBe(91);
  });

  test('Correctly determines isBeginningOfColumn', () => {
    expect(new Position('A', 1).isBeginningOfColumn()).toBe(true);
    for (let i = 2; i <= 6; i++) {
      expect(new Position('A', i).isBeginningOfColumn()).toBe(false);
    }

    expect(new Position('B', 1).isBeginningOfColumn()).toBe(true);
    for (let i = 2; i <= 7; i++) {
      expect(new Position('B', i).isBeginningOfColumn()).toBe(false);
    }

    expect(new Position('C', 1).isBeginningOfColumn()).toBe(true);
    for (let i = 2; i <= 8; i++) {
      expect(new Position('C', i).isBeginningOfColumn()).toBe(false);
    }

    expect(new Position('D', 1).isBeginningOfColumn()).toBe(true);
    for (let i = 2; i <= 9; i++) {
      expect(new Position('D', i).isBeginningOfColumn()).toBe(false);
    }

    expect(new Position('E', 1).isBeginningOfColumn()).toBe(true);
    for (let i = 2; i <= 10; i++) {
      expect(new Position('E', i).isBeginningOfColumn()).toBe(false);
    }

    expect(new Position('F', 1).isBeginningOfColumn()).toBe(true);
    for (let i = 2; i <= 11; i++) {
      expect(new Position('F', i).isBeginningOfColumn()).toBe(false);
    }

    expect(new Position('G', 1).isBeginningOfColumn()).toBe(true);
    for (let i = 2; i <= 10; i++) {
      expect(new Position('G', i).isBeginningOfColumn()).toBe(false);
    }

    expect(new Position('H', 1).isBeginningOfColumn()).toBe(true);
    for (let i = 2; i <= 9; i++) {
      expect(new Position('H', i).isBeginningOfColumn()).toBe(false);
    }

    expect(new Position('I', 1).isBeginningOfColumn()).toBe(true);
    for (let i = 2; i <= 8; i++) {
      expect(new Position('I', i).isBeginningOfColumn()).toBe(false);
    }

    expect(new Position('K', 1).isBeginningOfColumn()).toBe(true);
    for (let i = 2; i <= 7; i++) {
      expect(new Position('K', i).isBeginningOfColumn()).toBe(false);
    }

    expect(new Position('L', 1).isBeginningOfColumn()).toBe(true);
    for (let i = 2; i <= 6; i++) {
      expect(new Position('L', i).isBeginningOfColumn()).toBe(false);
    }
  });

  test('Correctly determines isEndOfColumn', () => {
    for (let i = 1; i <= 5; i++) {
      expect(new Position('A', i).isEndOfColumn()).toBe(false);
    }
    expect(new Position('A', 6).isEndOfColumn()).toBe(true);

    for (let i = 1; i <= 6; i++) {
      expect(new Position('B', i).isEndOfColumn()).toBe(false);
    }
    expect(new Position('B', 7).isEndOfColumn()).toBe(true);

    for (let i = 1; i <= 7; i++) {
      expect(new Position('C', i).isEndOfColumn()).toBe(false);
    }
    expect(new Position('C', 8).isEndOfColumn()).toBe(true);

    for (let i = 1; i <= 8; i++) {
      expect(new Position('D', i).isEndOfColumn()).toBe(false);
    }
    expect(new Position('D', 9).isEndOfColumn()).toBe(true);

    for (let i = 1; i <= 9; i++) {
      expect(new Position('E', i).isEndOfColumn()).toBe(false);
    }
    expect(new Position('E', 10).isEndOfColumn()).toBe(true);

    for (let i = 1; i <= 10; i++) {
      expect(new Position('F', i).isEndOfColumn()).toBe(false);
    }
    expect(new Position('F', 11).isEndOfColumn()).toBe(true);

    for (let i = 1; i <= 9; i++) {
      expect(new Position('G', i).isEndOfColumn()).toBe(false);
    }
    expect(new Position('G', 10).isEndOfColumn()).toBe(true);

    for (let i = 1; i <= 8; i++) {
      expect(new Position('H', i).isEndOfColumn()).toBe(false);
    }
    expect(new Position('H', 9).isEndOfColumn()).toBe(true);

    for (let i = 1; i <= 7; i++) {
      expect(new Position('I', i).isEndOfColumn()).toBe(false);
    }
    expect(new Position('I', 8).isEndOfColumn()).toBe(true);

    for (let i = 1; i <= 6; i++) {
      expect(new Position('K', i).isEndOfColumn()).toBe(false);
    }
    expect(new Position('K', 7).isEndOfColumn()).toBe(true);

    for (let i = 1; i <= 5; i++) {
      expect(new Position('L', i).isEndOfColumn()).toBe(false);
    }
    expect(new Position('L', 6).isEndOfColumn()).toBe(true);
  });

  test('Detects isBeginningOfRow correctly', () => {
    const positions = Position.allPositions();
    positions.forEach((position) => {
      switch (position.col) {
        case 'A':
        case 'B': {
          expect(position.isBeginningOfRow()).toBe(true);
          break;
        }
        case 'C': {
          expect(position.isBeginningOfRow()).toBe(
            position.row === 1 || position.row === 8,
          );
          break;
        }
        case 'D': {
          expect(position.isBeginningOfRow()).toBe(
            position.row === 1 || position.row === 9,
          );
          break;
        }
        case 'E': {
          expect(position.isBeginningOfRow()).toBe(
            position.row === 1 || position.row === 10,
          );
          break;
        }
        case 'F': {
          expect(position.isBeginningOfRow()).toBe(
            position.row === 1 || position.row === 11,
          );
          break;
        }
        default: {
          expect(position.isBeginningOfRow()).toBe(false);
          break;
        }
      }
    });
  });

  test('Detects isEndOfRow correctly', () => {
    const positions = Position.allPositions();
    positions.forEach((position) => {
      switch (position.col) {
        case 'L':
        case 'K': {
          expect(position.isEndOfRow()).toBe(true);
          break;
        }
        case 'F': {
          expect(position.isEndOfRow()).toBe(
            position.row === 1 || position.row === 11,
          );
          break;
        }
        case 'G': {
          expect(position.isEndOfRow()).toBe(
            position.row === 1 || position.row === 10,
          );
          break;
        }
        case 'H': {
          expect(position.isEndOfRow()).toBe(
            position.row === 1 || position.row === 9,
          );
          break;
        }
        case 'I': {
          expect(position.isEndOfRow()).toBe(
            position.row === 1 || position.row === 8,
          );
          break;
        }
        default: {
          expect(position.isEndOfRow()).toBe(false);
          break;
        }
      }
    });
  });

  test('Correctly converts to string and square', () => {
    expect(new Position('A', 1).toString()).toBe('A1');
    expect(new Position('A', 1).toSquare()).toBe('A1');

    expect(new Position('F', 11).toString()).toBe('F11');
    expect(new Position('F', 11).toSquare()).toBe('F11');
  });

  test('Determines whether we can get the next position or not correctly', () => {
    // Cannot get next position if next position is null
    const starting = new Position('A', 6);
    const getNextPos = () => starting.getTopPosition();
    const result = Position.canGetNextPosition(
      'white',
      starting,
      Board.new(),
      getNextPos,
    );
    expect(result).toBe(false);

    // Cannot get the next position if it's occupied
    const starting2 = new Position('B', 6);
    const result2 = Position.canGetNextPosition(
      'white',
      starting2,
      Board.new(),
      getNextPos,
    );
    expect(result2).toBe(false);

    // Cannot go to the next position if current position is occupied by an enemy piece
    const result3 = Position.canGetNextPosition(
      'white',
      new Position('B', 7),
      Board.new(),
      getNextPos,
    );
    expect(result3).toBe(false);
  });

  test('Gets the top position for any position correctly', () => {
    Position.allPositions().forEach((pos) => {
      if (pos.isEndOfColumn()) {
        expect(pos.getTopPosition()).toBe(null);
      } else {
        expect(pos.getTopPosition()).toEqual(
          new Position(pos.col, pos.row + 1),
        );
      }
    });
  });

  test('Gets the top right position for any position correctly', () => {
    for (let row = 1; row <= 6; row++) {
      expect(new Position('A', row).getTopRightPosition()).toEqual(
        new Position('B', row + 1),
      );
    }

    for (let row = 1; row <= 7; row++) {
      expect(new Position('B', row).getTopRightPosition()).toEqual(
        new Position('C', row + 1),
      );
    }

    for (let row = 1; row <= 8; row++) {
      expect(new Position('C', row).getTopRightPosition()).toEqual(
        new Position('D', row + 1),
      );
    }

    for (let row = 1; row <= 9; row++) {
      expect(new Position('D', row).getTopRightPosition()).toEqual(
        new Position('E', row + 1),
      );
    }

    for (let row = 1; row <= 10; row++) {
      expect(new Position('E', row).getTopRightPosition()).toEqual(
        new Position('F', row + 1),
      );
    }

    for (let row = 1; row <= 11; row++) {
      if (row === 11) {
        expect(new Position('F', row).getTopRightPosition()).toBe(null);
      } else {
        expect(new Position('F', row).getTopRightPosition()).toEqual(
          new Position('G', row),
        );
      }
    }

    for (let row = 1; row <= 10; row++) {
      if (row === 10) {
        expect(new Position('G', row).getTopRightPosition()).toBe(null);
      } else {
        expect(new Position('G', row).getTopRightPosition()).toEqual(
          new Position('H', row),
        );
      }
    }

    for (let row = 1; row <= 9; row++) {
      if (row === 9) {
        expect(new Position('H', row).getTopRightPosition()).toBe(null);
      } else {
        expect(new Position('H', row).getTopRightPosition()).toEqual(
          new Position('I', row),
        );
      }
    }

    for (let row = 1; row <= 8; row++) {
      if (row === 8) {
        expect(new Position('I', row).getTopRightPosition()).toBe(null);
      } else {
        expect(new Position('I', row).getTopRightPosition()).toEqual(
          new Position('K', row),
        );
      }
    }

    for (let row = 1; row <= 7; row++) {
      if (row === 7) {
        expect(new Position('K', row).getTopRightPosition()).toBe(null);
      } else {
        expect(new Position('K', row).getTopRightPosition()).toEqual(
          new Position('L', row),
        );
      }
    }

    for (let row = 1; row <= 6; row++) {
      expect(new Position('L', row).getTopRightPosition()).toBe(null);
    }
  });

  test('Gets the skip top right position for any position correctly', () => {
    for (let row = 1; row <= 5; row++) {
      expect(new Position('A', row).getSkipTopRightPosition()).toEqual(
        new Position('B', row + 2),
      );
    }
    expect(new Position('A', 6).getSkipTopRightPosition()).toBe(null);

    for (let row = 1; row <= 6; row++) {
      expect(new Position('B', row).getSkipTopRightPosition()).toEqual(
        new Position('C', row + 2),
      );
    }
    expect(new Position('B', 7).getSkipTopRightPosition()).toBe(null);

    for (let row = 1; row <= 7; row++) {
      expect(new Position('C', row).getSkipTopRightPosition()).toEqual(
        new Position('D', row + 2),
      );
    }
    expect(new Position('C', 8).getSkipTopRightPosition()).toBe(null);

    for (let row = 1; row <= 8; row++) {
      expect(new Position('D', row).getSkipTopRightPosition()).toEqual(
        new Position('E', row + 2),
      );
    }
    expect(new Position('D', 9).getSkipTopRightPosition()).toBe(null);

    for (let row = 1; row <= 9; row++) {
      expect(new Position('E', row).getSkipTopRightPosition()).toEqual(
        new Position('F', row + 2),
      );
    }
    expect(new Position('E', 10).getSkipTopRightPosition()).toBe(null);

    for (let row = 1; row <= 9; row++) {
      expect(new Position('F', row).getSkipTopRightPosition()).toEqual(
        new Position('G', row + 1),
      );
    }
    expect(new Position('F', 10).getSkipTopRightPosition()).toBe(null);
    expect(new Position('F', 11).getSkipTopRightPosition()).toBe(null);

    for (let row = 1; row <= 8; row++) {
      expect(new Position('G', row).getSkipTopRightPosition()).toEqual(
        new Position('H', row + 1),
      );
    }
    expect(new Position('G', 9).getSkipTopRightPosition()).toBe(null);
    expect(new Position('G', 10).getSkipTopRightPosition()).toBe(null);

    for (let row = 1; row <= 7; row++) {
      expect(new Position('H', row).getSkipTopRightPosition()).toEqual(
        new Position('I', row + 1),
      );
    }
    expect(new Position('H', 8).getSkipTopRightPosition()).toBe(null);
    expect(new Position('H', 9).getSkipTopRightPosition()).toBe(null);

    for (let row = 1; row <= 6; row++) {
      expect(new Position('I', row).getSkipTopRightPosition()).toEqual(
        new Position('K', row + 1),
      );
    }
    expect(new Position('I', 7).getSkipTopRightPosition()).toBe(null);
    expect(new Position('I', 8).getSkipTopRightPosition()).toBe(null);

    for (let row = 1; row <= 5; row++) {
      expect(new Position('K', row).getSkipTopRightPosition()).toEqual(
        new Position('L', row + 1),
      );
    }
    expect(new Position('K', 6).getSkipTopRightPosition()).toBe(null);
    expect(new Position('K', 7).getSkipTopRightPosition()).toBe(null);

    for (let row = 1; row <= 4; row++) {
      expect(new Position('L', row).getSkipTopRightPosition()).toBe(null);
    }
    expect(new Position('L', 5).getSkipTopRightPosition()).toBe(null);
    expect(new Position('L', 6).getSkipTopRightPosition()).toBe(null);
  });

  test('Gets the right position of any postion correctly', () => {
    for (let row = 1; row <= 6; row++) {
      expect(new Position('A', row).getRightPosition()).toEqual(
        new Position('C', row + 1),
      );
    }

    for (let row = 1; row <= 7; row++) {
      expect(new Position('B', row).getRightPosition()).toEqual(
        new Position('D', row + 1),
      );
    }

    for (let row = 1; row <= 8; row++) {
      expect(new Position('C', row).getRightPosition()).toEqual(
        new Position('E', row + 1),
      );
    }

    for (let row = 1; row <= 9; row++) {
      expect(new Position('D', row).getRightPosition()).toEqual(
        new Position('F', row + 1),
      );
    }

    for (let row = 1; row <= 10; row++) {
      expect(new Position('E', row).getRightPosition()).toEqual(
        new Position('G', row),
      );
    }

    for (let row = 1; row <= 11; row++) {
      if (row === 1 || row === 11) {
        expect(new Position('F', row).getRightPosition()).toBe(null);
      } else {
        expect(new Position('F', row).getRightPosition()).toEqual(
          new Position('H', row - 1),
        );
      }
    }

    for (let row = 1; row <= 10; row++) {
      if (row === 1 || row === 10) {
        expect(new Position('G', row).getRightPosition()).toBe(null);
      } else {
        expect(new Position('G', row).getRightPosition()).toEqual(
          new Position('I', row - 1),
        );
      }
    }

    for (let row = 1; row <= 9; row++) {
      if (row === 1 || row === 9) {
        expect(new Position('H', row).getRightPosition()).toBe(null);
      } else {
        expect(new Position('H', row).getRightPosition()).toEqual(
          new Position('K', row - 1),
        );
      }
    }

    for (let row = 1; row <= 8; row++) {
      if (row === 1 || row === 8) {
        expect(new Position('I', row).getRightPosition()).toBe(null);
      } else {
        expect(new Position('I', row).getRightPosition()).toEqual(
          new Position('L', row - 1),
        );
      }
    }

    for (let row = 1; row <= 7; row++) {
      expect(new Position('K', row).getRightPosition()).toEqual(null);
    }

    for (let row = 1; row <= 6; row++) {
      expect(new Position('L', row).getRightPosition()).toEqual(null);
    }
  });

  test('Get the bottom right position for any position correctly', () => {
    for (let i = 1; i <= 6; i++) {
      expect(new Position('A', i).getBottomRightPosition()).toEqual(
        new Position('B', i),
      );
    }

    for (let i = 1; i <= 7; i++) {
      expect(new Position('B', i).getBottomRightPosition()).toEqual(
        new Position('C', i),
      );
    }

    for (let i = 1; i <= 8; i++) {
      expect(new Position('C', i).getBottomRightPosition()).toEqual(
        new Position('D', i),
      );
    }

    for (let i = 1; i <= 9; i++) {
      expect(new Position('D', i).getBottomRightPosition()).toEqual(
        new Position('E', i),
      );
    }

    for (let i = 1; i <= 10; i++) {
      expect(new Position('E', i).getBottomRightPosition()).toEqual(
        new Position('F', i),
      );
    }

    for (let i = 1; i <= 11; i++) {
      if (i === 1) {
        expect(new Position('F', i).getBottomRightPosition()).toBe(null);
      } else {
        expect(new Position('F', i).getBottomRightPosition()).toEqual(
          new Position('G', i - 1),
        );
      }
    }

    for (let i = 1; i <= 10; i++) {
      if (i === 1) {
        expect(new Position('G', i).getBottomRightPosition()).toBe(null);
      } else {
        expect(new Position('G', i).getBottomRightPosition()).toEqual(
          new Position('H', i - 1),
        );
      }
    }

    for (let i = 1; i <= 9; i++) {
      if (i === 1) {
        expect(new Position('H', i).getBottomRightPosition()).toBe(null);
      } else {
        expect(new Position('H', i).getBottomRightPosition()).toEqual(
          new Position('I', i - 1),
        );
      }
    }

    for (let i = 1; i <= 8; i++) {
      if (i === 1) {
        expect(new Position('I', i).getBottomRightPosition()).toBe(null);
      } else {
        expect(new Position('I', i).getBottomRightPosition()).toEqual(
          new Position('K', i - 1),
        );
      }
    }

    for (let i = 1; i <= 7; i++) {
      if (i === 1) {
        expect(new Position('K', i).getBottomRightPosition()).toBe(null);
      } else {
        expect(new Position('K', i).getBottomRightPosition()).toEqual(
          new Position('L', i - 1),
        );
      }
    }

    for (let i = 1; i <= 6; i++) {
      expect(new Position('L', i).getBottomRightPosition()).toBe(null);
    }
  });

  test('Gets the skip bottom right position for any position correctly', () => {
    expect(new Position('A', 1).getSkipBottomRightPosition()).toEqual(null);
    for (let row = 2; row <= 6; row++) {
      expect(new Position('A', row).getSkipBottomRightPosition()).toEqual(
        new Position('B', row - 1),
      );
    }

    expect(new Position('B', 1).getSkipBottomRightPosition()).toEqual(null);
    for (let row = 2; row <= 7; row++) {
      expect(new Position('B', row).getSkipBottomRightPosition()).toEqual(
        new Position('C', row - 1),
      );
    }

    expect(new Position('C', 1).getSkipBottomRightPosition()).toEqual(null);
    for (let row = 2; row <= 8; row++) {
      expect(new Position('C', row).getSkipBottomRightPosition()).toEqual(
        new Position('D', row - 1),
      );
    }

    expect(new Position('D', 1).getSkipBottomRightPosition()).toEqual(null);
    for (let row = 2; row <= 9; row++) {
      expect(new Position('D', row).getSkipBottomRightPosition()).toEqual(
        new Position('E', row - 1),
      );
    }

    expect(new Position('E', 1).getSkipBottomRightPosition()).toEqual(null);
    for (let row = 2; row <= 10; row++) {
      expect(new Position('E', row).getSkipBottomRightPosition()).toEqual(
        new Position('F', row - 1),
      );
    }

    expect(new Position('F', 1).getSkipBottomRightPosition()).toEqual(null);
    expect(new Position('F', 2).getSkipBottomRightPosition()).toEqual(null);
    for (let row = 3; row <= 11; row++) {
      expect(new Position('F', row).getSkipBottomRightPosition()).toEqual(
        new Position('G', row - 2),
      );
    }

    expect(new Position('G', 1).getSkipBottomRightPosition()).toEqual(null);
    expect(new Position('G', 2).getSkipBottomRightPosition()).toEqual(null);
    for (let row = 3; row <= 10; row++) {
      expect(new Position('G', row).getSkipBottomRightPosition()).toEqual(
        new Position('H', row - 2),
      );
    }

    expect(new Position('H', 1).getSkipBottomRightPosition()).toEqual(null);
    expect(new Position('H', 2).getSkipBottomRightPosition()).toEqual(null);
    for (let row = 3; row <= 9; row++) {
      expect(new Position('H', row).getSkipBottomRightPosition()).toEqual(
        new Position('I', row - 2),
      );
    }

    expect(new Position('I', 1).getSkipBottomRightPosition()).toEqual(null);
    expect(new Position('I', 2).getSkipBottomRightPosition()).toEqual(null);
    for (let row = 3; row <= 8; row++) {
      expect(new Position('I', row).getSkipBottomRightPosition()).toEqual(
        new Position('K', row - 2),
      );
    }

    expect(new Position('K', 1).getSkipBottomRightPosition()).toEqual(null);
    expect(new Position('K', 2).getSkipBottomRightPosition()).toEqual(null);
    for (let row = 3; row <= 7; row++) {
      expect(new Position('K', row).getSkipBottomRightPosition()).toEqual(
        new Position('L', row - 2),
      );
    }

    for (let row = 1; row <= 6; row++) {
      expect(new Position('L', row).getSkipBottomRightPosition()).toEqual(null);
    }
  });

  test('Gets the bottom position for any position correctly', () => {
    Position.allPositions().forEach((pos) => {
      if (pos.row === 1) {
        expect(pos.getBottomPosition()).toBe(null);
      } else {
        expect(pos.getBottomPosition()).toEqual(
          new Position(pos.col, pos.row - 1),
        );
      }
    });
  });

  test('Gets the bottom left position for any position correctly', () => {
    for (let row = 1; row <= 6; row++) {
      expect(new Position('A', row).getBottomLeftPosition()).toEqual(null);
    }

    for (let row = 1; row <= 7; row++) {
      if (row === 1) {
        expect(new Position('B', row).getBottomLeftPosition()).toEqual(null);
      } else {
        expect(new Position('B', row).getBottomLeftPosition()).toEqual(
          new Position('A', row - 1),
        );
      }
    }

    for (let row = 1; row <= 8; row++) {
      if (row === 1) {
        expect(new Position('C', row).getBottomLeftPosition()).toEqual(null);
      } else {
        expect(new Position('C', row).getBottomLeftPosition()).toEqual(
          new Position('B', row - 1),
        );
      }
    }

    for (let row = 1; row <= 9; row++) {
      if (row === 1) {
        expect(new Position('D', row).getBottomLeftPosition()).toEqual(null);
      } else {
        expect(new Position('D', row).getBottomLeftPosition()).toEqual(
          new Position('C', row - 1),
        );
      }
    }

    for (let row = 1; row <= 10; row++) {
      if (row === 1) {
        expect(new Position('E', row).getBottomLeftPosition()).toEqual(null);
      } else {
        expect(new Position('E', row).getBottomLeftPosition()).toEqual(
          new Position('D', row - 1),
        );
      }
    }

    for (let row = 1; row <= 11; row++) {
      if (row === 1) {
        expect(new Position('F', row).getBottomLeftPosition()).toEqual(null);
      } else {
        expect(new Position('F', row).getBottomLeftPosition()).toEqual(
          new Position('E', row - 1),
        );
      }
    }

    for (let row = 1; row <= 10; row++) {
      expect(new Position('G', row).getBottomLeftPosition()).toEqual(
        new Position('F', row),
      );
    }

    for (let row = 1; row <= 9; row++) {
      expect(new Position('H', row).getBottomLeftPosition()).toEqual(
        new Position('G', row),
      );
    }

    for (let row = 1; row <= 8; row++) {
      expect(new Position('I', row).getBottomLeftPosition()).toEqual(
        new Position('H', row),
      );
    }

    for (let row = 1; row <= 7; row++) {
      expect(new Position('K', row).getBottomLeftPosition()).toEqual(
        new Position('I', row),
      );
    }

    for (let row = 1; row <= 6; row++) {
      expect(new Position('L', row).getBottomLeftPosition()).toEqual(
        new Position('K', row),
      );
    }
  });

  test('Gets the skip bottom left position for any position correctly', () => {
    for (let row = 1; row <= 6; row++) {
      expect(new Position('A', row).getSkipBottomLeftPosition()).toEqual(null);
    }

    expect(new Position('B', 1).getSkipBottomLeftPosition()).toEqual(null);
    expect(new Position('B', 2).getSkipBottomLeftPosition()).toEqual(null);
    for (let row = 3; row <= 7; row++) {
      expect(new Position('B', row).getSkipBottomLeftPosition()).toEqual(
        new Position('A', row - 2),
      );
    }

    expect(new Position('C', 1).getSkipBottomLeftPosition()).toEqual(null);
    expect(new Position('C', 2).getSkipBottomLeftPosition()).toEqual(null);
    for (let row = 3; row <= 8; row++) {
      expect(new Position('C', row).getSkipBottomLeftPosition()).toEqual(
        new Position('B', row - 2),
      );
    }

    expect(new Position('D', 1).getSkipBottomLeftPosition()).toEqual(null);
    expect(new Position('D', 2).getSkipBottomLeftPosition()).toEqual(null);
    for (let row = 3; row <= 9; row++) {
      expect(new Position('D', row).getSkipBottomLeftPosition()).toEqual(
        new Position('C', row - 2),
      );
    }

    expect(new Position('E', 1).getSkipBottomLeftPosition()).toEqual(null);
    expect(new Position('E', 2).getSkipBottomLeftPosition()).toEqual(null);
    for (let row = 3; row <= 10; row++) {
      expect(new Position('E', row).getSkipBottomLeftPosition()).toEqual(
        new Position('D', row - 2),
      );
    }

    expect(new Position('F', 1).getSkipBottomLeftPosition()).toEqual(null);
    expect(new Position('F', 2).getSkipBottomLeftPosition()).toEqual(null);
    for (let row = 3; row <= 11; row++) {
      expect(new Position('F', row).getSkipBottomLeftPosition()).toEqual(
        new Position('E', row - 2),
      );
    }

    expect(new Position('G', 1).getSkipBottomLeftPosition()).toEqual(null);
    for (let row = 2; row <= 10; row++) {
      expect(new Position('G', row).getSkipBottomLeftPosition()).toEqual(
        new Position('F', row - 1),
      );
    }

    expect(new Position('H', 1).getSkipBottomLeftPosition()).toEqual(null);
    for (let row = 2; row <= 9; row++) {
      expect(new Position('H', row).getSkipBottomLeftPosition()).toEqual(
        new Position('G', row - 1),
      );
    }

    expect(new Position('I', 1).getSkipBottomLeftPosition()).toEqual(null);
    for (let row = 2; row <= 8; row++) {
      expect(new Position('I', row).getSkipBottomLeftPosition()).toEqual(
        new Position('H', row - 1),
      );
    }

    expect(new Position('K', 1).getSkipBottomLeftPosition()).toEqual(null);
    for (let row = 2; row <= 7; row++) {
      expect(new Position('K', row).getSkipBottomLeftPosition()).toEqual(
        new Position('I', row - 1),
      );
    }

    expect(new Position('L', 1).getSkipBottomLeftPosition()).toEqual(null);
    for (let row = 2; row <= 6; row++) {
      expect(new Position('L', row).getSkipBottomLeftPosition()).toEqual(
        new Position('K', row - 1),
      );
    }
  });

  test('Gest the left position for any position correctly', () => {
    for (let row = 1; row <= 6; row++) {
      expect(new Position('A', row).getLeftPosition()).toEqual(null);
    }

    for (let row = 1; row <= 7; row++) {
      expect(new Position('B', row).getLeftPosition()).toEqual(null);
    }

    for (let row = 1; row <= 8; row++) {
      if (row === 1 || row === 8) {
        expect(new Position('C', row).getLeftPosition()).toBe(null);
      } else {
        expect(new Position('C', row).getLeftPosition()).toEqual(
          new Position('A', row - 1),
        );
      }
    }

    for (let row = 1; row <= 9; row++) {
      if (row === 1 || row === 9) {
        expect(new Position('D', row).getLeftPosition()).toBe(null);
      } else {
        expect(new Position('D', row).getLeftPosition()).toEqual(
          new Position('B', row - 1),
        );
      }
    }

    for (let row = 1; row <= 10; row++) {
      if (row === 1 || row === 10) {
        expect(new Position('E', row).getLeftPosition()).toBe(null);
      } else {
        expect(new Position('E', row).getLeftPosition()).toEqual(
          new Position('C', row - 1),
        );
      }
    }

    for (let row = 1; row <= 11; row++) {
      if (row === 1 || row === 11) {
        expect(new Position('F', row).getLeftPosition()).toBe(null);
      } else {
        expect(new Position('F', row).getLeftPosition()).toEqual(
          new Position('D', row - 1),
        );
      }
    }

    for (let row = 1; row <= 10; row++) {
      expect(new Position('G', row).getLeftPosition()).toEqual(
        new Position('E', row),
      );
    }

    for (let row = 1; row <= 9; row++) {
      expect(new Position('H', row).getLeftPosition()).toEqual(
        new Position('F', row + 1),
      );
    }

    for (let row = 1; row <= 8; row++) {
      expect(new Position('I', row).getLeftPosition()).toEqual(
        new Position('G', row + 1),
      );
    }

    for (let row = 1; row <= 7; row++) {
      expect(new Position('K', row).getLeftPosition()).toEqual(
        new Position('H', row + 1),
      );
    }

    for (let row = 1; row <= 6; row++) {
      expect(new Position('L', row).getLeftPosition()).toEqual(
        new Position('I', row + 1),
      );
    }
  });

  test('Gets the top left position for any position correctly', () => {
    for (let row = 1; row <= 6; row++) {
      expect(new Position('A', row).getTopLeftPosition()).toEqual(null);
    }

    for (let row = 1; row <= 7; row++) {
      if (row === 7) {
        expect(new Position('B', row).getTopLeftPosition()).toBe(null);
      } else {
        expect(new Position('B', row).getTopLeftPosition()).toEqual(
          new Position('A', row),
        );
      }
    }

    for (let row = 1; row <= 8; row++) {
      if (row === 8) {
        expect(new Position('C', row).getTopLeftPosition()).toBe(null);
      } else {
        expect(new Position('C', row).getTopLeftPosition()).toEqual(
          new Position('B', row),
        );
      }
    }

    for (let row = 1; row <= 9; row++) {
      if (row === 9) {
        expect(new Position('D', row).getTopLeftPosition()).toBe(null);
      } else {
        expect(new Position('D', row).getTopLeftPosition()).toEqual(
          new Position('C', row),
        );
      }
    }

    for (let row = 1; row <= 10; row++) {
      if (row === 10) {
        expect(new Position('E', row).getTopLeftPosition()).toBe(null);
      } else {
        expect(new Position('E', row).getTopLeftPosition()).toEqual(
          new Position('D', row),
        );
      }
    }

    for (let row = 1; row <= 11; row++) {
      if (row === 11) {
        expect(new Position('F', row).getTopLeftPosition()).toBe(null);
      } else {
        expect(new Position('F', row).getTopLeftPosition()).toEqual(
          new Position('E', row),
        );
      }
    }

    for (let row = 1; row <= 10; row++) {
      expect(new Position('G', row).getTopLeftPosition()).toEqual(
        new Position('F', row + 1),
      );
    }

    for (let row = 1; row <= 9; row++) {
      expect(new Position('H', row).getTopLeftPosition()).toEqual(
        new Position('G', row + 1),
      );
    }

    for (let row = 1; row <= 8; row++) {
      expect(new Position('I', row).getTopLeftPosition()).toEqual(
        new Position('H', row + 1),
      );
    }

    for (let row = 1; row <= 7; row++) {
      expect(new Position('K', row).getTopLeftPosition()).toEqual(
        new Position('I', row + 1),
      );
    }

    for (let row = 1; row <= 6; row++) {
      expect(new Position('L', row).getTopLeftPosition()).toEqual(
        new Position('K', row + 1),
      );
    }
  });

  test('Gets the skip top left position for any position correctly', () => {
    for (let row = 1; row <= 6; row++) {
      expect(new Position('A', row).getSkipTopLeftPosition()).toEqual(null);
    }

    for (let row = 1; row <= 5; row++) {
      expect(new Position('B', row).getSkipTopLeftPosition()).toEqual(
        new Position('A', row + 1),
      );
    }
    expect(new Position('B', 6).getSkipTopLeftPosition()).toEqual(null);
    expect(new Position('B', 7).getSkipTopLeftPosition()).toEqual(null);

    for (let row = 1; row <= 6; row++) {
      expect(new Position('C', row).getSkipTopLeftPosition()).toEqual(
        new Position('B', row + 1),
      );
    }
    expect(new Position('C', 7).getSkipTopLeftPosition()).toEqual(null);
    expect(new Position('C', 8).getSkipTopLeftPosition()).toEqual(null);

    for (let row = 1; row <= 7; row++) {
      expect(new Position('D', row).getSkipTopLeftPosition()).toEqual(
        new Position('C', row + 1),
      );
    }
    expect(new Position('D', 8).getSkipTopLeftPosition()).toEqual(null);
    expect(new Position('D', 9).getSkipTopLeftPosition()).toEqual(null);

    for (let row = 1; row <= 8; row++) {
      expect(new Position('E', row).getSkipTopLeftPosition()).toEqual(
        new Position('D', row + 1),
      );
    }
    expect(new Position('E', 9).getSkipTopLeftPosition()).toEqual(null);
    expect(new Position('E', 10).getSkipTopLeftPosition()).toEqual(null);

    for (let row = 1; row <= 9; row++) {
      expect(new Position('F', row).getSkipTopLeftPosition()).toEqual(
        new Position('E', row + 1),
      );
    }
    expect(new Position('F', 10).getSkipTopLeftPosition()).toEqual(null);
    expect(new Position('F', 11).getSkipTopLeftPosition()).toEqual(null);

    for (let row = 1; row <= 9; row++) {
      expect(new Position('G', row).getSkipTopLeftPosition()).toEqual(
        new Position('F', row + 2),
      );
    }
    expect(new Position('G', 10).getSkipTopLeftPosition()).toEqual(null);

    for (let row = 1; row <= 8; row++) {
      expect(new Position('H', row).getSkipTopLeftPosition()).toEqual(
        new Position('G', row + 2),
      );
    }
    expect(new Position('H', 9).getSkipTopLeftPosition()).toEqual(null);

    for (let row = 1; row <= 7; row++) {
      expect(new Position('I', row).getSkipTopLeftPosition()).toEqual(
        new Position('H', row + 2),
      );
    }
    expect(new Position('I', 8).getSkipTopLeftPosition()).toEqual(null);

    for (let row = 1; row <= 6; row++) {
      expect(new Position('K', row).getSkipTopLeftPosition()).toEqual(
        new Position('I', row + 2),
      );
    }
    expect(new Position('K', 7).getSkipTopLeftPosition()).toEqual(null);

    for (let row = 1; row <= 5; row++) {
      expect(new Position('L', row).getSkipTopLeftPosition()).toEqual(
        new Position('K', row + 2),
      );
    }
    expect(new Position('L', 6).getSkipTopLeftPosition()).toEqual(null);
  });

  test('Gets all top positions correctly', () => {
    expect(new Position('A', 1).getAllTopPositions().length).toBe(5);
    expect(new Position('A', 2).getAllTopPositions().length).toBe(4);
    expect(new Position('A', 3).getAllTopPositions().length).toBe(3);
    expect(new Position('A', 4).getAllTopPositions().length).toBe(2);
    expect(new Position('A', 5).getAllTopPositions().length).toBe(1);
    expect(new Position('A', 6).getAllTopPositions().length).toBe(0);
  });

  test('Gets all top right positions correctly', () => {
    expect(new Position('A', 1).getAllTopRightPositions().length).toBe(10);
    expect(new Position('A', 2).getAllTopRightPositions().length).toBe(9);
    expect(new Position('A', 3).getAllTopRightPositions().length).toBe(8);
    expect(new Position('A', 4).getAllTopRightPositions().length).toBe(7);
    expect(new Position('A', 5).getAllTopRightPositions().length).toBe(6);
    expect(new Position('A', 6).getAllTopRightPositions().length).toBe(5);

    expect(new Position('B', 1).getAllTopRightPositions().length).toBe(9);
    expect(new Position('C', 1).getAllTopRightPositions().length).toBe(8);
    expect(new Position('D', 1).getAllTopRightPositions().length).toBe(7);
    expect(new Position('E', 1).getAllTopRightPositions().length).toBe(6);
    expect(new Position('F', 1).getAllTopRightPositions().length).toBe(5);

    expect(new Position('F', 6).getAllTopRightPositions().length).toBe(5);
    expect(new Position('I', 4).getAllTopRightPositions().length).toBe(2);
    expect(new Position('K', 5).getAllTopRightPositions().length).toBe(1);

    expect(new Position('L', 1).getAllTopRightPositions().length).toBe(0);
    expect(new Position('L', 2).getAllTopRightPositions().length).toBe(0);
    expect(new Position('L', 3).getAllTopRightPositions().length).toBe(0);
    expect(new Position('L', 4).getAllTopRightPositions().length).toBe(0);
    expect(new Position('L', 5).getAllTopRightPositions().length).toBe(0);
    expect(new Position('L', 6).getAllTopRightPositions().length).toBe(0);
  });

  test('Gets all bottom right positions correctly', () => {
    expect(new Position('A', 1).getAllBottomRightPositions().length).toBe(5);
    expect(new Position('A', 2).getAllBottomRightPositions().length).toBe(6);
    expect(new Position('A', 3).getAllBottomRightPositions().length).toBe(7);
    expect(new Position('A', 4).getAllBottomRightPositions().length).toBe(8);
    expect(new Position('A', 5).getAllBottomRightPositions().length).toBe(9);
    expect(new Position('A', 6).getAllBottomRightPositions().length).toBe(10);

    expect(new Position('B', 1).getAllBottomRightPositions().length).toBe(4);
    expect(new Position('C', 1).getAllBottomRightPositions().length).toBe(3);
    expect(new Position('D', 1).getAllBottomRightPositions().length).toBe(2);
    expect(new Position('E', 1).getAllBottomRightPositions().length).toBe(1);
    expect(new Position('F', 1).getAllBottomRightPositions().length).toBe(0);

    expect(new Position('F', 6).getAllBottomRightPositions().length).toBe(5);
    expect(new Position('I', 4).getAllBottomRightPositions().length).toBe(2);
    expect(new Position('K', 5).getAllBottomRightPositions().length).toBe(1);

    expect(new Position('L', 1).getAllBottomRightPositions().length).toBe(0);
    expect(new Position('L', 2).getAllBottomRightPositions().length).toBe(0);
    expect(new Position('L', 3).getAllBottomRightPositions().length).toBe(0);
    expect(new Position('L', 4).getAllBottomRightPositions().length).toBe(0);
    expect(new Position('L', 5).getAllBottomRightPositions().length).toBe(0);
    expect(new Position('L', 6).getAllBottomRightPositions().length).toBe(0);
  });

  test('Gets all bottom positions correctly', () => {
    expect(new Position('A', 1).getAllBottomPositions().length).toBe(0);
    expect(new Position('A', 2).getAllBottomPositions().length).toBe(1);
    expect(new Position('A', 3).getAllBottomPositions().length).toBe(2);
    expect(new Position('A', 4).getAllBottomPositions().length).toBe(3);
    expect(new Position('A', 5).getAllBottomPositions().length).toBe(4);
    expect(new Position('A', 6).getAllBottomPositions().length).toBe(5);
  });

  test('Gets all bottom left positions correctly', () => {
    expect(new Position('L', 6).getAllBottomLeftPositions().length).toBe(10);
    expect(new Position('L', 5).getAllBottomLeftPositions().length).toBe(9);
    expect(new Position('L', 4).getAllBottomLeftPositions().length).toBe(8);
    expect(new Position('L', 3).getAllBottomLeftPositions().length).toBe(7);
    expect(new Position('L', 2).getAllBottomLeftPositions().length).toBe(6);
    expect(new Position('L', 1).getAllBottomLeftPositions().length).toBe(5);

    expect(new Position('F', 11).getAllBottomLeftPositions().length).toBe(5);
    expect(new Position('G', 10).getAllBottomLeftPositions().length).toBe(6);
    expect(new Position('H', 9).getAllBottomLeftPositions().length).toBe(7);
    expect(new Position('I', 8).getAllBottomLeftPositions().length).toBe(8);
    expect(new Position('K', 7).getAllBottomLeftPositions().length).toBe(9);

    expect(new Position('F', 6).getAllBottomLeftPositions().length).toBe(5);
    expect(new Position('D', 5).getAllBottomLeftPositions().length).toBe(3);
    expect(new Position('B', 4).getAllBottomLeftPositions().length).toBe(1);

    expect(new Position('A', 1).getAllBottomLeftPositions().length).toBe(0);
    expect(new Position('A', 2).getAllBottomLeftPositions().length).toBe(0);
    expect(new Position('A', 3).getAllBottomLeftPositions().length).toBe(0);
    expect(new Position('A', 4).getAllBottomLeftPositions().length).toBe(0);
    expect(new Position('A', 5).getAllBottomLeftPositions().length).toBe(0);
    expect(new Position('A', 6).getAllBottomLeftPositions().length).toBe(0);

    expect(new Position('B', 1).getAllBottomLeftPositions().length).toBe(0);
    expect(new Position('C', 1).getAllBottomLeftPositions().length).toBe(0);
    expect(new Position('D', 1).getAllBottomLeftPositions().length).toBe(0);
    expect(new Position('E', 1).getAllBottomLeftPositions().length).toBe(0);
    expect(new Position('F', 1).getAllBottomLeftPositions().length).toBe(0);
  });

  test('Gets all top left positions correctly', () => {
    // Beginning column positions
    expect(new Position('L', 6).getAllTopLeftPositions().length).toBe(5);
    expect(new Position('L', 5).getAllTopLeftPositions().length).toBe(6);
    expect(new Position('L', 4).getAllTopLeftPositions().length).toBe(7);
    expect(new Position('L', 3).getAllTopLeftPositions().length).toBe(8);
    expect(new Position('L', 2).getAllTopLeftPositions().length).toBe(9);
    expect(new Position('L', 1).getAllTopLeftPositions().length).toBe(10);

    expect(new Position('K', 1).getAllTopLeftPositions().length).toBe(9);
    expect(new Position('I', 1).getAllTopLeftPositions().length).toBe(8);
    expect(new Position('H', 1).getAllTopLeftPositions().length).toBe(7);
    expect(new Position('G', 1).getAllTopLeftPositions().length).toBe(6);
    expect(new Position('F', 1).getAllTopLeftPositions().length).toBe(5);

    // Middle column positions
    expect(new Position('F', 6).getAllTopLeftPositions().length).toBe(5);
    expect(new Position('D', 5).getAllTopLeftPositions().length).toBe(3);
    expect(new Position('B', 4).getAllTopLeftPositions().length).toBe(1);

    // End of column positions
    expect(new Position('A', 1).getAllTopLeftPositions().length).toBe(0);
    expect(new Position('A', 2).getAllTopLeftPositions().length).toBe(0);
    expect(new Position('A', 3).getAllTopLeftPositions().length).toBe(0);
    expect(new Position('A', 4).getAllTopLeftPositions().length).toBe(0);
    expect(new Position('A', 5).getAllTopLeftPositions().length).toBe(0);
    expect(new Position('A', 6).getAllTopLeftPositions().length).toBe(0);

    expect(new Position('B', 7).getAllTopLeftPositions().length).toBe(0);
    expect(new Position('C', 8).getAllTopLeftPositions().length).toBe(0);
    expect(new Position('D', 9).getAllTopLeftPositions().length).toBe(0);
    expect(new Position('E', 10).getAllTopLeftPositions().length).toBe(0);
    expect(new Position('F', 11).getAllTopLeftPositions().length).toBe(0);
  });

  test('Gets all skip top right positions correctly', () => {
    for (let i = 1; i <= 6; i++) {
      expect(new Position('A', i).getAllSkipTopRightPositions().length).toBe(
        6 - i,
      );
    }

    for (let i = 1; i <= 7; i++) {
      if (i === 1 || i === 2) {
        expect(new Position('B', i).getAllSkipTopRightPositions().length).toBe(
          6 - i,
        );
      } else if (i === 3) {
        expect(new Position('B', i).getAllSkipTopRightPositions().length).toBe(
          4,
        );
      } else {
        expect(new Position('B', i).getAllSkipTopRightPositions().length).toBe(
          7 - i,
        );
      }
    }

    for (let i = 1; i <= 8; i++) {
      if (i === 1) {
        expect(new Position('C', i).getAllSkipTopRightPositions().length).toBe(
          5,
        );
      } else if (i === 2 || i === 3) {
        expect(new Position('C', i).getAllSkipTopRightPositions().length).toBe(
          4,
        );
      } else if (i === 4) {
        expect(new Position('C', i).getAllSkipTopRightPositions().length).toBe(
          3,
        );
      } else {
        expect(new Position('C', i).getAllSkipTopRightPositions().length).toBe(
          8 - i,
        );
      }
    }

    for (let i = 1; i <= 9; i++) {
      if (i === 1) {
        expect(new Position('D', i).getAllSkipTopRightPositions().length).toBe(
          5,
        );
      } else if (i === 2 || i === 3) {
        expect(new Position('D', i).getAllSkipTopRightPositions().length).toBe(
          4,
        );
      } else if (i === 4 || i === 5) {
        expect(new Position('D', i).getAllSkipTopRightPositions().length).toBe(
          3,
        );
      } else if (i === 6) {
        expect(new Position('D', i).getAllSkipTopRightPositions().length).toBe(
          2,
        );
      } else {
        expect(new Position('D', i).getAllSkipTopRightPositions().length).toBe(
          9 - i,
        );
      }
    }

    for (let i = 1; i <= 10; i++) {
      if (i === 1) {
        expect(new Position('E', i).getAllSkipTopRightPositions().length).toBe(
          5,
        );
      } else if (i === 2 || i === 3) {
        expect(new Position('E', i).getAllSkipTopRightPositions().length).toBe(
          4,
        );
      } else if (i === 4 || i === 5) {
        expect(new Position('E', i).getAllSkipTopRightPositions().length).toBe(
          3,
        );
      } else if (i === 6 || i === 7) {
        expect(new Position('E', i).getAllSkipTopRightPositions().length).toBe(
          2,
        );
      } else if (i === 8) {
        expect(new Position('E', i).getAllSkipTopRightPositions().length).toBe(
          1,
        );
      } else {
        expect(new Position('E', i).getAllSkipTopRightPositions().length).toBe(
          10 - i,
        );
      }
    }

    for (let i = 1; i <= 11; i++) {
      if (i === 1) {
        expect(new Position('F', i).getAllSkipTopRightPositions().length).toBe(
          5,
        );
      } else if (i === 2 || i === 3) {
        expect(new Position('F', i).getAllSkipTopRightPositions().length).toBe(
          4,
        );
      } else if (i === 4 || i === 5) {
        expect(new Position('F', i).getAllSkipTopRightPositions().length).toBe(
          3,
        );
      } else if (i === 6 || i === 7) {
        expect(new Position('F', i).getAllSkipTopRightPositions().length).toBe(
          2,
        );
      } else if (i === 8 || i === 9) {
        expect(new Position('F', i).getAllSkipTopRightPositions().length).toBe(
          1,
        );
      } else {
        expect(new Position('F', i).getAllSkipTopRightPositions().length).toBe(
          0,
        );
      }
    }

    for (let i = 1; i <= 10; i++) {
      if (i === 1 || i === 2) {
        expect(new Position('G', i).getAllSkipTopRightPositions().length).toBe(
          4,
        );
      } else if (i === 3 || i === 4) {
        expect(new Position('G', i).getAllSkipTopRightPositions().length).toBe(
          3,
        );
      } else if (i === 5 || i === 6) {
        expect(new Position('G', i).getAllSkipTopRightPositions().length).toBe(
          2,
        );
      } else if (i === 7 || i === 8) {
        expect(new Position('G', i).getAllSkipTopRightPositions().length).toBe(
          1,
        );
      } else {
        expect(new Position('G', i).getAllSkipTopRightPositions().length).toBe(
          0,
        );
      }
    }
    for (let i = 1; i <= 9; i++) {
      if (i >= 1 && i <= 3) {
        expect(new Position('H', i).getAllSkipTopRightPositions().length).toBe(
          3,
        );
      } else if (i === 4 || i === 5) {
        expect(new Position('H', i).getAllSkipTopRightPositions().length).toBe(
          2,
        );
      } else if (i === 6 || i === 7) {
        expect(new Position('H', i).getAllSkipTopRightPositions().length).toBe(
          1,
        );
      } else {
        expect(new Position('H', i).getAllSkipTopRightPositions().length).toBe(
          0,
        );
      }
    }
    for (let i = 0; i <= 8; i++) {
      if (i === 5 || i === 6) {
        expect(new Position('I', i).getAllSkipTopRightPositions().length).toBe(
          1,
        );
      } else if (i === 7 || i === 8) {
        expect(new Position('I', i).getAllSkipTopRightPositions().length).toBe(
          0,
        );
      } else {
        expect(new Position('I', i).getAllSkipTopRightPositions().length).toBe(
          2,
        );
      }
    }
    for (let i = 1; i <= 7; i++) {
      if (i === 6 || i === 7) {
        expect(new Position('K', i).getAllSkipTopRightPositions().length).toBe(
          0,
        );
      } else {
        expect(new Position('K', i).getAllSkipTopRightPositions().length).toBe(
          1,
        );
      }
    }
    for (let i = 1; i <= 6; i++) {
      expect(new Position('L', i).getAllSkipTopRightPositions().length).toBe(0);
    }
  });

  test('Gets all right positions correctly', () => {
    for (let i = 1; i <= 6; i++) {
      expect(new Position('A', i).getAllRightPositions().length).toBe(5);
    }

    for (let i = 1; i <= 7; i++) {
      expect(new Position('B', i).getAllRightPositions().length).toBe(4);
    }

    for (let i = 1; i <= 8; i++) {
      if (i === 1 || i === 8) {
        expect(new Position('C', i).getAllRightPositions().length).toBe(3);
      } else {
        expect(new Position('C', i).getAllRightPositions().length).toBe(4);
      }
    }

    for (let i = 1; i <= 9; i++) {
      if (i === 1 || i === 9) {
        expect(new Position('D', i).getAllRightPositions().length).toBe(2);
      } else {
        expect(new Position('D', i).getAllRightPositions().length).toBe(3);
      }
    }

    for (let i = 1; i <= 10; i++) {
      if (i === 1 || i === 10) {
        expect(new Position('E', i).getAllRightPositions().length).toBe(1);
      } else if (i === 2 || i === 9) {
        expect(new Position('E', i).getAllRightPositions().length).toBe(2);
      } else {
        expect(new Position('E', i).getAllRightPositions().length).toBe(3);
      }
    }

    for (let i = 1; i <= 11; i++) {
      if (i === 1 || i === 11) {
        expect(new Position('F', i).getAllRightPositions().length).toBe(0);
      } else if (i === 2 || i === 10) {
        expect(new Position('F', i).getAllRightPositions().length).toBe(1);
      } else {
        expect(new Position('F', i).getAllRightPositions().length).toBe(2);
      }
    }

    for (let i = 1; i <= 10; i++) {
      if (i === 1 || i === 10) {
        expect(new Position('G', i).getAllRightPositions().length).toBe(0);
      } else if (i === 2 || i === 9) {
        expect(new Position('G', i).getAllRightPositions().length).toBe(1);
      } else {
        expect(new Position('G', i).getAllRightPositions().length).toBe(2);
      }
    }

    for (let i = 1; i <= 9; i++) {
      if (i === 1 || i === 9) {
        expect(new Position('H', i).getAllRightPositions().length).toBe(0);
      } else {
        expect(new Position('H', i).getAllRightPositions().length).toBe(1);
      }
    }

    for (let i = 1; i <= 8; i++) {
      if (i === 1 || i === 8) {
        expect(new Position('I', i).getAllRightPositions().length).toBe(0);
      } else {
        expect(new Position('I', i).getAllRightPositions().length).toBe(1);
      }
    }

    for (let i = 1; i <= 7; i++) {
      expect(new Position('K', i).getAllRightPositions().length).toBe(0);
    }

    for (let i = 1; i <= 6; i++) {
      expect(new Position('L', i).getAllRightPositions().length).toBe(0);
    }
  });

  test('Gets all skip bottom right positions correctly', () => {
    for (let i = 1; i <= 6; i++) {
      expect(new Position('A', i).getAllSkipBottomRightPositions().length).toBe(
        i - 1,
      );
    }

    for (let i = 1; i <= 7; i++) {
      if (i === 6 || i === 7) {
        expect(
          new Position('B', i).getAllSkipBottomRightPositions().length,
        ).toBe(i - 2);
      } else {
        expect(
          new Position('B', i).getAllSkipBottomRightPositions().length,
        ).toBe(i - 1);
      }
    }

    for (let i = 1; i <= 8; i++) {
      if (i <= 4) {
        expect(
          new Position('C', i).getAllSkipBottomRightPositions().length,
        ).toBe(i - 1);
      } else if (i >= 7) {
        expect(
          new Position('C', i).getAllSkipBottomRightPositions().length,
        ).toBe(i - 3);
      } else {
        expect(
          new Position('C', i).getAllSkipBottomRightPositions().length,
        ).toBe(i - 2);
      }
    }

    for (let i = 1; i <= 9; i++) {
      if (i < 4) {
        expect(
          new Position('D', i).getAllSkipBottomRightPositions().length,
        ).toBe(i - 1);
      } else if (i < 6) {
        expect(
          new Position('D', i).getAllSkipBottomRightPositions().length,
        ).toBe(i - 2);
      } else if (i < 8) {
        expect(
          new Position('D', i).getAllSkipBottomRightPositions().length,
        ).toBe(i - 3);
      } else {
        expect(
          new Position('D', i).getAllSkipBottomRightPositions().length,
        ).toBe(i - 4);
      }
    }

    for (let i = 1; i <= 10; i++) {
      if (i === 1) {
        expect(
          new Position('E', i).getAllSkipBottomRightPositions().length,
        ).toBe(0);
      } else if (i < 4) {
        expect(
          new Position('E', i).getAllSkipBottomRightPositions().length,
        ).toBe(1);
      } else if (i < 6) {
        expect(
          new Position('E', i).getAllSkipBottomRightPositions().length,
        ).toBe(2);
      } else if (i < 8) {
        expect(
          new Position('E', i).getAllSkipBottomRightPositions().length,
        ).toBe(3);
      } else if (i < 10) {
        expect(
          new Position('E', i).getAllSkipBottomRightPositions().length,
        ).toBe(4);
      } else {
        expect(
          new Position('E', i).getAllSkipBottomRightPositions().length,
        ).toBe(5);
      }
    }

    for (let i = 1; i <= 11; i++) {
      if (i < 3) {
        expect(
          new Position('F', i).getAllSkipBottomRightPositions().length,
        ).toBe(0);
      } else if (i < 5) {
        expect(
          new Position('F', i).getAllSkipBottomRightPositions().length,
        ).toBe(1);
      } else if (i < 7) {
        expect(
          new Position('F', i).getAllSkipBottomRightPositions().length,
        ).toBe(2);
      } else if (i < 9) {
        expect(
          new Position('F', i).getAllSkipBottomRightPositions().length,
        ).toBe(3);
      } else if (i < 11) {
        expect(
          new Position('F', i).getAllSkipBottomRightPositions().length,
        ).toBe(4);
      } else {
        expect(
          new Position('F', i).getAllSkipBottomRightPositions().length,
        ).toBe(5);
      }
    }

    for (let i = 1; i <= 10; i++) {
      if (i < 3) {
        expect(
          new Position('G', i).getAllSkipBottomRightPositions().length,
        ).toBe(0);
      } else if (i < 5) {
        expect(
          new Position('G', i).getAllSkipBottomRightPositions().length,
        ).toBe(1);
      } else if (i < 7) {
        expect(
          new Position('G', i).getAllSkipBottomRightPositions().length,
        ).toBe(2);
      } else if (i < 9) {
        expect(
          new Position('G', i).getAllSkipBottomRightPositions().length,
        ).toBe(3);
      } else {
        expect(
          new Position('G', i).getAllSkipBottomRightPositions().length,
        ).toBe(4);
      }
    }

    for (let i = 1; i <= 9; i++) {
      if (i < 3) {
        expect(
          new Position('H', i).getAllSkipBottomRightPositions().length,
        ).toBe(0);
      } else if (i < 5) {
        expect(
          new Position('H', i).getAllSkipBottomRightPositions().length,
        ).toBe(1);
      } else if (i < 7) {
        expect(
          new Position('H', i).getAllSkipBottomRightPositions().length,
        ).toBe(2);
      } else {
        expect(
          new Position('H', i).getAllSkipBottomRightPositions().length,
        ).toBe(3);
      }
    }

    for (let i = 1; i <= 8; i++) {
      if (i < 3) {
        expect(
          new Position('I', i).getAllSkipBottomRightPositions().length,
        ).toBe(0);
      } else if (i < 5) {
        expect(
          new Position('I', i).getAllSkipBottomRightPositions().length,
        ).toBe(1);
      } else {
        expect(
          new Position('I', i).getAllSkipBottomRightPositions().length,
        ).toBe(2);
      }
    }

    for (let i = 1; i <= 7; i++) {
      if (i < 3) {
        expect(
          new Position('K', i).getAllSkipBottomRightPositions().length,
        ).toBe(0);
      } else {
        expect(
          new Position('K', i).getAllSkipBottomRightPositions().length,
        ).toBe(1);
      }
    }

    for (let i = 1; i <= 6; i++) {
      expect(new Position('L', i).getAllSkipBottomRightPositions().length).toBe(
        0,
      );
    }
  });

  test('Gets all skip bottom left positions correctly', () => {
    for (let i = 1; i <= 6; i++) {
      expect(new Position('A', i).getAllSkipBottomLeftPositions().length).toBe(
        0,
      );
    }

    for (let i = 1; i <= 7; i++) {
      if (i < 3) {
        expect(
          new Position('B', i).getAllSkipBottomLeftPositions().length,
        ).toBe(0);
      } else {
        expect(
          new Position('B', i).getAllSkipBottomLeftPositions().length,
        ).toBe(1);
      }
    }

    for (let i = 1; i <= 8; i++) {
      if (i < 3) {
        expect(
          new Position('C', i).getAllSkipBottomLeftPositions().length,
        ).toBe(0);
      } else if (i < 5) {
        expect(
          new Position('C', i).getAllSkipBottomLeftPositions().length,
        ).toBe(1);
      } else {
        expect(
          new Position('C', i).getAllSkipBottomLeftPositions().length,
        ).toBe(2);
      }
    }

    for (let i = 1; i <= 9; i++) {
      if (i < 5) {
        expect(
          new Position('D', i).getAllSkipBottomLeftPositions().length,
        ).toBe(Math.floor(i / 3));
      } else if (i < 7) {
        expect(
          new Position('D', i).getAllSkipBottomLeftPositions().length,
        ).toBe(2);
      } else {
        expect(
          new Position('D', i).getAllSkipBottomLeftPositions().length,
        ).toBe(3);
      }
    }

    for (let i = 1; i <= 10; i++) {
      if (i < 3) {
        expect(
          new Position('E', i).getAllSkipBottomLeftPositions().length,
        ).toBe(0);
      } else if (i < 5) {
        expect(
          new Position('E', i).getAllSkipBottomLeftPositions().length,
        ).toBe(1);
      } else if (i < 7) {
        expect(
          new Position('E', i).getAllSkipBottomLeftPositions().length,
        ).toBe(2);
      } else if (i < 9) {
        expect(
          new Position('E', i).getAllSkipBottomLeftPositions().length,
        ).toBe(3);
      } else {
        expect(
          new Position('E', i).getAllSkipBottomLeftPositions().length,
        ).toBe(4);
      }
    }

    for (let i = 1; i <= 11; i++) {
      const numPositions = new Position('F', i).getAllSkipBottomLeftPositions()
        .length;
      switch (i) {
        case 1:
        case 2:
          expect(numPositions).toBe(0);
          break;
        case 3:
        case 4:
          expect(numPositions).toBe(1);
          break;
        case 5:
        case 6:
          expect(numPositions).toBe(2);
          break;
        case 7:
        case 8:
          expect(numPositions).toBe(3);
          break;
        case 9:
        case 10:
          expect(numPositions).toBe(4);
          break;
        case 11:
          expect(numPositions).toBe(5);
          break;
      }
    }

    for (let i = 1; i <= 10; i++) {
      expect(new Position('G', i).getAllSkipBottomLeftPositions().length).toBe(
        Math.floor(i / 2),
      );
    }

    for (let i = 1; i <= 9; i++) {
      if (i < 4) {
        expect(
          new Position('H', i).getAllSkipBottomLeftPositions().length,
        ).toBe(i - 1);
      } else if (i < 6) {
        expect(
          new Position('H', i).getAllSkipBottomLeftPositions().length,
        ).toBe(i - 2);
      } else if (i < 8) {
        expect(
          new Position('H', i).getAllSkipBottomLeftPositions().length,
        ).toBe(i - 3);
      } else {
        expect(
          new Position('H', i).getAllSkipBottomLeftPositions().length,
        ).toBe(i - 4);
      }
    }

    for (let i = 1; i <= 8; i++) {
      if (i < 5) {
        expect(
          new Position('I', i).getAllSkipBottomLeftPositions().length,
        ).toBe(i - 1);
      } else if (i < 7) {
        expect(
          new Position('I', i).getAllSkipBottomLeftPositions().length,
        ).toBe(i - 2);
      } else {
        expect(
          new Position('I', i).getAllSkipBottomLeftPositions().length,
        ).toBe(i - 3);
      }
    }

    for (let i = 1; i <= 7; i++) {
      if (i < 6) {
        expect(
          new Position('K', i).getAllSkipBottomLeftPositions().length,
        ).toBe(i - 1);
      } else {
        expect(
          new Position('K', i).getAllSkipBottomLeftPositions().length,
        ).toBe(i - 2);
      }
    }

    for (let i = 1; i <= 6; i++) {
      expect(new Position('L', i).getAllSkipBottomLeftPositions().length).toBe(
        i - 1,
      );
    }
  });

  test('Get all left positions correctly', () => {
    for (let i = 1; i <= 6; i++) {
      expect(new Position('A', i).getAllLeftPositions().length).toBe(0);
    }

    for (let i = 1; i <= 7; i++) {
      expect(new Position('B', i).getAllLeftPositions().length).toBe(0);
    }

    for (let i = 1; i <= 8; i++) {
      if (i === 1 || i === 8) {
        expect(new Position('C', i).getAllLeftPositions().length).toBe(0);
      } else {
        expect(new Position('C', i).getAllLeftPositions().length).toBe(1);
      }
    }

    for (let i = 1; i <= 9; i++) {
      if (i === 1 || i === 9) {
        expect(new Position('D', i).getAllLeftPositions().length).toBe(0);
      } else {
        expect(new Position('D', i).getAllLeftPositions().length).toBe(1);
      }
    }

    for (let i = 1; i <= 10; i++) {
      if (i === 1 || i === 10) {
        expect(new Position('E', i).getAllLeftPositions().length).toBe(0);
      } else if (i === 2 || i === 9) {
        expect(new Position('E', i).getAllLeftPositions().length).toBe(1);
      } else {
        expect(new Position('E', i).getAllLeftPositions().length).toBe(2);
      }
    }

    for (let i = 1; i <= 11; i++) {
      if (i === 1 || i === 11) {
        expect(new Position('F', i).getAllLeftPositions().length).toBe(0);
      } else if (i === 2 || i === 10) {
        expect(new Position('F', i).getAllLeftPositions().length).toBe(1);
      } else {
        expect(new Position('F', i).getAllLeftPositions().length).toBe(2);
      }
    }

    for (let i = 1; i <= 10; i++) {
      if (i === 1 || i === 10) {
        expect(new Position('G', i).getAllLeftPositions().length).toBe(1);
      } else if (i === 2 || i === 9) {
        expect(new Position('G', i).getAllLeftPositions().length).toBe(2);
      } else {
        expect(new Position('G', i).getAllLeftPositions().length).toBe(3);
      }
    }

    for (let i = 1; i <= 9; i++) {
      if (i === 1 || i === 9) {
        expect(new Position('H', i).getAllLeftPositions().length).toBe(2);
      } else {
        expect(new Position('H', i).getAllLeftPositions().length).toBe(3);
      }
    }

    for (let i = 1; i <= 8; i++) {
      if (i === 1 || i === 8) {
        expect(new Position('I', i).getAllLeftPositions().length).toBe(3);
      } else {
        expect(new Position('I', i).getAllLeftPositions().length).toBe(4);
      }
    }

    for (let i = 1; i <= 7; i++) {
      expect(new Position('K', i).getAllLeftPositions().length).toBe(4);
    }

    for (let i = 1; i <= 6; i++) {
      expect(new Position('L', i).getAllLeftPositions().length).toBe(5);
    }
  });

  test('Get all skip top left positions correctly', () => {
    for (let i = 1; i <= 6; i++) {
      expect(new Position('A', i).getAllSkipTopLeftPositions().length).toBe(0);
    }

    for (let i = 1; i <= 7; i++) {
      if (i === 6 || i === 7) {
        expect(new Position('B', i).getAllSkipTopLeftPositions().length).toBe(
          0,
        );
      } else {
        expect(new Position('B', i).getAllSkipTopLeftPositions().length).toBe(
          1,
        );
      }
    }

    for (let i = 1; i <= 8; i++) {
      if (i < 5) {
        expect(new Position('C', i).getAllSkipTopLeftPositions().length).toBe(
          2,
        );
      } else if (i < 7) {
        expect(new Position('C', i).getAllSkipTopLeftPositions().length).toBe(
          1,
        );
      } else {
        expect(new Position('C', i).getAllSkipTopLeftPositions().length).toBe(
          0,
        );
      }
    }

    for (let i = 1; i <= 9; i++) {
      if (i < 4) {
        expect(new Position('D', i).getAllSkipTopLeftPositions().length).toBe(
          3,
        );
      } else if (i < 6) {
        expect(new Position('D', i).getAllSkipTopLeftPositions().length).toBe(
          2,
        );
      } else if (i < 8) {
        expect(new Position('D', i).getAllSkipTopLeftPositions().length).toBe(
          1,
        );
      } else {
        expect(new Position('D', i).getAllSkipTopLeftPositions().length).toBe(
          0,
        );
      }
    }

    for (let i = 1; i <= 10; i++) {
      if (i < 3) {
        expect(new Position('E', i).getAllSkipTopLeftPositions().length).toBe(
          4,
        );
      } else if (i < 5) {
        expect(new Position('E', i).getAllSkipTopLeftPositions().length).toBe(
          3,
        );
      } else if (i < 7) {
        expect(new Position('E', i).getAllSkipTopLeftPositions().length).toBe(
          2,
        );
      } else if (i < 9) {
        expect(new Position('E', i).getAllSkipTopLeftPositions().length).toBe(
          1,
        );
      } else {
        expect(new Position('E', i).getAllSkipTopLeftPositions().length).toBe(
          0,
        );
      }
    }

    for (let i = 1; i <= 11; i++) {
      if (i < 3) {
        expect(new Position('F', i).getAllSkipTopLeftPositions().length).toBe(
          6 - i,
        );
      } else if (i < 5) {
        expect(new Position('F', i).getAllSkipTopLeftPositions().length).toBe(
          7 - i,
        );
      } else if (i < 7) {
        expect(new Position('F', i).getAllSkipTopLeftPositions().length).toBe(
          8 - i,
        );
      } else if (i < 9) {
        expect(new Position('F', i).getAllSkipTopLeftPositions().length).toBe(
          9 - i,
        );
      } else if (i === 9) {
        expect(new Position('F', i).getAllSkipTopLeftPositions().length).toBe(
          1,
        );
      } else {
        expect(new Position('F', i).getAllSkipTopLeftPositions().length).toBe(
          0,
        );
      }
    }

    for (let i = 1; i <= 10; i++) {
      if (i < 3) {
        expect(new Position('G', i).getAllSkipTopLeftPositions().length).toBe(
          6 - i,
        );
      } else if (i < 5) {
        expect(new Position('G', i).getAllSkipTopLeftPositions().length).toBe(
          7 - i,
        );
      } else if (i < 7) {
        expect(new Position('G', i).getAllSkipTopLeftPositions().length).toBe(
          8 - i,
        );
      } else if (i < 9) {
        expect(new Position('G', i).getAllSkipTopLeftPositions().length).toBe(
          9 - i,
        );
      } else {
        expect(new Position('G', i).getAllSkipTopLeftPositions().length).toBe(
          10 - i,
        );
      }
    }

    for (let i = 1; i <= 9; i++) {
      if (i < 3) {
        expect(new Position('H', i).getAllSkipTopLeftPositions().length).toBe(
          6 - i,
        );
      } else if (i < 5) {
        expect(new Position('H', i).getAllSkipTopLeftPositions().length).toBe(
          7 - i,
        );
      } else if (i < 7) {
        expect(new Position('H', i).getAllSkipTopLeftPositions().length).toBe(
          8 - i,
        );
      } else {
        expect(new Position('H', i).getAllSkipTopLeftPositions().length).toBe(
          9 - i,
        );
      }
    }

    for (let i = 1; i <= 8; i++) {
      if (i < 3) {
        expect(new Position('I', i).getAllSkipTopLeftPositions().length).toBe(
          6 - i,
        );
      } else if (i < 5) {
        expect(new Position('I', i).getAllSkipTopLeftPositions().length).toBe(
          7 - i,
        );
      } else {
        expect(new Position('I', i).getAllSkipTopLeftPositions().length).toBe(
          8 - i,
        );
      }
    }

    for (let i = 1; i <= 7; i++) {
      if (i < 3) {
        expect(new Position('K', i).getAllSkipTopLeftPositions().length).toBe(
          6 - i,
        );
      } else {
        expect(new Position('K', i).getAllSkipTopLeftPositions().length).toBe(
          7 - i,
        );
      }
    }

    for (let i = 1; i <= 6; i++) {
      expect(new Position('L', i).getAllSkipTopLeftPositions().length).toBe(
        6 - i,
      );
    }
  });

  test('Detects when positions are two square apart vertically', () => {
    const initial = new Position('A', 1);
    for (let i = 1; i <= 6; i++) {
      const areTwoApart = Position.areTwoSquaresApartVertically(
        initial,
        new Position('A', i),
      );
      expect(areTwoApart).toBe(i === 3);
    }

    for (let i = 1; i <= 7; i++) {
      const areTwoApart = Position.areTwoSquaresApartVertically(
        initial,
        new Position('B', i),
      );
      expect(areTwoApart).toBe(false);
    }
  });

  test('Creating a position from a Square string works', () => {
    expect(Position.fromString('A1')).toStrictEqual(new Position('A', 1));
    expect(Position.fromString('B2')).toStrictEqual(new Position('B', 2));
    expect(Position.fromString('C3')).toStrictEqual(new Position('C', 3));
    expect(Position.fromString('D4')).toStrictEqual(new Position('D', 4));
    expect(Position.fromString('E5')).toStrictEqual(new Position('E', 5));
    expect(Position.fromString('F6')).toStrictEqual(new Position('F', 6));
    expect(Position.fromString('G7')).toStrictEqual(new Position('G', 7));
    expect(Position.fromString('H8')).toStrictEqual(new Position('H', 8));
    expect(() => Position.fromString('I9')).toThrow();
    expect(() => Position.fromString('K10')).toThrow();
    expect(() => Position.fromString('L11')).toThrow();
    expect(() => Position.fromString('1A')).toThrow();
    expect(() => Position.fromString('AA')).toThrow();
    expect(() => Position.fromString('99')).toThrow();
  });
});
