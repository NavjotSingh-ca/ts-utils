import { describe, it, expect } from 'vitest';
import { toCents, toDinero, isMathMismatch, formatDineroIntl } from './finance-utils.js';

describe('toCents', () => {
  it('converts dollars to integer cents', () => {
    expect(toCents(10)).toBe(1000);
    expect(toCents(10.5)).toBe(1050);
    expect(toCents(0.01)).toBe(1);
  });

  it('handles floating-point edge cases via EPSILON', () => {
    expect(toCents(1.005)).toBe(101); // 1.005*100 = 100.4999... without EPSILON
    expect(toCents(19.99)).toBe(1999);
  });
});

describe('toDinero', () => {
  it('converts numbers to integer-cent Dinero objects', () => {
    const d = toDinero(42.75);
    expect(d.toJSON()).toMatchObject({ amount: 4275 });
  });

  it('parses numeric strings', () => {
    expect(toDinero('19.99').toJSON()).toMatchObject({ amount: 1999 });
  });

  it('defaults to 0 for null/undefined/empty string', () => {
    expect(toDinero(null).toJSON()).toMatchObject({ amount: 0 });
    expect(toDinero(undefined).toJSON()).toMatchObject({ amount: 0 });
    expect(toDinero('').toJSON()).toMatchObject({ amount: 0 });
  });

  it('defaults to 0 for NaN strings', () => {
    expect(toDinero('not-a-number').toJSON()).toMatchObject({ amount: 0 });
  });
});

describe('isMathMismatch', () => {
  it('returns false when subtotal + taxes === total', () => {
    expect(isMathMismatch(100, 13, 0, 113)).toBe(false);
    expect(isMathMismatch(100, 5, 8, 113)).toBe(false);
  });

  it('returns true when the math does not balance', () => {
    expect(isMathMismatch(100, 13, 0, 120)).toBe(true);
  });

  it('detects penny-level mismatches using exact cent arithmetic', () => {
    // 10.11 + 1.31 = 11.42 — a total of 11.41 is off by one cent.
    expect(isMathMismatch(10.11, 1.31, 0, 11.41)).toBe(true);
    expect(isMathMismatch(10.11, 1.31, 0, 11.42)).toBe(false);
  });
});

describe('formatDineroIntl', () => {
  it('formats CAD with en-CA locale', () => {
    expect(formatDineroIntl(1234.56)).toBe('$1,234.56');
  });

  it('formats null as $0.00', () => {
    expect(formatDineroIntl(null)).toBe('$0.00');
    expect(formatDineroIntl(undefined)).toBe('$0.00');
    expect(formatDineroIntl('abc')).toBe('$0.00');
  });

  it('supports custom currency and locale', () => {
    expect(formatDineroIntl(1234.56, 'USD', 'en-US')).toBe('$1,234.56');
    expect(formatDineroIntl(1234.56, 'EUR', 'de-DE')).toBe(`1.234,56\u00A0€`);
  });
});
