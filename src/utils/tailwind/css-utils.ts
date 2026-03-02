/**
 * CSS processing utilities for Tailwind → email-safe inline styles.
 *
 * Ported from @react-email/tailwind with modifications for HTML string output
 * (kebab-case property names instead of React camelCase CSSProperties).
 */

import {
	type CssNode,
	type Declaration,
	type Dimension,
	type FunctionNode,
	generate,
	List,
	parse,
	type NumberNode,
	type Percentage,
	type Raw,
	type Rule,
	string,
	type StyleSheet,
	type Value,
	walk,
	type ListItem,
	find,
	clone,
} from 'css-tree';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Whether a CSS rule can be fully inlined (no at-rules, no pseudo-selectors). */
export function isRuleInlinable(rule: Rule): boolean {
	return (
		find(rule, (n) => n.type === 'Atrule') === null &&
		find(
			rule,
			(n) =>
				n.type === 'PseudoClassSelector' || n.type === 'PseudoElementSelector',
		) === null
	);
}

function isPartInlinable(part: CssNode): boolean {
	return (
		find(part, (n) => n.type === 'Atrule') === null &&
		find(
			part,
			(n) =>
				n.type === 'PseudoClassSelector' || n.type === 'PseudoElementSelector',
		) === null
	);
}

function splitMixedRule(rule: Rule): {
	inlinablePart: Rule | null;
	nonInlinablePart: Rule | null;
} {
	const selectorHasPseudo =
		rule.prelude !== null &&
		find(
			rule.prelude,
			(n) =>
				n.type === 'PseudoClassSelector' || n.type === 'PseudoElementSelector',
		) !== null;

	if (selectorHasPseudo) {
		return { inlinablePart: null, nonInlinablePart: clone(rule) as Rule };
	}

	const ruleCloneInlinable = clone(rule) as Rule;
	const ruleCloneNonInlinable = clone(rule) as Rule;
	const inlinableParts: CssNode[] = [];
	const nonInlinableParts: CssNode[] = [];

	for (const part of ruleCloneInlinable.block.children.toArray()) {
		if (isPartInlinable(part)) {
			inlinableParts.push(part);
		} else {
			nonInlinableParts.push(part);
		}
	}

	const inlinablePart =
		inlinableParts.length > 0
			? ({
				...ruleCloneInlinable,
				block: {
					type: 'Block' as const,
					children: new List<CssNode>().fromArray(inlinableParts),
				},
			} as Rule)
			: null;

	const nonInlinablePart =
		nonInlinableParts.length > 0
			? ({
				...ruleCloneNonInlinable,
				block: {
					type: 'Block' as const,
					children: new List<CssNode>().fromArray(nonInlinableParts),
				},
			} as Rule)
			: null;

	return { inlinablePart, nonInlinablePart };
}

// ─── Extract rules per class ──────────────────────────────────────────────────

export function extractRulesPerClass(root: CssNode, classes: string[]) {
	const classSet = new Set(classes);
	const inlinableRules = new Map<string, Rule>();
	const nonInlinableRules = new Map<string, Rule>();

	walk(root, {
		visit: 'Rule',
		enter(rule) {
			const selectorClasses: string[] = [];
			walk(rule, {
				visit: 'ClassSelector',
				enter(cs) {
					selectorClasses.push(string.decode(cs.name));
				},
			});

			if (isRuleInlinable(rule)) {
				for (const className of selectorClasses) {
					if (classSet.has(className)) {
						inlinableRules.set(className, rule);
					}
				}
			} else {
				const { inlinablePart, nonInlinablePart } = splitMixedRule(rule);
				for (const className of selectorClasses) {
					if (!classSet.has(className)) continue;
					if (inlinablePart) inlinableRules.set(className, inlinablePart);
					if (nonInlinablePart) nonInlinableRules.set(className, nonInlinablePart);
				}
			}
		},
	});

	return { inlinable: inlinableRules, nonInlinable: nonInlinableRules };
}

// ─── Custom property extraction ───────────────────────────────────────────────

export interface CustomProperty {
	syntax?: Declaration;
	inherits?: Declaration;
	initialValue?: Declaration;
}
export type CustomProperties = Map<string, CustomProperty>;

