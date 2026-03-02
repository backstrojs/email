export type StyleObject = Record<string, string | number | undefined | null>;

/**
 * Converts a camelCase CSS-in-JS style object to an inline CSS string.
 * e.g. { backgroundColor: '#fff', fontSize: 14 } → 'background-color: #fff; font-size: 14px'
 */
export function styleToString(style: StyleObject): string {
	return Object.entries(style)
		.filter(([ , v ]) => v != null && v !== '')
		.map(([ key, value ]) => {
			const cssKey = key.replace(/([A-Z])/g, (m) => `-${m.toLowerCase()}`);
			const cssValue =
				typeof value === 'number' && !unitlessProperties.has(key)
					? `${value}px`
					: String(value);
			return `${cssKey}: ${cssValue}`;
		})
		.join('; ');
}

/**
 * Merges multiple style objects and returns the inline CSS string.
 */
export function mergeStyles(...styles: (StyleObject | undefined | null)[]): string {
	const merged: StyleObject = {};
	for (const s of styles) {
		if (s) Object.assign(merged, s);
	}
	return styleToString(merged);
}

/** CSS properties that accept unitless numbers (no 'px' appended). */
const unitlessProperties = new Set([
	'animationIterationCount',
	'borderImageOutset',
	'borderImageSlice',
	'borderImageWidth',
	'boxFlex',
	'boxFlexGroup',
	'boxOrdinalGroup',
	'columnCount',
	'columns',
	'flex',
	'flexGrow',
	'flexPositive',
	'flexShrink',
	'flexNegative',
	'flexOrder',
	'gridArea',
	'gridRow',
	'gridRowEnd',
	'gridRowSpan',
	'gridRowStart',
	'gridColumn',
	'gridColumnEnd',
	'gridColumnSpan',
	'gridColumnStart',
	'fontWeight',
	'lineClamp',
	'lineHeight',
	'opacity',
	'order',
	'orphans',
	'tabSize',
	'widows',
	'zIndex',
	'zoom',
	'fillOpacity',
	'floodOpacity',
	'stopOpacity',
	'strokeDasharray',
	'strokeDashoffset',
	'strokeMiterlimit',
	'strokeOpacity',
	'strokeWidth',
]);
