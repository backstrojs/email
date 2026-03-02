import { describe, expect, it } from 'vitest';
import Img from '../../src/components/Img.astro';
import { render } from '../helpers.js';

describe('<Img>', () => {
	it('renders an <img> element', async () => {
		const html = await render(Img);
		expect(html).toContain('<img');
	});

	it('sets the src attribute', async () => {
		const html = await render(Img, { src: 'https://example.com/logo.png' });
		expect(html).toContain('src="https://example.com/logo.png"');
	});

	it('sets the alt attribute', async () => {
		const html = await render(Img, { src: '#', alt: 'Company logo' });
		expect(html).toContain('alt="Company logo"');
	});

	it('defaults alt to empty string', async () => {
		const html = await render(Img, { src: '#' });
		// Astro serialises empty-string attributes as bare attribute names (alt, not alt="")
		expect(html).toContain(' alt');
	});

	it('sets width and height attributes', async () => {
		const html = await render(Img, { src: '#', width: 200, height: 50 });
		expect(html).toContain('width="200"');
		expect(html).toContain('height="50"');
	});

	it('has display: block in default styles', async () => {
		const html = await render(Img, { src: '#' });
		expect(html).toContain('display: block');
	});

	it('resets border to none by default', async () => {
		const html = await render(Img, { src: '#' });
		expect(html).toContain('border: none');
	});

	it('resets outline to none by default', async () => {
		const html = await render(Img, { src: '#' });
		expect(html).toContain('outline: none');
	});

	it('resets text-decoration to none by default', async () => {
		const html = await render(Img, { src: '#' });
		expect(html).toContain('text-decoration: none');
	});

	it('merges custom styles with defaults', async () => {
		const html = await render(Img, { src: '#', style: { maxWidth: '100%' } });
		expect(html).toContain('max-width: 100%');
		expect(html).toContain('display: block');
	});

	it('forwards additional HTML attributes', async () => {
		const html = await render(Img, { src: '#', 'data-testid': 'logo' });
		expect(html).toContain('data-testid="logo"');
	});
});
