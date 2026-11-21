// Map each original tile to its destination using the same one-merge rule as board.js.
export function tilePaths(board, direction) {
  const paths = [];
  for (let line = 0; line < 4; line++) {
    const coord = n => direction === 'left' ? [line,n] : direction === 'right' ? [line,3-n] : direction === 'up' ? [n,line] : [3-n,line];
    const slots = [];
    for (let n = 0; n < 4; n++) {
      const from = coord(n); const level = board[from[0]][from[1]];
      if (!level) continue;
      const last = slots.at(-1);
      let target;
      if (last && !last.merged && last.level === level && level < 10) {
        last.level++; last.merged = true; target = slots.length - 1;
      } else { target = slots.length; slots.push({level,merged:false}); }
      paths.push({from, to:coord(target), level});
    }
  }
  return paths;
}
export async function animateMove(boardElement, board, direction) {
  if (!boardElement.querySelectorAll || !globalThis.matchMedia || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cells = [...boardElement.children];
  const animations = [];
  for (const path of tilePaths(board, direction)) {
    const source = cells[path.from[0]*4+path.from[1]];
    const target = cells[path.to[0]*4+path.to[1]];
    const image = source.querySelector('img');
    if (!image?.animate) continue;
    const a = source.getBoundingClientRect(), b = target.getBoundingClientRect();
    source.style.overflow = 'visible'; source.style.zIndex = '2';
    const animation = image.animate([{transform:'translate(0,0)'},{transform:`translate(${b.left-a.left}px,${b.top-a.top}px)`}],{duration:160,easing:'ease-out',fill:'forwards'});
    animations.push(animation.finished.catch(() => {}));
  }
  await Promise.all(animations);
}
