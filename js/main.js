import { initGame, move, undo, restart, getState, exportGame, restoreGame } from './game.js?v=polish-1';
import { animateMove } from './motion.js';
import { playSound, toggleSound } from './effects.js?v=sound-1';
import { render as renderBoard } from './ui.js?v=frog-images-3';

const $ = selector => document.querySelector(selector);
let active = false;
let busy = false;
let started = false;
let best = 0;
try {
  best = Math.max(0, Number(localStorage.getItem('frog-best')) || 0);
  const saved = JSON.parse(localStorage.getItem('frog-save'));
  started = restoreGame(saved);
} catch { /* Storage may be unavailable. */ }
function render(state) {
  renderBoard(state);
  best = Math.max(best, state.score);
  $('#best').textContent = best;
  try {
    localStorage.setItem('frog-best', String(best));
    localStorage.setItem('frog-save', JSON.stringify(exportGame()));
    $('#save-status').textContent = '已自动保存到此浏览器';
  } catch { $('#save-status').textContent = '当前浏览器无法保存进度，请勿关闭页面'; }
}
$('#start').textContent = started ? '继续游戏' : '开始游戏';
function showGameOver(state) {
  if (state.status === 'playing') return;
  $('#game-over-title').textContent = state.status === 'won' ? '进化成功！' : '棋盘满啦';
  $('#kiss-reward').hidden = state.status !== 'won';
  $('#result-description').textContent = state.status === 'won' ? '恭喜合成终极 LV.10 奶蛙！' : '已经没有可以移动或合并的奶蛙，本局结束。';
  $('#game-over-score').textContent = `本局 ${state.score} 分 · 历史最高 ${best} 分，要再来一局吗？`;
  $('#undo-failure').disabled = !state.canUndo;
  if (!$('#game-over').open) $('#game-over').showModal();
}
$('#play-again').addEventListener('click', () => {
  $('#game-over').close(); render(restart()); playSound('start'); $('#board').focus();
});
$('#undo-failure').addEventListener('click', () => {
  $('#game-over').close(); render(undo()); playSound('undo'); $('#board').focus();
});
$('#view-board').addEventListener('click', () => { $('#game-over').close(); $('#board').focus(); });
async function moveAndRender(direction) {
  if (busy || !active || $('#info').open || $('#game-over').open) return;
  const before = getState();
  const after = move(direction);
  busy = true;
  try {
    if (JSON.stringify(before.board) !== JSON.stringify(after.board)) await animateMove($('#board'), before.board, direction);
  render(after);
  $('#board').dataset.feedback = after.score > before.score ? 'merge' : 'move';
  if (after.status !== before.status) showGameOver(after);
  if (after.status !== before.status && after.status !== 'playing') playSound(after.status);
  else if (after.score > before.score) playSound('merge');
  else if (JSON.stringify(after.board) !== JSON.stringify(before.board)) playSound('move');
  } finally { busy = false; }
}
$('#sound').addEventListener('click', () => {
  const enabled = toggleSound();
  $('#sound').textContent = enabled ? '音效：开' : '音效：关';
  $('#sound').setAttribute('aria-pressed', String(enabled));
  if (enabled) playSound('start');
});
$('#start').addEventListener('click', () => {
  active = true;
  $('.intro').hidden = true;
  $('#game').hidden = false;
  render(started ? getState() : initGame());
  started = true;
  showGameOver(getState());
  playSound('start');
  $('#board').focus();
});
$('#home').addEventListener('click', () => {
  if (busy) return;
  active = false;
  $('#game').hidden = true;
  $('.intro').hidden = false;
  $('#start').focus();
  $('#start').textContent = '继续游戏';
});
$('#undo').addEventListener('click', () => { if (busy) return; const available = getState().canUndo; render(undo()); if (available) playSound('undo'); });
$('#restart').addEventListener('click', () => { if (busy) return; if (globalThis.confirm && !confirm('重新开始会清空本局进度，确定吗？')) return; render(restart()); playSound('start'); });

