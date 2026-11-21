// UI only reads snapshots; all game changes go through game.js.
export function render(state, root = document) {
  const board = root.querySelector('#board');
  board.replaceChildren(...state.board.flatMap((row, r) => row.map((level, c) => {
    const cell = board.ownerDocument.createElement('div');
    cell.className = `tile tile-${level}`;
    if (level) {
      const image = board.ownerDocument.createElement('img');
      image.src = `assets/frogs/level-${level}.jpg`;
      image.alt = `LV.${level} 奶蛙`;
      const label = board.ownerDocument.createElement('span');
      label.textContent = `LV.${level}`;
      cell.replaceChildren(image, label);
    }
    cell.setAttribute('aria-label', `第${r + 1}行第${c + 1}列：${level ? `等级${level}` : '空'}`);
    return cell;
  })));
  root.querySelector('#score').textContent = state.score;
  root.querySelector('#level').textContent = state.highestLevel;
  root.querySelector('#undo').disabled = !state.canUndo;
  root.querySelector('#status').textContent = state.status === 'won'
    ? '恭喜！已进化到十级！可撤销或重新开始。'
    : state.status === 'over' ? '没有可用移动了。可撤销或重新开始。' : '合成相同等级的奶蛙，向十级进化！';
  root.querySelectorAll('[data-direction]').forEach(button => button.disabled = state.status !== 'playing');
}
