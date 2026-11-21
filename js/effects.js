// Short synthesized effects: no downloads or autoplay before user interaction.
let context;
let enabled = true;
export function toggleSound() {
  enabled = !enabled;
  if (!enabled && context) void context.suspend().catch(() => {});
  return enabled;
}
export function playSound(kind) {
  if (!enabled) return;
  try {
    const Audio = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!Audio) return;
    context ||= new Audio();
    if (context.state === 'suspended') void context.resume().catch(() => {});
    const notes = {
      start: [392, 523, 659], move: [220], merge: [523, 659, 784],
      undo: [392, 294], won: [523, 659, 784, 1047], over: [330, 262, 196]
    }[kind] || [];
    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const time = context.currentTime + index * 0.085;
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, time);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.07, time + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
      oscillator.connect(gain); gain.connect(context.destination);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      oscillator.start(time); oscillator.stop(time + 0.14);
    });
  } catch { /* Sound must never prevent gameplay. */ }
}
