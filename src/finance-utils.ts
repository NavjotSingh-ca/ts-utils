/**
 * Finance utilities for exact money math.
 *
 * All money is treated as integer cents to avoid floating-point drift.
 * Conversion and comparison go through Dinero.js v2; formatting uses
 * `Intl.NumberFormat`.
 */

import { dinero, add, equal, toDecimal, CAD, type DineroCurrency } from 'dinero.js';

/**
 * Safely converts a float dollar amount to integer cents, avoiding
 * floating-point edge cases. Uses Number.EPSILON to handle values like
 * 1.005 where x*100 produces 100.4999... instead of 100.5.
 *
 * @param amount - The amount in dollars.
 * @returns The amount in integer cents.
 */
export function toCents(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100);
}

/**
 * Safely converts a float dollar amount into a Dinero v2 object (integer cents).
 *
 * @param amount - The amount to convert. Strings, null, undefined, and empty
 * strings are handled safely (defaulting to 0).
 * @param currency - The currency object (defaults to CAD).
 * @returns A Dinero object with the amount in integer cents.
 */
export function toDinero(amount: number | string | null | undefined, currency: DineroCurrency<number> = CAD) {
  if (amount === null || amount === undefined || amount === '') {
    return dinero({ amount: 0, currency });
  }
  const parsed = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (Number.isNaN(parsed)) return dinero({ amount: 0, currency });

  return dinero({ amount: toCents(parsed), currency });
}

/**
 * Validates subtotal + taxes === total using exact integer-cent arithmetic.
 *
 * @param subtotal - The subtotal before tax.
 * @param gst - The GST/HST amount.
 * @param pst - The PST amount.
 * @param total - The total amount.
 * @returns True if the math does NOT balance (i.e., a mismatch exists).
 */
export function isMathMismatch(subtotal: number, gst: number, pst: number, total: number): boolean {
  const dSub = toDinero(subtotal);
  const dGst = toDinero(gst);
  const dPst = toDinero(pst);
  const dTotal = toDinero(total);

  const expectedTotal = add(dSub, add(dGst, dPst));

  return !equal(expectedTotal, dTotal);
}

/**
 * Formats a raw dollar float to a localized currency string.
 * Uses integer cents via Dinero + `Intl.NumberFormat`.
 *
 * @param amount - The amount to format. Null/undefined/NaN are formatted as $0.00.
 * @param currency - ISO 4217 currency code (default 'CAD').
 * @param locale - BCP 47 locale (default 'en-CA').
 * @returns The formatted currency string (e.g. "$1,234.56").
 */
export function formatDineroIntl(
  amount: number | string | null | undefined,
  currency = 'CAD',
  locale = 'en-CA',
): string {
  const d = toDinero(amount);
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  });
  const decimalValue = parseFloat(toDecimal(d));
  return formatter.format(decimalValue);
}