export function getCustomProperties(node: CssNode): CustomProperties {
	const customProperties = new Map<string, CustomProperty>();

	walk(node, {
		visit: 'Atrule',
		enter(atrule) {
			if (atrule.name === 'property' && atrule.prelude) {
				const prelude = generate(atrule.prelude);
				if (prelude.startsWith('--')) {
					let syntax: Declaration | undefined;
					let inherits: Declaration | undefined;
					let initialValue: Declaration | undefined;
					walk(atrule, {
						visit: 'Declaration',
						enter(decl) {
							if (decl.property === 'syntax') syntax = decl;
							if (decl.property === 'inherits') inherits = decl;
							if (decl.property === 'initial-value') initialValue = decl;
						},
					});
					customProperties.set(prelude, { syntax, inherits, initialValue });
				}
			}
		},
	});

	return customProperties;
}

function unwrapValue(value: Value | Raw) {
	if (value.type === 'Value' && value.children.size === 1) {
		return value.children.first ?? value;
	}
	return value;
}

// ─── Make inline styles ────────────────────────────────────────────────────────

/**
 * Converts CSS rules (already sanitized) to a flat inline style string map.
 * Returns kebab-case property names → value strings (suitable for `style="..."`).
 */
export function makeInlineStylesFor(
	inlinableRules: CssNode[],
	customProperties: CustomProperties,
): Record<string, string> {
	const styles: Record<string, string> = {};

	const localVariableDeclarations = new Map<string, Declaration>();
	for (const rule of inlinableRules) {
		walk(rule, {
			visit: 'Declaration',
			enter(decl) {
				if (decl.property.startsWith('--')) {
					localVariableDeclarations.set(decl.property, decl);
				}
			},
		});
	}

	for (const rule of inlinableRules) {
		walk(rule, {
			visit: 'Function',
			enter(func, funcParentListItem) {
				if (func.name === 'var') {
					let variableName: string | undefined;
					walk(func, {
						visit: 'Identifier',
						enter(ident) {
							variableName = ident.name;
							return this.break;
						},
					});
					if (variableName) {
						const definition = localVariableDeclarations.get(variableName);
						if (definition) {
							funcParentListItem.data = unwrapValue(definition.value);
						} else {
							const customProperty = customProperties.get(variableName);
							if (customProperty?.initialValue) {
								funcParentListItem.data = unwrapValue(
									customProperty.initialValue.value,
								);
							}
						}
					}
				}
			},
		});

		walk(rule, {
			visit: 'Declaration',
			enter(decl) {
				if (decl.property.startsWith('--')) return;
				// Keep property as kebab-case for HTML style attribute
				styles[ decl.property ] =
					generate(decl.value) + (decl.important ? ' !important' : '');
			},
		});
	}

	return styles;
}

// ─── Sanitize class name ───────────────────────────────────────────────────────

const digitToName: Record<string, string> = {
	'0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four',
	'5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine',
};

export function sanitizeClassName(className: string): string {
	return className
		.replaceAll('+', 'plus')
		.replaceAll('[', '')
		.replaceAll('%', 'pc')
		.replaceAll(']', '')
		.replaceAll('(', '')
		.replaceAll(')', '')
		.replaceAll('!', 'imprtnt')
		.replaceAll('>', 'gt')
		.replaceAll('<', 'lt')
		.replaceAll('=', 'eq')
		.replace(/^[0-9]/, (digit) => digitToName[ digit ] ?? digit)
		.replace(/[^a-zA-Z0-9\-_]/g, '_');
}

// ─── Sanitize non-inlinable rules ──────────────────────────────────────────────

export function sanitizeNonInlinableRules(node: CssNode): void {
	walk(node, {
		visit: 'Rule',
		enter(rule) {
			if (!isRuleInlinable(rule)) {
				walk(rule.prelude, (n) => {
					if (n.type === 'ClassSelector') {
						const unescaped = string.decode(n.name);
						n.name = sanitizeClassName(unescaped);
					}
				});
				walk(rule, {
					visit: 'Declaration',
					enter(decl) {
						decl.important = true;
					},
				});
			}
		},
	});
}

// ─── Color helpers ─────────────────────────────────────────────────────────────

