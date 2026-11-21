import { initGame, move, undo, restart, getState } from './game.js';
import { playSound, toggleSound } from './effects.js?v=sound-1';
import { render } from './ui.js?v=frog-images-3';

const $ = selector => document.querySelector(selector);
let active = false;
function moveAndRender(direction) {
  const before = getState();
  const after = move(direction);
  render(after);
  if (after.status !== before.status && after.status !== 'playing') playSound(after.status);
  else if (after.score > before.score) playSound('merge');
  else if (JSON.stringify(after.board) !== JSON.stringify(before.board)) playSound('move');
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
  render(initGame());
  playSound('start');
  $('#board').focus();
});
$('#home').addEventListener('click', () => {
  active = false;
  $('#game').hidden = true;
  $('.intro').hidden = false;
  $('#start').focus();
});
$('#undo').addEventListener('click', () => { const available = getState().canUndo; render(undo()); if (available) playSound('undo'); });
$('#restart').addEventListener('click', () => { render(restart()); playSound('start'); });
document.querySelectorAll('[data-direction]').forEach(button => {
  button.addEventListener('click', () => moveAndRender(button.dataset.direction));
});
const keys = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' };
document.addEventListener('keydown', event => {
  if (!active || $('#info').open || event.ctrlKey || event.altKey || event.metaKey) return;
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
使用键盘方向键，或 W（上）、A（左）、S（下）、D（右）；手机上点击棋盘下方的方向按钮。每次操作都会影响整个棋盘。

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
撤销可恢复最近 50 次有效移动前的棋盘和分数；再次移动时随机生成结果可能不同。重新开始会清空当前分数和撤销记录。返回首页后再次开始也是新一局，刷新网页不会保留进度。音效按钮可随时开关声音。

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

