/**
 * Tailwind CSS support for @backstro/email emails.
 *
 * Works as an HTML post-processor: given a rendered email HTML string, it
 * collects all Tailwind classes, compiles them, converts inlinable rules to
 * `style="..."` attributes, and injects a `<style>` block in `<head>` for
 * non-inlinable rules (media queries, hover/focus pseudo-classes, etc.).
 *
 * @example
 * ```ts
 * import { render } from '@backstro/email/render';
 * import { inlineTailwind } from '@backstro/email/tailwind';
 * import WelcomeEmail from './emails/WelcomeEmail.astro';
 *
 * const rawHtml  = await render(WelcomeEmail, { name: 'Alice' });
 * const html     = await inlineTailwind(rawHtml);
 *
 * await resend.emails.send({ html, ... });
 * ```
 *
 * Or use the combined helper exported from `render.ts`:
 * ```ts
 * const html = await render(WelcomeEmail, { name: 'Alice' }, { tailwind: {} });
 * ```
 */

import { generate, List, type StyleSheet, type CssNode } from 'css-tree';
import type { Config } from 'tailwindcss';
import {
	extractRulesPerClass,
	getCustomProperties,
	makeInlineStylesFor,
	sanitizeClassName,
	sanitizeNonInlinableRules,
	sanitizeStyleSheet,
} from './utils/tailwind/css-utils.js';
import { setupTailwind } from './utils/tailwind/setup.js';

/** Tailwind v4 config (everything except `content`). */
export type TailwindConfig = Omit<Config, 'content'>;

export interface InlineTailwindOptions {
	/**
	 * Tailwind configuration. All standard Tailwind v4 config keys are
	 * supported except `content` (classes are discovered automatically from the
	 * HTML).
	 */
	config?: TailwindConfig;
}

/**
 * A Tailwind preset that replaces all rem-based values with pixel equivalents,
 * making the output predictable for email clients that do not respect `font-size`
 * on the `<html>` element.
 *
 * @example
 * ```ts
 * const html = await render(Email, {}, { tailwind: pixelBasedPreset });
 * ```
 */
export const pixelBasedPreset: TailwindConfig = {
	theme: {
		extend: {
			fontSize: {
				xs: [ '12px', { lineHeight: '16px' } ],
				sm: [ '14px', { lineHeight: '20px' } ],
				base: [ '16px', { lineHeight: '24px' } ],
				lg: [ '18px', { lineHeight: '28px' } ],
				xl: [ '20px', { lineHeight: '28px' } ],
				'2xl': [ '24px', { lineHeight: '32px' } ],
				'3xl': [ '30px', { lineHeight: '36px' } ],
				'4xl': [ '36px', { lineHeight: '36px' } ],
				'5xl': [ '48px', { lineHeight: '1' } ],
				'6xl': [ '60px', { lineHeight: '1' } ],
				'7xl': [ '72px', { lineHeight: '1' } ],
				'8xl': [ '96px', { lineHeight: '1' } ],
				'9xl': [ '144px', { lineHeight: '1' } ],
			},
			spacing: {
				px: '1px',
				0: '0',
				0.5: '2px',
				1: '4px',
				1.5: '6px',
				2: '8px',
				2.5: '10px',
				3: '12px',
				3.5: '14px',
				4: '16px',
				5: '20px',
				6: '24px',
				7: '28px',
				8: '32px',
				9: '36px',
				10: '40px',
				11: '44px',
				12: '48px',
				14: '56px',
				16: '64px',
				20: '80px',
				24: '96px',
				28: '112px',
				32: '128px',
				36: '144px',
				40: '160px',
				44: '176px',
				48: '192px',
				52: '208px',
				56: '224px',
				60: '240px',
				64: '256px',
				72: '288px',
				80: '320px',
				96: '384px',
			},
		},
	},
};

// ─── Internal helpers ─────────────────────────────────────────────────────────

/** Parse an inline style string like `"color: red; font-size: 14px"` into a map. */
function parseInlineStyle(styleStr: string): Record<string, string> {
	const result: Record<string, string> = {};
	if (!styleStr.trim()) return result;
	for (const declaration of styleStr.split(';')) {
		const colonIdx = declaration.indexOf(':');
		if (colonIdx === -1) continue;
		const property = declaration.slice(0, colonIdx).trim();
		const value = declaration.slice(colonIdx + 1).trim();
		if (property && value) {
			result[ property ] = value;
		}
	}
	return result;
}

/** Serialise an inline style map back to a string. */
function serializeStyle(styles: Record<string, string>): string {
	return Object.entries(styles)
		.filter(([ , v ]) => v !== '')
		.map(([ k, v ]) => `${k}: ${v}`)
		.join('; ');
}

/**
 * Collect all unique, non-empty CSS class tokens present in `class="..."` or
 * `class='...'` attributes across the entire HTML string.
 */
function collectClasses(html: string): string[] {
	const classes = new Set<string>();
	const re = /\bclass=["']([^"']+)["']/g;
	let m: RegExpExecArray | null;
	while ((m = re.exec(html)) !== null) {
		for (const cls of m[ 1 ].split(/\s+/)) {
			const t = cls.trim();
			if (t) classes.add(t);
		}
	}
	return Array.from(classes);
}

/**
 * Rewrite every opening HTML tag that carries a `class` attribute:
 * - Merge Tailwind-derived inline styles into its `style` attribute.
 * - Rewrite `class` values so non-inlinable classes use the sanitized names
 *   that match the injected `<style>` block.
 */
