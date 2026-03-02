import { describe, expect, it } from 'vitest';
import Button from '../../src/components/Button.astro';
import { render } from '../helpers.js';

describe('<Button>', () => {
	it('renders an <a> tag with the given href', async () => {
		const html = await render(Button, { href: 'https://example.com' });
		expect(html).toContain('href="https://example.com"');
	});

	it('defaults target to _blank', async () => {
		const html = await render(Button, { href: 'https://example.com' });
		expect(html).toContain('target="_blank"');
	});

	it('respects a custom target', async () => {
		const html = await render(Button, { href: 'https://example.com', target: '_self' });
		expect(html).toContain('target="_self"');
	});

	it('renders slot children', async () => {
		const html = await render(Button, { href: '#' }, { default: 'Click me' });
		expect(html).toContain('Click me');
	});

	it('includes MSO conditional comments for Outlook padding', async () => {
		const html = await render(Button, {
			href: 'https://example.com',
			style: { padding: '12px 20px' },
		});
		expect(html).toContain('<!--[if mso]>');
		expect(html).toContain('mso-font-width');
	});

	it('applies padding values to the inline style', async () => {
		const html = await render(Button, {
			href: 'https://example.com',
			style: { padding: '12px 20px' },
		});
		expect(html).toContain('padding-top: 12px');
		expect(html).toContain('padding-right: 20px');
		expect(html).toContain('padding-bottom: 12px');
		expect(html).toContain('padding-left: 20px');
	});

	it('includes default line-height and display styles', async () => {
		const html = await render(Button, { href: '#' });
		expect(html).toContain('line-height: 100%');
		expect(html).toContain('display: inline-block');
		expect(html).toContain('text-decoration: none');
	});

	it('merges custom style with defaults', async () => {
		const html = await render(Button, {
			href: '#',
			style: { backgroundColor: '#007bff', color: '#fff' },
		});
		expect(html).toContain('background-color: #007bff');
		expect(html).toContain('color: #fff');
	});

	it('forwards additional HTML attributes', async () => {
		const html = await render(Button, { href: '#', 'data-testid': 'submit-btn' });
		expect(html).toContain('data-testid="submit-btn"');
	});
});
