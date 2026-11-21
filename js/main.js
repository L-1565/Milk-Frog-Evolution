import { initGame, move, undo, restart } from './game.js';
import { render } from './ui.js?v=frog-images-3';

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
  $('#info-body').replaceChildren();
  $('#info-body').textContent = text;
  $('#info').showModal();
}
$('#rules').addEventListener('click', () => showInfo('游戏规则', '使用方向键、WASD 或屏幕按钮移动。相同等级的奶蛙合并后升一级，每只每回合仅合并一次。合并获得新等级 × 100 分。有效移动后生成一只新奶蛙，达到十级即胜利。棋盘填满且无法合并时结束。可撤销最近 50 步。'));
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

