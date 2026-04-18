/** Short mechanical tick for each pulley / crank notch (Web Audio). */

export function playPulleyTick(): void {
  try {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(420, t0);
    osc.frequency.exponentialRampToValueAtTime(120, t0 + 0.022);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.07, t0 + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.028);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + 0.032);
    osc.onended = () => {
      void ctx.close().catch(() => {});
    };
  } catch {
    /* autoplay / context blocked */
  }
}
