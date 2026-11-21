import test from 'node:test';
import assert from 'node:assert/strict';
import {createEmptyBoard, moveBoard, hasMoves, spawnTile} from '../js/board.js';
import {HistoryStack} from '../js/history.js';
import * as game from '../js/game.js';

test('four directions, scoring, one merge per tile and immutable input', () => {
  for (const direction of ['left','right','up','down']) {
    const board = createEmptyBoard();
    if (direction === 'left' || direction === 'right') board[0] = [1,1,1,1];
    else board.forEach(row => row[0] = 1);
    const before = structuredClone(board);
    const result = moveBoard(board, direction);
    assert.equal(result.scoreGain, 400);
    assert.deepEqual(result.mergeLevels, [2,2]);
    assert.equal(result.board.flat().filter(x => x === 2).length, 2);
    assert.deepEqual(board, before);
  }
  const board = createEmptyBoard(); board[0] = [1,1,2,0];
  assert.deepEqual(moveBoard(board,'left').board[0], [2,2,0,0]);
  assert.equal(moveBoard(board,'invalid').changed,false);
});

test('spawn, full board, terminal levels and adjacent merges', () => {
  const board = createEmptyBoard(); assert.equal(spawnTile(board),true);
  assert.equal(board.flat().filter(Boolean).length,1);
  const full = Array.from({length:4}, () => [10,10,10,10]);
  assert.equal(spawnTile(full),false); assert.equal(hasMoves(full),false);
  assert.equal(moveBoard(full,'left').changed,false);
  full[0][0] = full[0][1] = 9; assert.equal(hasMoves(full),true);
  assert.equal(moveBoard(full,'left').board[0][0],10);
});

test('history clones, bounds capacity and clears', () => {
  const history = new HistoryStack(1); const board = createEmptyBoard();
  history.push({board,score:1}); board[0][0]=9;
  assert.equal(history.pop().board[0][0],0);
  history.push({board,score:1}); history.push({board,score:2});
  assert.equal(history.pop().score,2); assert.equal(history.pop(),null);
  history.push({board,score:3}); history.clear(); assert.equal(history.isEmpty(),true);
  assert.throws(() => new HistoryStack(0),RangeError);
});

test('initialization, invalid move, undo, defensive snapshots and restart', () => {
  assert.doesNotThrow(() => game.getState());
  const initial = game.initGame();
  assert.equal(initial.board.flat().filter(Boolean).length,2);
  assert.deepEqual(game.move('invalid'),initial);
  const direction = ['left','right','up','down'].find(d => moveBoard(initial.board,d).changed);
  const moved = game.move(direction); assert.equal(moved.canUndo,true);
  assert.deepEqual(game.undo(),initial);
  moved.board[0][0] = 999; assert.notEqual(game.getState().board[0][0],999);
  assert.equal(game.restart().canUndo,false); assert.equal(game.isGameOver(),false);
});
