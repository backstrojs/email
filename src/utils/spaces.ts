type MarginValue = number | string | undefined;

export interface MarginShorthands {
	/** All sides */
	m?: MarginValue;
	/** Horizontal (left + right) */
	mx?: MarginValue;
	/** Vertical (top + bottom) */
	my?: MarginValue;
	/** Top */
	mt?: MarginValue;
	/** Right */
	mr?: MarginValue;
	/** Bottom */
	mb?: MarginValue;
	/** Left */
	ml?: MarginValue;
}

type MarginStyles = {
	margin?: MarginValue;
	marginTop?: MarginValue;
	marginRight?: MarginValue;
	marginBottom?: MarginValue;
	marginLeft?: MarginValue;
};

function withSpace(value: MarginValue, properties: (keyof MarginStyles)[]): MarginStyles {
	const styles: MarginStyles = {};
	if (value === undefined) return styles;
	const resolved = typeof value === 'number' ? `${value}px` : value;
	for (const prop of properties) {
		(styles as Record<string, unknown>)[ prop ] = resolved;
	}
	return styles;
}

/**
 * Converts margin shorthand props (m, mx, my, mt, mr, mb, ml) to CSS margin properties.
 */
export function withMargin(props: MarginShorthands): MarginStyles {
	const candidates = [
		withSpace(props.m, [ 'margin' ]),
		withSpace(props.mx, [ 'marginLeft', 'marginRight' ]),
		withSpace(props.my, [ 'marginTop', 'marginBottom' ]),
		withSpace(props.mt, [ 'marginTop' ]),
		withSpace(props.mr, [ 'marginRight' ]),
		withSpace(props.mb, [ 'marginBottom' ]),
		withSpace(props.ml, [ 'marginLeft' ]),
	];

	const merged: MarginStyles = {};
	for (const style of candidates) {
		Object.assign(merged, style);
	}
	return merged;
}
