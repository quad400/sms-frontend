export function initials(first?: string | null, last?: string | null): string {
  const a = (first ?? '').trim().charAt(0);
  const b = (last ?? '').trim().charAt(0);
  const s = `${a}${b}`.toUpperCase();
  return s || '?';
}

export function avatarTone(seed?: string | null): string {
  const tones = [
    'bg-sky-100 text-sky-800',
    'bg-teal-100 text-teal-800',
    'bg-amber-100 text-amber-900',
    'bg-violet-100 text-violet-800',
    'bg-rose-100 text-rose-800',
  ];
  const s = (seed ?? '').toLowerCase();
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h + s.charCodeAt(i) * (i + 1)) % tones.length;
  return tones[h]!;
}
