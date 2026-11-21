import test from 'node:test';
import assert from 'node:assert/strict';
import { getState } from '../js/game.js';

test('page events integrate with the game and render independent snapshots', async () => {
  const nodes = new Map();
  function element() {
    return { hidden:false, disabled:false, open:false, dataset:{}, events:{},
      addEventListener(type, fn) { this.events[type] = fn; },
      replaceChildren(...children) { this.children = children; },
      setAttribute() {}, focus() {}, showModal() { this.open = true; }, close() { this.open = false; } };
  }
  const directions = ['up','down','left','right'].map(direction => Object.assign(element(), {dataset:{direction}}));
  const doc = {
    querySelector(selector) { if (!nodes.has(selector)) nodes.set(selector, Object.assign(element(), {ownerDocument:doc})); return nodes.get(selector); },
    querySelectorAll() { return directions; }, createElement: element,
    addEventListener(type, fn) { this[type] = fn; }
  };
  globalThis.document = doc;
  try {
    await import('../js/main.js');
    const click = selector => doc.querySelector(selector).events.click();
    click('#start');
    assert.equal(doc.querySelector('#board').children.length,16);
    assert.equal(doc.querySelector('.intro').hidden,true);
    let prevented = false;
    doc.keydown({key:'ArrowRight',preventDefault(){prevented=true;}});
    assert.equal(prevented,true);
    assert.equal(doc.querySelector('#score').textContent,getState().score);
    click('#restart'); assert.equal(doc.querySelector('#undo').disabled,true);
    click('#rules'); assert.equal(doc.querySelector('#info').open,true);
    const before = getState();
    doc.keydown({key:'ArrowLeft',preventDefault(){throw Error('modal must block game');}});
    assert.deepEqual(getState(),before);
    click('#close-info'); click('#collection');
    const cards = doc.querySelector('#info-body').children[0].children;
    assert.equal(cards.length,10);
    assert.equal(cards[9].children[0].src,'assets/frogs/level-10.jpg');
    click('#close-info'); click('#home'); assert.equal(doc.querySelector('#game').hidden,true);
  } finally { delete globalThis.document; }
});
