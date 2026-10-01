export type Tone = 'ok' | 'warn' | 'neutral';

/** Nada badge mengikuti makna status, bukan warnanya. */
const STATUS_TONES: Array<[RegExp, Tone]> = [
  [/selesai/i, 'ok'],
  [/diyatakan|selesai$/i, 'ok'],
  [/menunggu|pending|dijadwalkan/i, 'warn'],
];

export function statusTone(status: string): Tone {
  for (const [pattern, tone] of STATUS_TONES) {
    if (pattern.test(status)) return tone;
  }
  return 'neutral';
}

export const nf = new Intl.NumberFormat('id-ID');

/** "3 dari 500" — format ringkas untuk ringkasan hasil filter. */
export function plural(count: number, word: string): string {
  return `${nf.format(count)} ${word}`;
}
