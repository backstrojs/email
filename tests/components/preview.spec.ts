import { describe, expect, it } from 'vitest';
import Preview from '../../src/components/Preview.astro';
import { render } from '../helpers.js';

describe('<Preview>', () => {
	it('renders slot content', async () => {
		const html = await render(Preview, {}, { default: 'Your order has shipped!' });
		expect(html).toContain('Your order has shipped!');
	});

	it('is hidden — has display: none', async () => {
		const html = await render(Preview);
		expect(html).toContain('display: none');
	});

	it('has max-height: 0 to prevent layout disruption', async () => {
		const html = await render(Preview);
		expect(html).toContain('max-height: 0');
	});

	it('has overflow: hidden', async () => {
		const html = await render(Preview);
		expect(html).toContain('overflow: hidden');
	});

	it('includes unicode whitespace filler characters', async () => {
		const html = await render(Preview, {}, { default: 'Short preview' });
		// Non-breaking space + zero-width characters used to fill up to 150 chars
		expect(html).toContain('\xa0'); // &nbsp;
		expect(html).toContain('\u200C'); // zero-width non-joiner
	});

	it('does not contain the filler chars in the visible text', async () => {
		// The filler must be inside the hidden container, not leaking outside
		const html = await render(Preview, {}, { default: 'Hello' });
		const hiddenDiv = html.match(/<div[^>]*style="[^"]*display: none[^"]*"[^>]*>[\s\S]*?<\/div>/);
		expect(hiddenDiv).not.toBeNull();
	});

	it('allows custom styles via style prop', async () => {
		const html = await render(Preview, { style: { opacity: 0 } });
		expect(html).toContain('opacity: 0');
	});
});
