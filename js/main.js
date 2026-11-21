import { initGame, move, undo, restart } from './game.js';
import { render } from './ui.js';

const $ = selector => document.querySelector(selector);
let active = false;
$('#start').addEventListener('click', () => {
  active = true;
  $('.intro').hidden = true;
  $('#game').hidden = false;
  render(initGame());
  $('#board').focus();
});
$('#home').addEventListener('click', () => {
  active = false;
  $('#game').hidden = true;
  $('.intro').hidden = false;
  $('#start').focus();
});
$('#undo').addEventListener('click', () => render(undo()));
$('#restart').addEventListener('click', () => render(restart()));
document.querySelectorAll('[data-direction]').forEach(button => {
  button.addEventListener('click', () => render(move(button.dataset.direction)));
});
const keys = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' };
document.addEventListener('keydown', event => {
  if (!active || $('#info').open || event.ctrlKey || event.altKey || event.metaKey) return;
  const direction = keys[event.key] || keys[event.key.toLowerCase()];
  if (direction) { event.preventDefault(); render(move(direction)); }
});
function showInfo(title, text) {
  $('#info-title').textContent = title;
  $('#info-body').textContent = text;
  $('#info').showModal();
}
$('#rules').addEventListener('click', () => showInfo('游戏规则', '使用方向键、WASD 或屏幕按钮移动。相同等级的奶蛙合并后升一级，每只每回合仅合并一次。合并获得新等级 × 100 分。有效移动后生成一只新奶蛙，达到十级即胜利。棋盘填满且无法合并时结束。可撤销最近 50 步。'));
$('#collection').addEventListener('click', () => showInfo('奶蛙图鉴', '奶蛙共有 LV.1 至 LV.10 十个等级。两只同等级奶蛙可合成下一等级；LV.10 为最终形态。新出现的奶蛙有 90% 概率为 LV.1、10% 概率为 LV.2。'));
$('#close-info').addEventListener('click', () => $('#info').close());