function rgbNode(r: number, g: number, b: number, alpha?: number): FunctionNode {
	const children = new List<CssNode>();
	const push = (v: CssNode) => children.appendData(v);
	const comma = (): CssNode => ({ type: 'Operator', value: ',' });

	push({ type: 'Number', value: r.toFixed(0) });
	push(comma());
	push({ type: 'Number', value: g.toFixed(0) });
	push(comma());
	push({ type: 'Number', value: b.toFixed(0) });
	if (alpha !== undefined && alpha !== 1) {
		push(comma());
		push({ type: 'Number', value: String(alpha) });
	}
	return { type: 'Function', name: alpha !== undefined && alpha !== 1 ? 'rgba' : 'rgb', children };
}

const LAB_TO_LMS = {
	l: [ 0.3963377773761749, 0.2158037573099136 ],
	m: [ -0.1055613458156586, -0.0638541728258133 ],
	s: [ -0.0894841775298119, -1.2914855480194092 ],
};
const LMS_TO_RGB = {
	r: [ 4.0767416360759583, -3.3077115392580629, 0.2309699031821043 ],
	g: [ -1.2684379732850315, 2.6097573492876882, -0.341319376002657 ],
	b: [ -0.0041960761386756, -0.7034186179359362, 1.7076146940746117 ],
};

function lrgbToRgb(input: number): number {
	const abs = Math.abs(input);
	const sign = input < 0 ? -1 : 1;
	return abs > 0.0031308
		? sign * (abs ** (1 / 2.4) * 1.055 - 0.055)
		: input * 12.92;
}

function clamp(v: number, min: number, max: number): number {
	return Math.min(Math.max(v, min), max);
}

function oklchToRgb(l: number, c: number, h: number): { r: number; g: number; b: number } {
	const a = c * Math.cos((h / 180) * Math.PI);
	const b_ = c * Math.sin((h / 180) * Math.PI);

	const ls = (l + LAB_TO_LMS.l[ 0 ] * a + LAB_TO_LMS.l[ 1 ] * b_) ** 3;
	const ms = (l + LAB_TO_LMS.m[ 0 ] * a + LAB_TO_LMS.m[ 1 ] * b_) ** 3;
	const ss = (l + LAB_TO_LMS.s[ 0 ] * a + LAB_TO_LMS.s[ 1 ] * b_) ** 3;

	return {
		r: clamp(255 * lrgbToRgb(LMS_TO_RGB.r[ 0 ] * ls + LMS_TO_RGB.r[ 1 ] * ms + LMS_TO_RGB.r[ 2 ] * ss), 0, 255),
		g: clamp(255 * lrgbToRgb(LMS_TO_RGB.g[ 0 ] * ls + LMS_TO_RGB.g[ 1 ] * ms + LMS_TO_RGB.g[ 2 ] * ss), 0, 255),
		b: clamp(255 * lrgbToRgb(LMS_TO_RGB.b[ 0 ] * ls + LMS_TO_RGB.b[ 1 ] * ms + LMS_TO_RGB.b[ 2 ] * ss), 0, 255),
	};
}

function separateShorthand(
	decl: Declaration,
	[ start, end ]: [ string, string ],
	list: List<CssNode>,
	item: ListItem<CssNode>,
): void {
	decl.property = start;
	const values =
		decl.value.type === 'Value'
			? decl.value.children
				.toArray()
				.filter(
					(c) =>
						c.type === 'Dimension' ||
						c.type === 'Number' ||
						c.type === 'Percentage',
				)
			: [ decl.value ];

	let endValue: CssNode = decl.value;
	if (values.length === 2) {
		endValue = {
			type: 'Value',
			children: new List<CssNode>().fromArray([ values[ 1 ] ]),
		};
		decl.value = {
			type: 'Value',
			children: new List<CssNode>().fromArray([ values[ 0 ] ]),
		};
	}

	list.insertData(
		{
			type: 'Declaration',
			property: end,
			value: endValue as Value | Raw,
			important: decl.important,
		},
		item,
	);
}

// ─── Sanitize declarations ─────────────────────────────────────────────────────

/**
 * Converts modern CSS values to email-client-safe equivalents:
 * - oklch → rgb
 * - rgb (space syntax) → rgb (comma syntax)
 * - #hex → rgb
 * - padding-inline / padding-block / margin-inline / margin-block → longhand
 * - border-radius: calc(infinity * 1px) → 9999px
 */
