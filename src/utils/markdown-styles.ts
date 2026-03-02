import type { StyleObject } from './style.js';

const emptyStyle: StyleObject = {};

const baseHeaderStyles: StyleObject = {
	fontWeight: '500',
	paddingTop: 20,
};

export type MarkdownStylesType = {
	h1?: StyleObject;
	h2?: StyleObject;
	h3?: StyleObject;
	h4?: StyleObject;
	h5?: StyleObject;
	h6?: StyleObject;
	blockQuote?: StyleObject;
	bold?: StyleObject;
	italic?: StyleObject;
	link?: StyleObject;
	codeBlock?: StyleObject;
	codeInline?: StyleObject;
	p?: StyleObject;
	li?: StyleObject;
	ul?: StyleObject;
	ol?: StyleObject;
	image?: StyleObject;
	br?: StyleObject;
	hr?: StyleObject;
	table?: StyleObject;
	thead?: StyleObject;
	tbody?: StyleObject;
	tr?: StyleObject;
	th?: StyleObject;
	td?: StyleObject;
	strikethrough?: StyleObject;
};

const codeBase: StyleObject = {
	color: '#212529',
	fontSize: '87.5%',
	background: '#f8f8f8',
	fontFamily: 'SFMono-Regular,Menlo,Monaco,Consolas,monospace',
};

export const defaultMarkdownStyles: MarkdownStylesType = {
	h1: { ...baseHeaderStyles, fontSize: '2.5rem' },
	h2: { ...baseHeaderStyles, fontSize: '2rem' },
	h3: { ...baseHeaderStyles, fontSize: '1.75rem' },
	h4: { ...baseHeaderStyles, fontSize: '1.5rem' },
	h5: { ...baseHeaderStyles, fontSize: '1.25rem' },
	h6: { ...baseHeaderStyles, fontSize: '1rem' },
	bold: { fontWeight: 'bold' },
	italic: { fontStyle: 'italic' },
	blockQuote: {
		background: '#f9f9f9',
		borderLeft: '10px solid #ccc',
		margin: '1.5em 10px',
		padding: '1em 10px',
	},
	link: {
		color: '#007bff',
		textDecoration: 'underline',
		backgroundColor: 'transparent',
	},
	codeBlock: { ...codeBase, display: 'block', paddingTop: 10, paddingRight: 10, paddingLeft: 10, paddingBottom: 1, marginBottom: 20, wordWrap: 'break-word' },
	codeInline: { ...codeBase, display: 'inline', wordWrap: 'break-word' },
	p: emptyStyle,
	li: emptyStyle,
	ul: emptyStyle,
	ol: emptyStyle,
	image: emptyStyle,
	br: emptyStyle,
	hr: emptyStyle,
	table: emptyStyle,
	thead: emptyStyle,
	tbody: emptyStyle,
	tr: emptyStyle,
	th: emptyStyle,
	td: emptyStyle,
	strikethrough: emptyStyle,
};
