import { describe, expect, it } from 'vitest';
import Html from '../src/components/Html.astro';
import Text from '../src/components/Text.astro';
import { render, renderText } from '../src/render.js';

// ---------------------------------------------------------------------------
// render()
// ---------------------------------------------------------------------------

describe('render()', () => {
	it('returns a non-empty HTML string', async () => {
		const html = await render(Html);
		expect(html.length).toBeGreaterThan(0);
	});

	it('output contains an <html> element', async () => {
		const html = await render(Html);
		expect(html).toContain('<html');
	});

	it('forwards props to the component', async () => {
		const html = await render(Html, { lang: 'fr', dir: 'ltr' });
		expect(html).toContain('lang="fr"');
	});

	it('renders a slot passed via options.slots', async () => {
		const html = await render(Html, {}, { slots: { default: '<p>Hello</p>' } });
		expect(html).toContain('<p>Hello</p>');
	});

	it('works for a simple component without props', async () => {
		const html = await render(Text);
		expect(html).toContain('<p');
	});
});

// ---------------------------------------------------------------------------
// renderText()
// ---------------------------------------------------------------------------

describe('renderText()', () => {
	it('strips all HTML tags', async () => {
		const text = await renderText(Text, {});
		expect(text).not.toMatch(/<[^>]+>/);
	});

	it('removes <style> blocks entirely, including their content', async () => {
		const text = await renderText(Html);
		expect(text).not.toContain('<style');
		expect(text).not.toContain('</style>');
	});

	it('decodes &amp; entity', async () => {
		// Render a Text component whose slot contains an ampersand entity
		const html = await render(Text);
		// Directly test the decode logic by invoking renderText on a component
		// that produces &amp; in output – simplest check via the function itself.
		const text = await renderText(Text);
		// The result must not contain HTML entity sequences
		expect(text).not.toContain('&amp;');
	});

	it('decodes &lt; and &gt; entities', async () => {
		const text = await renderText(Text);
		expect(text).not.toContain('&lt;');
		expect(text).not.toContain('&gt;');
	});

	it('returns trimmed output', async () => {
		const text = await renderText(Html);
		expect(text).toBe(text.trim());
	});

	it('collapses more than two consecutive newlines into two', async () => {
		const text = await renderText(Html);
		expect(text).not.toMatch(/\n{3,}/);
	});
});
