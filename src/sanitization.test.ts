import { describe, it, expect } from 'vitest';
import {
  sanitizeString,
  sanitizeFilename,
  sanitizeCurrency,
  isValidDateString,
  sanitizeBase64Image,
} from './sanitization.js';

describe('sanitizeString', () => {
  it('strips script tags', () => {
    expect(sanitizeString('<script>alert("x")</script>hello')).toBe('hello');
  });

  it('strips inline event handlers', () => {
    expect(sanitizeString('<img src="x" onerror="alert(1)">')).toBe('<img src="x">');
  });

  it('strips javascript: URIs', () => {
    expect(sanitizeString('javascript:alert(1)')).toBe('alert(1)');
  });

  it('strips iframe/object/embed/svg/link/meta tags', () => {
    expect(sanitizeString('<iframe src="x"></iframe>text')).toBe('text');
    expect(sanitizeString('<object data="x"></object>')).toBe('');
    expect(sanitizeString('<embed src="x">')).toBe('');
    expect(sanitizeString('<svg onload="x"></svg>')).toBe('');
    expect(sanitizeString('<link rel="stylesheet" href="x">')).toBe('');
    expect(sanitizeString('<meta http-equiv="refresh" content="0">')).toBe('');
  });

  it('keeps safe HTML and text', () => {
    expect(sanitizeString('<p>Hello <b>world</b></p>')).toBe('<p>Hello <b>world</b></p>');
  });

  it('trims surrounding whitespace', () => {
    expect(sanitizeString('  hello  ')).toBe('hello');
  });

  it('truncates to 5000 chars', () => {
    expect(sanitizeString('a'.repeat(6000))).toHaveLength(5000);
  });

  it('handles null/undefined', () => {
    expect(sanitizeString(null)).toBe('');
    expect(sanitizeString(undefined)).toBe('');
  });
});

describe('sanitizeFilename', () => {
  it('blocks path traversal', () => {
    expect(sanitizeFilename('../../etc/passwd')).toBe('.._.._etc_passwd');
  });

  it('preserves dots and dashes in safe names', () => {
    expect(sanitizeFilename('receipt-2026-06-01.pdf')).toBe('receipt-2026-06-01.pdf');
  });

  it('replaces invalid characters with underscores', () => {
    expect(sanitizeFilename('my file(1).pdf')).toBe('my_file_1_.pdf');
  });

  it('collapses consecutive underscores', () => {
    expect(sanitizeFilename('a__b___c')).toBe('a_b_c');
  });

  it('truncates to 255 chars', () => {
    expect(sanitizeFilename('x'.repeat(300))).toHaveLength(255);
  });
});

describe('sanitizeCurrency', () => {
  it('returns 0 for null/undefined', () => {
    expect(sanitizeCurrency(null)).toBe(0);
    expect(sanitizeCurrency(undefined)).toBe(0);
  });

  it('parses numeric strings', () => {
    expect(sanitizeCurrency('42.567')).toBe(42.57);
  });

  it('returns 0 for invalid strings', () => {
    expect(sanitizeCurrency('abc')).toBe(0);
  });

  it('clamps negatives to 0', () => {
    expect(sanitizeCurrency(-5)).toBe(0);
  });

  it('rounds to 2 decimals', () => {
    expect(sanitizeCurrency(10.999)).toBe(11);
  });
});

describe('isValidDateString', () => {
  it('accepts YYYY-MM-DD', () => {
    expect(isValidDateString('2026-06-01')).toBe(true);
  });

  it('rejects other formats', () => {
    expect(isValidDateString('01/06/2026')).toBe(false);
    expect(isValidDateString('2026-6-1')).toBe(false);
    expect(isValidDateString('')).toBe(false);
  });
});

describe('sanitizeBase64Image', () => {
  // 1x1 transparent PNG
  const PNG_BASE64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

  it('accepts a valid PNG data URI', () => {
    expect(sanitizeBase64Image(`data:image/png;base64,${PNG_BASE64}`)).toEqual({ valid: true });
  });

  it('accepts raw base64 without a data URI prefix', () => {
    expect(sanitizeBase64Image(PNG_BASE64)).toEqual({ valid: true });
  });

  it('rejects non-image data URIs', () => {
    expect(sanitizeBase64Image('data:text/html;base64,PGI+').valid).toBe(false);
  });

  it('rejects invalid base64 characters', () => {
    expect(sanitizeBase64Image('not base64!!!').valid).toBe(false);
  });

  it('rejects unsupported file types by magic bytes', () => {
    const textBytes = Buffer.from('hello world').toString('base64');
    expect(sanitizeBase64Image(textBytes).valid).toBe(false);
  });

  it('rejects empty input', () => {
    expect(sanitizeBase64Image('')).toEqual({ valid: false, error: 'Invalid image data' });
  });

  it('rejects oversized images', () => {
    const big = `data:image/png;base64,${'A'.repeat(15 * 1024 * 1024 * 1.34)}`;
    expect(sanitizeBase64Image(big).valid).toBe(false);
  });
});
