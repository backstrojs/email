/**
 * Wraps the tailwindcss v4 `compile()` API, loading the required built-in
 * stylesheets directly from the installed `tailwindcss` package at runtime.
 *
 * This avoids bundling the 900-line theme CSS and always respects the exact
 * version of tailwindcss the consumer has installed.
 */

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { parse, type StyleSheet } from 'css-tree';
import { compile } from 'tailwindcss';
import type { TailwindConfig } from '../../tailwind.js';

const req = createRequire(import.meta.url);

/** Lazily resolve the tailwindcss package root directory. */
function getTailwindDir(): string {
	return dirname(req.resolve('tailwindcss/package.json'));
}

/** Read a CSS file from the tailwindcss package by relative path. */
function readTwFile(relativePath: string): string {
	return readFileSync(join(getTailwindDir(), relativePath), 'utf-8');
}

/** Map from tailwindcss import ID → lazy reader. */
const STYLESHEET_MAP: Record<string, () => string> = {
	tailwindcss: () => readTwFile('index.css'),
	'tailwindcss/index.css': () => readTwFile('index.css'),
	'tailwindcss/preflight.css': () => readTwFile('preflight.css'),
	'tailwindcss/theme.css': () => readTwFile('theme.css'),
	'tailwindcss/utilities.css': () => readTwFile('utilities.css'),
};

export interface TailwindSetup {
	addUtilities: (candidates: string[]) => void;
	getStyleSheet: () => StyleSheet;
}

const cache = new Map<string, TailwindSetup>();

/**
 * Creates (or returns a cached) Tailwind compiler for a given config.
 *
 * @param config - Tailwind v4 config (everything except `content`).
 * @returns `{ addUtilities, getStyleSheet }` – same surface as react-email's version.
 */
export async function setupTailwind(config: TailwindConfig): Promise<TailwindSetup> {
	const cacheKey = JSON.stringify(config, (_key, value) =>
		typeof value === 'function' ? value.toString() : value,
	);

	const cached = cache.get(cacheKey);
	if (cached) return cached;

	const baseCss = `
@layer theme, base, components, utilities;
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities);
@config;
`;

	const compiler = await compile(baseCss, {
		polyfills: 0,
		async loadModule(id, base, resourceHint) {
			if (resourceHint === 'config') {
				return { path: id, base, module: config };
			}
			throw new Error(`[astro-email] Unsupported module: ${id} (hint: ${resourceHint})`);
		},
		async loadStylesheet(id, base) {
			const reader = STYLESHEET_MAP[ id ];
			if (reader) {
				return { base, path: id, content: reader() };
			}
			throw new Error(
				`[astro-email] Unsupported stylesheet import: "${id}". ` +
				'Only tailwindcss built-in stylesheets are supported.',
			);
		},
	});

	let builtCss = baseCss;

	const setup: TailwindSetup = {
		addUtilities(candidates: string[]) {
			builtCss = compiler.build(candidates);
		},
		getStyleSheet() {
			return parse(builtCss) as StyleSheet;
		},
	};

	cache.set(cacheKey, setup);
	return setup;
}
