/**
 * Sound kit — everything is synthesized with Web Audio, so there are no
 * audio files to download and the sounds work fully offline. Warm-toned,
 * under 300 ms, never beepy. One-tap mute is persisted.
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;

try {
  muted = localStorage.getItem("leafsprint-sound") === "off";
} catch {
  /* storage unavailable — default to sound on */
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(next: boolean) {
  muted = next;
  try {
    localStorage.setItem("leafsprint-sound", next ? "off" : "on");
  } catch {
    /* ignore */
  }
}

/** call once from any user gesture — browsers require it before audio */
export function unlockAudio() {
  if (ctx) {
    if (ctx.state === "suspended") void ctx.resume();
    return;
  }
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.5;
  master.connect(ctx.destination);
}

type ToneOpts = {
  freq: number;
  delay?: number;
  dur?: number;
  type?: OscillatorType;
  gain?: number;
  glideTo?: number;
};

function tone({ freq, delay = 0, dur = 0.3, type = "sine", gain = 0.15, glideTo }: ToneOpts) {
  if (!ctx || !master || muted) return;
  const t0 = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t0 + dur);
  env.gain.setValueAtTime(0, t0);
  env.gain.linearRampToValueAtTime(gain, t0 + 0.015);
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(env).connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

/** filtered noise burst = the sound of paper turning */
function noiseBurst(dur = 0.14, from = 1400, to = 500, gain = 0.08) {
  if (!ctx || !master || muted) return;
  const t0 = ctx.currentTime;
  const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 0.8;
  filter.frequency.setValueAtTime(from, t0);
  filter.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  const env = ctx.createGain();
  env.gain.value = gain;
  src.connect(filter).connect(env).connect(master);
  src.start(t0);
}

export function pageTurn() {
  noiseBurst(0.13, 1500, 480, 0.07);
}

export function leafPop() {
  tone({ freq: 740, dur: 0.1, type: "sine", gain: 0.06, glideTo: 1100 });
}

/** the quiet two-note chime when today's leaf is watered */
export function dayComplete() {
  tone({ freq: 392, dur: 0.4, type: "sine", gain: 0.14 }); // G4
  tone({ freq: 587.33, delay: 0.13, dur: 0.5, type: "sine", gain: 0.16 }); // D5
  tone({ freq: 587.33, delay: 0.13, dur: 0.5, type: "triangle", gain: 0.04 });
}

/** milestones: a small pentatonic run, still gentle */
export function milestone() {
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
    tone({ freq: f, delay: i * 0.09, dur: 0.35, type: "sine", gain: 0.1 });
  });
}

/** a pressed leaf quietly saves your streak — soft, low, kind */
export function pressUsed() {
  tone({ freq: 220, dur: 0.28, type: "sine", gain: 0.09 });
  tone({ freq: 277.18, delay: 0.16, dur: 0.3, type: "sine", gain: 0.07 });
}
