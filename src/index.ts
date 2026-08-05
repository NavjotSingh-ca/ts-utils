/**
 * ts-utils — a small collection of battle-tested TypeScript utilities.
 *
 * Every module is dependency-free at the type level and works in both
 * browser and Node.js environments unless noted otherwise.
 *
 * @module
 */

export {
  generateSHA256,
  generateDuplicateHash,
  generateIntegrityHash,
  generateAuditEventHash,
  verifyHashFormat,
} from './hash.js';

export { escapeHtml } from './html-escape.js';

export {
  sanitizeString,
  sanitizeFilename,
  sanitizeCurrency,
  isValidDateString,
  sanitizeBase64Image,
} from './sanitization.js';

export { toCents, toDinero, isMathMismatch, formatDineroIntl } from './finance-utils.js';

export { cn } from './cn.js';