export function sanitizeDeclarations(node: CssNode): void {
	walk(node, {
		visit: 'Declaration',
		enter(declaration, item, list) {
			// Parse Raw values
			if (declaration.value.type === 'Raw') {
				declaration.value = parse(declaration.value.value, {
					context: 'value',
				}) as Value | Raw;
			}

			// border-radius: calc(infinity * 1px) → 9999px
			if (
				/border-radius\s*:\s*calc\s*\(\s*infinity\s*\*\s*1px\s*\)/i.test(
					generate(declaration),
				)
			) {
				declaration.value = parse('9999px', { context: 'value' }) as Value;
			}

			// oklch and rgb conversion
			walk(declaration, {
				visit: 'Function',
				enter(func, funcParentListItem) {
					const children = func.children.toArray();
					if (func.name === 'oklch') {
						let l: number | undefined, c: number | undefined, h: number | undefined, a: number | undefined;
						for (const child of children) {
							if (child.type === 'Number') {
								if (l === undefined) { l = Number.parseFloat(child.value); continue; }
								if (c === undefined) { c = Number.parseFloat(child.value); continue; }
								if (h === undefined) { h = Number.parseFloat(child.value); continue; }
								if (a === undefined) { a = Number.parseFloat(child.value); continue; }
							}
							if (child.type === 'Dimension' && child.unit === 'deg') {
								if (h === undefined) { h = Number.parseFloat(child.value); continue; }
							}
							if (child.type === 'Percentage') {
								if (l === undefined) { l = Number.parseFloat(child.value) / 100; continue; }
								if (a === undefined) { a = Number.parseFloat(child.value) / 100; }
							}
						}
						if (l !== undefined && c !== undefined && h !== undefined) {
							const rgb = oklchToRgb(l, c, h);
							funcParentListItem.data = rgbNode(rgb.r, rgb.g, rgb.b, a);
						}
					}

					if (func.name === 'rgb') {
						let r: number | undefined, g: number | undefined, b: number | undefined, a: number | undefined;
						for (const child of children) {
							if (child.type === 'Number') {
								if (r === undefined) { r = Number.parseFloat(child.value); continue; }
								if (g === undefined) { g = Number.parseFloat(child.value); continue; }
								if (b === undefined) { b = Number.parseFloat(child.value); continue; }
								if (a === undefined) { a = Number.parseFloat(child.value); }
							}
							if (child.type === 'Percentage') {
								if (r === undefined) { r = (Number.parseFloat(child.value) * 255) / 100; continue; }
								if (g === undefined) { g = (Number.parseFloat(child.value) * 255) / 100; continue; }
								if (b === undefined) { b = (Number.parseFloat(child.value) * 255) / 100; continue; }
								if (a === undefined) { a = Number.parseFloat(child.value) / 100; }
							}
						}
						if (r !== undefined && g !== undefined && b !== undefined) {
							funcParentListItem.data = a !== undefined && a !== 1
								? rgbNode(r, g, b, a)
								: rgbNode(r, g, b);
						}
					}

					// color-mix(in oklab, rgb(...) <opacity>, transparent)
					if (func.name === 'color-mix') {
						const ch = func.children.toArray();
						const color: CssNode | undefined = ch[ 3 ];
						const opacity: CssNode | undefined = ch[ 4 ];
						if (
							func.children.last?.type === 'Identifier' &&
							func.children.last.name === 'transparent' &&
							color?.type === 'Function' &&
							color.name === 'rgb' &&
							opacity
						) {
							color.children.appendData({ type: 'Operator', value: ',' });
							color.children.appendData(opacity);
							funcParentListItem.data = color;
						}
					}
				},
			});

			// #hex → rgb
			walk(declaration, {
				visit: 'Hash',
				enter(hash, hashParentListItem) {
					const hex = hash.value.trim();
					const parse6 = (h: string) => ({
						r: Number.parseInt(h.slice(0, 2), 16),
						g: Number.parseInt(h.slice(2, 4), 16),
						b: Number.parseInt(h.slice(4, 6), 16),
					});
					if (hex.length === 3) {
						const r = Number.parseInt(hex[ 0 ] + hex[ 0 ], 16);
						const g = Number.parseInt(hex[ 1 ] + hex[ 1 ], 16);
						const b = Number.parseInt(hex[ 2 ] + hex[ 2 ], 16);
						hashParentListItem.data = rgbNode(r, g, b);
					} else if (hex.length === 4) {
						const r = Number.parseInt(hex[ 0 ] + hex[ 0 ], 16);
						const g = Number.parseInt(hex[ 1 ] + hex[ 1 ], 16);
						const b = Number.parseInt(hex[ 2 ] + hex[ 2 ], 16);
						const a = Number.parseInt(hex[ 3 ] + hex[ 3 ], 16) / 255;
						hashParentListItem.data = rgbNode(r, g, b, a);
					} else if (hex.length === 6) {
						const { r, g, b } = parse6(hex);
						hashParentListItem.data = rgbNode(r, g, b);
					} else if (hex.length === 8) {
						const { r, g, b } = parse6(hex);
						const a = Number.parseInt(hex.slice(6, 8), 16) / 255;
						hashParentListItem.data = rgbNode(r, g, b, a);
					}
				},
			});

			// Logical property shorthands → physical longhands
			if (!list || !item) return;
			if (declaration.property === 'padding-inline') {
				separateShorthand(declaration, [ 'padding-left', 'padding-right' ], list as List<CssNode>, item as ListItem<CssNode>);
			}
			if (declaration.property === 'padding-block') {
				separateShorthand(declaration, [ 'padding-top', 'padding-bottom' ], list as List<CssNode>, item as ListItem<CssNode>);
			}
			if (declaration.property === 'margin-inline') {
				separateShorthand(declaration, [ 'margin-left', 'margin-right' ], list as List<CssNode>, item as ListItem<CssNode>);
			}
			if (declaration.property === 'margin-block') {
				separateShorthand(declaration, [ 'margin-top', 'margin-bottom' ], list as List<CssNode>, item as ListItem<CssNode>);
			}
		},
	});
}

