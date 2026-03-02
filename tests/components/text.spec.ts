import { describe, expect, it } from 'vitest';
import Text from '../../src/components/Text.astro';
import { render } from '../helpers.js';

describe('<Text>', () => {
	it('renders a <p> element', async () => {
		const html = await render(Text);
		expect(html).toContain('<p');
		expect(html).toContain('</p>');
	});

	it('renders slot children', async () => {
		const html = await render(Text, {}, { default: 'Hello world' });
		expect(html).toContain('Hello world');
	});

	it('includes default font-size of 14px', async () => {
		const html = await render(Text);
		expect(html).toContain('font-size: 14px');
	});

	it('includes default line-height of 24px', async () => {
		const html = await render(Text);
		expect(html).toContain('line-height: 24px');
	});

	it('applies default top and bottom margins of 16px', async () => {
		const html = await render(Text);
		expect(html).toContain('margin-top: 16px');
		expect(html).toContain('margin-bottom: 16px');
	});

	it('allows overriding margin via style prop', async () => {
		const html = await render(Text, { style: { marginTop: '0px', marginBottom: '0px' } });
		expect(html).toContain('margin-top: 0px');
		expect(html).toContain('margin-bottom: 0px');
	});

	it('merges custom styles with defaults', async () => {
		const html = await render(Text, { style: { color: '#374151' } });
		expect(html).toContain('color: #374151');
		expect(html).toContain('font-size: 14px');
	});

	it('forwards additional HTML attributes', async () => {
		const html = await render(Text, { 'data-testid': 'body-text' });
		expect(html).toContain('data-testid="body-text"');
	});
});
