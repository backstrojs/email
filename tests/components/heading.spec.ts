import { describe, expect, it } from 'vitest';
import Heading from '../../src/components/Heading.astro';
import { render } from '../helpers.js';

describe('<Heading>', () => {
	it('renders <h1> by default', async () => {
		const html = await render(Heading, {}, { default: 'Hello' });
		expect(html).toContain('<h1');
		expect(html).toContain('Hello');
	});

	it('renders the correct element for each `as` value', async () => {
		for (const tag of [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ] as const) {
			const html = await render(Heading, { as: tag }, { default: 'Test' });
			expect(html).toContain(`<${tag}`);
			expect(html).not.toContain(`<${tag === 'h1' ? 'h2' : 'h1'}`);
		}
	});

	it('applies `mt` margin shorthand', async () => {
		const html = await render(Heading, { mt: '32px' });
		expect(html).toContain('margin-top: 32px');
	});

	it('applies `mb` margin shorthand', async () => {
		const html = await render(Heading, { mb: 16 });
		expect(html).toContain('margin-bottom: 16px');
	});

	it('applies `mx` to both left and right margins', async () => {
		const html = await render(Heading, { mx: '24px' });
		expect(html).toContain('margin-left: 24px');
		expect(html).toContain('margin-right: 24px');
	});

	it('applies `my` to both top and bottom margins', async () => {
		const html = await render(Heading, { my: 8 });
		expect(html).toContain('margin-top: 8px');
		expect(html).toContain('margin-bottom: 8px');
	});

	it('merges margin shorthands with custom style prop', async () => {
		const html = await render(Heading, { mt: 0, style: { color: '#111827' } });
		expect(html).toContain('margin-top: 0px');
		expect(html).toContain('color: #111827');
	});

	it('forwards additional HTML attributes', async () => {
		const html = await render(Heading, { 'data-testid': 'page-title' });
		expect(html).toContain('data-testid="page-title"');
	});
});
