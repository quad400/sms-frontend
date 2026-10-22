export function formatMoneyMinor(
  amountMinor: number,
  currencyCode: string,
  minorUnitDigits = 2,
  locale = 'en',
): string {
  const amount = amountMinor / 10 ** minorUnitDigits;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: minorUnitDigits,
    maximumFractionDigits: minorUnitDigits,
  }).format(amount);
}

/** Convert a typed decimal string to minor units without floats. */
export function decimalStringToMinor(value: string, minorUnitDigits: number): number {
  const trimmed = value.trim();
  if (!trimmed) {
    return 0;
  }
  const negative = trimmed.startsWith('-');
  const raw = negative ? trimmed.slice(1) : trimmed;
  const [wholePart, fractionPart = ''] = raw.split('.');
  const whole = wholePart.replace(/\D/g, '') || '0';
  const fraction = (fractionPart.replace(/\D/g, '') + '0'.repeat(minorUnitDigits)).slice(
    0,
    minorUnitDigits,
  );
  const minor = BigInt(whole) * BigInt(10 ** minorUnitDigits) + BigInt(fraction || '0');
  const asNumber = Number(minor);
  return negative ? -asNumber : asNumber;
}