function rewriteTags(
	html: string,
	classToInlineStyles: Map<string, Record<string, string>>,
	nonInlinableClasses: Set<string>,
): string {
	return html.replace(
		/<([a-zA-Z][a-zA-Z0-9-]*)\b([^>]*?)>/g,
		(fullMatch, tag: string, attrs: string) => {
			const classMatch = /\bclass=["']([^"']+)["']/.exec(attrs);
			if (!classMatch) return fullMatch;

			const classes = classMatch[ 1 ].split(/\s+/).filter(Boolean);

			// ── Inline styles ──────────────────────────────────────────────────────

			const mergedTailwind: Record<string, string> = {};
			for (const cls of classes) {
				const styles = classToInlineStyles.get(cls);
				if (styles) Object.assign(mergedTailwind, styles);
			}

			let newAttrs = attrs;

			if (Object.keys(mergedTailwind).length > 0) {
				const styleMatch = /\bstyle=["']([^"']*)["']/.exec(attrs);
				const existingStyles = parseInlineStyle(styleMatch ? styleMatch[ 1 ] : '');
				// Existing style= wins over Tailwind (author intent)
				const finalStyles = { ...existingStyles, ...mergedTailwind };
				const finalStyleStr = serializeStyle(finalStyles);

				if (styleMatch) {
					newAttrs = newAttrs.replace(
						/\bstyle=["'][^"']*["']/,
						`style="${finalStyleStr}"`,
					);
				} else {
					newAttrs = `${newAttrs} style="${finalStyleStr}"`;
				}
			}

			// ── Rewrite class attribute for non-inlinable rules ───────────────────

			const rewrittenClasses = classes.map((cls) =>
				nonInlinableClasses.has(cls) ? sanitizeClassName(cls) : cls,
			);
			newAttrs = newAttrs.replace(
				/\bclass=["'][^"']*["']/,
				`class="${rewrittenClasses.join(' ')}"`,
			);

			return `<${tag}${newAttrs}>`;
		},
	);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Post-processes a rendered email HTML string, converting Tailwind classes to
 * email-safe inline styles.
 *
 * **Inlinable classes** (`p-4`, `text-blue-500`, …) are converted to `style="…"` attributes.
 *
 * **Non-inlinable classes** (`hover:bg-blue-600`, `@media` breakpoint utilities like
 * `sm:text-lg`, …) are collected and injected as a `<style>` block inside `<head>`.
 * If no `<head>` element is present and non-inlinable rules exist, an error is thrown
 * to match the react-email behaviour.
 *
 * @param html    - Fully rendered email HTML string.
 * @param options - Optional Tailwind configuration.
 * @returns Processed HTML string with inlined styles.
 */
export async function inlineTailwind(
	html: string,
	options: InlineTailwindOptions = {},
): Promise<string> {
	const config = Object.assign(options.config ?? {}, {
		presets: [ options.config?.presets ?? [], pixelBasedPreset ],
	});

	// 1. Discover all classes used in the template
	const allClasses = collectClasses(html);
	if (allClasses.length === 0) return html;

	// 2. Compile Tailwind for exactly the classes found
	const setup = await setupTailwind(config);
	setup.addUtilities(allClasses);
	const styleSheet = setup.getStyleSheet();

	// 3. Sanitize: resolve variables, calc, convert oklch → rgb, etc.
	sanitizeStyleSheet(styleSheet);

	// 4. Split rules into inlinable and non-inlinable
	const { inlinable: inlinableRules, nonInlinable: nonInlinableRules } =
		extractRulesPerClass(styleSheet, allClasses);

	const customProperties = getCustomProperties(styleSheet);

	// 5. Build a map from class name → inline style object
	const classToInlineStyles = new Map<string, Record<string, string>>();
	for (const [ className, rule ] of inlinableRules) {
		const styles = makeInlineStylesFor([ rule ], customProperties);
		if (Object.keys(styles).length > 0) {
			classToInlineStyles.set(className, styles);
		}
	}

	// 6. Handle non-inlinable rules (media queries, pseudo-classes, …)
	const nonInlinableClassNames = new Set(nonInlinableRules.keys());

	let nonInlineStylesBlock = '';
	if (nonInlinableRules.size > 0) {
		const nonInlineStyleSheet: StyleSheet = {
			type: 'StyleSheet',
			children: new List<CssNode>().fromArray(
				Array.from(nonInlinableRules.values()),
			),
		};
		sanitizeNonInlinableRules(nonInlineStyleSheet);
		nonInlineStylesBlock = generate(nonInlineStyleSheet);
	}

	// 7. Rewrite HTML: inject styles and rewrite class attributes
	let result = rewriteTags(html, classToInlineStyles, nonInlinableClassNames);

	// 8. Inject non-inlinable rules into <head>
	if (nonInlineStylesBlock) {
		if (!/<\/head\s*>/i.test(result)) {
			throw new Error(
				`[astro-email] Tailwind found non-inlinable classes (${Array.from(nonInlinableClassNames).join(', ')}) ` +
				'that require a <style> tag inside <head>, but no </head> was found in the rendered HTML.\n' +
				'Make sure your email template includes a <Head> component (or a plain <head> element).',
			);
		}
		result = result.replace(
			/<\/head\s*>/i,
			`<style>${nonInlineStylesBlock}</style></head>`,
		);
	}

	return result;
}
