import test from 'node:test';
import assert from 'node:assert/strict';
import {initGame,move,getState,exportGame,restoreGame,undo} from '../js/game.js';
import {moveBoard} from '../js/board.js';
import {tilePaths} from '../js/motion.js';
test('save restores score, board and undo; corrupt save is rejected atomically', () => {
  const original = initGame();
  const direction = ['up','down','left','right'].find(d => moveBoard(original.board,d).changed);
  move(direction); const state = getState(); const saved = exportGame();
  initGame(); assert.equal(restoreGame(JSON.parse(JSON.stringify(saved))),true);
  assert.deepEqual(getState(),state); assert.deepEqual(undo(),original);
  assert.equal(restoreGame({...saved,board:[[99]]}),false);
  assert.deepEqual(getState(),original);
});
test('animation destinations match board merges in all directions', () => {
  const board = [[1,1,2,2],[9,9,10,10],[0,1,0,1],[3,3,3,0]];
  for (const direction of ['up','down','left','right']) {
    const paths = tilePaths(board,direction);
    const groups = new Map();
    for (const p of paths) { const key = p.to.join(','); const values = groups.get(key)||[]; values.push(p.level); groups.set(key,values); }
    const result = Array.from({length:4},()=>[0,0,0,0]);
    for (const [key,values] of groups) { const [r,c]=key.split(',').map(Number); result[r][c]=values[0]+(values.length===2?1:0); }
    assert.deepEqual(result,moveBoard(board,direction).board);
  }
});
