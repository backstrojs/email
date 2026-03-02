// ─── Components ───────────────────────────────────────────────────────────────
export { default as Html } from './components/Html.astro';
export { default as Head } from './components/Head.astro';
export { default as Body } from './components/Body.astro';
export { default as Container } from './components/Container.astro';
export { default as Section } from './components/Section.astro';
export { default as Row } from './components/Row.astro';
export { default as Column } from './components/Column.astro';
export { default as Button } from './components/Button.astro';
export { default as Link } from './components/Link.astro';
export { default as Text } from './components/Text.astro';
export { default as Heading } from './components/Heading.astro';
export { default as Hr } from './components/Hr.astro';
export { default as Img } from './components/Img.astro';
export { default as Preview } from './components/Preview.astro';
export { default as Font } from './components/Font.astro';
export { default as CodeBlock } from './components/CodeBlock.astro';
export { default as CodeInline } from './components/CodeInline.astro';
export { default as Markdown } from './components/Markdown.astro';

// ─── Themes (for CodeBlock) ───────────────────────────────────────────────────
export { themes, dracula, githubLight, nightOwl, vsDark } from './themes.js';

// ─── Utilities ────────────────────────────────────────────────────────────────
export { styleToString, mergeStyles } from './utils/style.js';
export { parsePadding, convertToPx } from './utils/parse-padding.js';
export { pxToPt } from './utils/px-to-pt.js';
export { withMargin } from './utils/spaces.js';
export type { MarginShorthands } from './utils/spaces.js';
export { parseCssInJsToInlineCss } from './utils/parse-css-in-js-to-inline-css.js';
export { defaultMarkdownStyles } from './utils/markdown-styles.js';
export type { MarkdownStylesType } from './utils/markdown-styles.js';
export type { StyleObject } from './utils/style.js';
export type { Theme } from './theme-types.js';

// ─── Tailwind ─────────────────────────────────────────────────────────────────
export { inlineTailwind, pixelBasedPreset } from './tailwind.js';
export type { TailwindConfig, InlineTailwindOptions } from './tailwind.js';