// ─── Resolve calc() expressions ────────────────────────────────────────────────

/**
 * Resolves simple `calc()` multiply / divide expressions (covers all Tailwind v4 usage).
 */
export function resolveCalcExpressions(node: CssNode): void {
	walk(node, {
		visit: 'Function',
		enter(func, funcListItem) {
			if (func.name !== 'calc') return;

			func.children.forEach((child, item) => {
				const left = item.prev;
				const right = item.next;
				if (
					!left || !right ||
					child.type !== 'Operator' ||
					(child.value !== '*' && child.value !== '/')
				) return;

				const leftOk =
					left.data.type === 'Dimension' ||
					left.data.type === 'Number' ||
					left.data.type === 'Percentage';
				const rightOk =
					right.data.type === 'Dimension' ||
					right.data.type === 'Number' ||
					right.data.type === 'Percentage';
				if (!leftOk || !rightOk) return;

				const lv = Number.parseFloat((left.data as Dimension | NumberNode | Percentage).value);
				const rv = Number.parseFloat((right.data as Dimension | NumberNode | Percentage).value);
				const value = String(child.value === '*' ? lv * rv : rv === 0 ? 0 : lv / rv);

				if (left.data.type === 'Dimension' && right.data.type === 'Number') {
					item.data = { type: 'Dimension', unit: left.data.unit, value };
				} else if (left.data.type === 'Number' && right.data.type === 'Dimension') {
					item.data = { type: 'Dimension', unit: right.data.unit, value };
				} else if (left.data.type === 'Number' && right.data.type === 'Number') {
					item.data = { type: 'Number', value };
				} else if (
					left.data.type === 'Dimension' &&
					right.data.type === 'Dimension' &&
					left.data.unit === right.data.unit
				) {
					item.data = child.value === '/'
						? { type: 'Number', value }
						: { type: 'Dimension', unit: left.data.unit, value };
				} else if (left.data.type === 'Percentage' && right.data.type === 'Number') {
					item.data = { type: 'Percentage', value };
				} else if (left.data.type === 'Number' && right.data.type === 'Percentage') {
					item.data = { type: 'Percentage', value };
				} else if (left.data.type === 'Percentage' && right.data.type === 'Percentage') {
					item.data = child.value === '/'
						? { type: 'Number', value }
						: { type: 'Percentage', value };
				} else return;

				func.children.remove(left);
				func.children.remove(right);
			});

			if (func.children.size === 1 && func.children.first) {
				funcListItem.data = func.children.first;
			}
		},
	});
}

