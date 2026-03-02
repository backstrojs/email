import type { StyleObject } from './style.js';

function camelToKebabCase(str: string): string {
	return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Converts a CSS-in-JS style object to an inline-css string suitable for
 * embedding inside HTML `style="..."` attributes in email markup.
 * Numeric values for dimensional properties get a `px` suffix.
 */
export function parseCssInJsToInlineCss(cssProperties: StyleObject | undefined): string {
	if (!cssProperties) return '';

	const dimensionalProperties = new Set([
		'width', 'height', 'margin', 'marginTop', 'marginRight', 'marginBottom',
		'marginLeft', 'padding', 'paddingTop', 'paddingRight', 'paddingBottom',
		'paddingLeft', 'borderWidth', 'borderRadius', 'fontSize', 'lineHeight',
		'letterSpacing', 'wordSpacing', 'top', 'right', 'bottom', 'left',
		'minWidth', 'maxWidth', 'minHeight', 'maxHeight',
	]);

	return Object.entries(cssProperties)
		.filter(([ , value ]) => value != null && value !== '')
		.map(([ key, value ]) => {
			const cssKey = camelToKebabCase(key);
			let cssValue: string;
			if (typeof value === 'number' && dimensionalProperties.has(key)) {
				cssValue = `${value}px`;
			} else {
				cssValue = String(value);
			}
			// Escape double quotes inside values to avoid breaking the attribute
			cssValue = cssValue.replace(/"/g, '&#x27;');
			return `${cssKey}: ${cssValue}`;
		})
		.join('; ');
}
