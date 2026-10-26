export type ScoreParse =
  | { ok: true; value: number | null }
  | { ok: false; message: string };

/** Validate a typed score against the assessment's max (0..max, at most two decimals). */
export function parseScoreText(text: string, max: number): ScoreParse {
  const trimmed = text.trim();
  if (trimmed === '') return { ok: true, value: null };
  if (!/^\d+(\.\d{0,2})?$/.test(trimmed)) {
    return { ok: false, message: 'Enter a number with at most two decimals' };
  }
  const value = Number(trimmed);
  if (!Number.isFinite(value)) return { ok: false, message: 'Enter a valid number' };
  if (value > max) return { ok: false, message: `Maximum is ${max}` };
  return { ok: true, value };
}

export function scoreToText(score: number | null | undefined): string {
  return score === null || score === undefined ? '' : String(score);
}