let touch;
$('#board').addEventListener('pointerdown', event => {
  if (event.isPrimary === false) return;
  touch = {x:event.clientX, y:event.clientY, id:event.pointerId};
  $('#board').setPointerCapture?.(event.pointerId);
});
$('#board').addEventListener('pointercancel', () => { touch = null; });
$('#board').addEventListener('pointerup', event => {
  if (!touch || touch.id !== event.pointerId) return;
  const dx = event.clientX-touch.x, dy = event.clientY-touch.y; touch = null;
  if (Math.max(Math.abs(dx),Math.abs(dy)) < 28) return;
  void moveAndRender(Math.abs(dx)>Math.abs(dy) ? dx>0?'right':'left' : dy>0?'down':'up');
});
document.querySelectorAll('[data-direction]').forEach(button => {
  button.addEventListener('click', () => moveAndRender(button.dataset.direction));
});
const keys = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' };
document.addEventListener('keydown', event => {
  if (!active || $('#info').open || $('#game-over').open || event.ctrlKey || event.altKey || event.metaKey) return;
  const direction = keys[event.key] || keys[event.key.toLowerCase()];
  if (direction) { event.preventDefault(); moveAndRender(direction); }
});
function showInfo(title, text) {
  $('#info-title').textContent = title;
  $('#info-body').replaceChildren();
  $('#info-body').textContent = text;
  $('#info').showModal();
}
function showRules() {
  showInfo('新手必读 · 游戏规则', `1. 移动的是整个棋盘！
每按一次方向，所有奶蛙都会同时向那个方向滑动。无需点击、选择某只奶蛙，也没有预先指定的奶蛙。点击奶蛙图片不会选中它。

2. 一次可以滑过多个格子
奶蛙会一直滑到边缘，或被其他奶蛙挡住，并非每次只走一格。不同等级相遇会停下，不会合并。

3. 怎样操作？
使用键盘方向键，或 W（上）、A（左）、S（下）、D（右）；手机可在棋盘上滑动，或点击方向按钮。每次操作都会影响整个棋盘。

4. 相同等级才能合并
移动时，两只相同等级的奶蛙碰在一起，会变成一只高一级的奶蛙。每只奶蛙每次操作最多合并一次，新合成的奶蛙本次不会继续合并。
向左示例：
[空][LV.1][空][LV.1]
→ [LV.2][空][空][空]
[LV.1][LV.1][LV.1][LV.1]
→ [LV.2][LV.2][空][空]
以上仅展示合并结果，随后还会随机生成一只新奶蛙。

5. 新奶蛙从哪里来？
开局随机出现两只奶蛙。每次让棋盘发生变化后，随机空位会出现一只新奶蛙：90% 概率为 LV.1，10% 为 LV.2。新出现的位置不由玩家选择。没有移动或合并成功时，不会生成新奶蛙，也不记录撤销历史。

6. 分数和胜负
每次合并获得“新等级 × 100”分，例如合成 LV.2 得 200 分。目标是合成 LV.10！棋盘填满且所有相邻奶蛙都无法合并时，游戏结束。胜利或结束后可撤销或重开。

7. 撤销、重开和声音
撤销可恢复最近 50 次有效移动前的棋盘和分数；再次移动时随机生成结果可能不同。重新开始会清空本局进度。返回首页后可继续游戏，进度和最高分自动保存在此浏览器，清除网站数据会删除存档。音效按钮可随时开关声音。

小提示：操作前观察整个棋盘，尽量保留空位，别只盯着一只奶蛙！`);
}
$('#rules').addEventListener('click', showRules);
$('#game-rules').addEventListener('click', showRules);
$('#close-info').addEventListener('click', () => $('#info').close());
$('#collection').addEventListener('click', () => {
  showInfo('奶蛙图鉴', '');
  const gallery = document.createElement('div');
  gallery.className = 'collection-grid';
  gallery.replaceChildren(...Array.from({ length: 10 }, (_, index) => {
    const card = document.createElement('figure');
    const image = document.createElement('img');
    image.src = `assets/frogs/level-${index + 1}.jpg`;
    image.alt = `LV.${index + 1} 奶蛙`;
    const caption = document.createElement('figcaption');
    caption.textContent = `LV.${index + 1}`;
    card.replaceChildren(image, caption);
    return card;
  }));
  $('#info-body').replaceChildren(gallery);
});