// ─── Resolve CSS variables ────────────────────────────────────────────────────

interface VariableUse {
	declaration: Declaration;
	path: CssNode[];
	variableName: string;
	fallback?: string;
	raw: string;
}

interface VariableDefinition {
	declaration: Declaration;
	path: CssNode[];
	variableName: string;
	definition: string;
}

function doSelectorsIntersect(first: CssNode, second: CssNode): boolean {
	const a = generate(first);
	const b = generate(second);
	if (a === b) return true;

	let hasUniversal = false;
	const check = (n: CssNode) => {
		if ((n.type === 'PseudoClassSelector' && n.name === 'root') ||
			(n.type === 'TypeSelector' && n.name === '*')) {
			hasUniversal = true;
		}
	};
	walk(first, check);
	walk(second, check);
	return hasUniversal;
}

export function resolveAllCssVariables(node: CssNode): void {
	const variableDefinitions = new Set<VariableDefinition>();
	const variableUses = new Set<VariableUse>();
	const path: CssNode[] = [];

	walk(node, {
		leave() { path.shift(); },
		enter(n: CssNode) {
			if (n.type === 'Declaration') {
				const declaration = n;
				// Skip @layer properties { ... } redefinitions
				if (
					path.some(
						(ancestor) =>
							ancestor.type === 'Atrule' &&
							ancestor.name === 'layer' &&
							ancestor.prelude !== null &&
							generate(ancestor.prelude).includes('properties'),
					)
				) {
					path.unshift(n);
					return;
				}

				if (/^--/.test(declaration.property)) {
					variableDefinitions.add({
						declaration,
						path: [ ...path ],
						variableName: declaration.property,
						definition: generate(declaration.value),
					});
				} else {
					walk(declaration.value, {
						visit: 'Function',
						enter(func) {
							if (func.name !== 'var') return;
							const children = func.children.toArray();
							const name = generate(children[ 0 ]);
							const fallback = children[ 2 ] ? generate(children[ 2 ]) : undefined;
							variableUses.add({
								declaration,
								path: [ ...path ],
								variableName: name,
								fallback,
								raw: generate(func),
							});
						},
					});
				}
			}
			path.unshift(n);
		},
	});

	for (const use of variableUses) {
		let replaced = false;
		for (const def of variableDefinitions) {
			if (use.variableName !== def.variableName) continue;

			const useInAtRule =
				use.path[ 0 ]?.type === 'Block' &&
				use.path[ 1 ]?.type === 'Atrule' &&
				use.path[ 2 ]?.type === 'Block' &&
				use.path[ 3 ]?.type === 'Rule';

			const defInRule =
				def.path[ 0 ]?.type === 'Block' && def.path[ 1 ]?.type === 'Rule';

			if (
				useInAtRule &&
				defInRule &&
				doSelectorsIntersect(
					(use.path[ 3 ] as Rule).prelude,
					(def.path[ 1 ] as Rule).prelude,
				)
			) {
				use.declaration.value = parse(
					generate(use.declaration.value).replaceAll(use.raw, def.definition),
					{ context: 'value' },
				) as Value | Raw;
				replaced = true;
				break;
			}

			if (
				use.path[ 0 ]?.type === 'Block' &&
				use.path[ 1 ]?.type === 'Rule' &&
				defInRule &&
				doSelectorsIntersect(
					(use.path[ 1 ] as Rule).prelude,
					(def.path[ 1 ] as Rule).prelude,
				)
			) {
				use.declaration.value = parse(
					generate(use.declaration.value).replaceAll(use.raw, def.definition),
					{ context: 'value' },
				) as Value | Raw;
				replaced = true;
				break;
			}
		}

		if (!replaced && use.fallback) {
			use.declaration.value = parse(
				generate(use.declaration.value).replaceAll(use.raw, use.fallback),
				{ context: 'value' },
			) as Value | Raw;
		}
	}
}

// ─── Top-level sanitize ────────────────────────────────────────────────────────

export function sanitizeStyleSheet(styleSheet: StyleSheet): void {
	resolveAllCssVariables(styleSheet);
	resolveCalcExpressions(styleSheet);
	sanitizeDeclarations(styleSheet);
}
