import type { StyleObject } from './utils/style.js';

/** Maps Prism token types (e.g. 'keyword', 'string') to CSS-in-JS style objects. */
export type Theme = Record<string, StyleObject>;
