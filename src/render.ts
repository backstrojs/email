/**
 * render – server-side render an Astro component to an HTML string.
 *
 * Uses Astro's `AstroContainer` API (stable since Astro 4.9) to render
 * any `.astro` component to a complete HTML string — ideal for generating
 * email bodies to pass to a sending service (Resend, Nodemailer, etc.).
 *
 * @example
 * ```ts
 * import { render } from '@backstro/email/render';
 * import WelcomeEmail from './emails/WelcomeEmail.astro';
 *
 * const html = await render(WelcomeEmail, { name: 'Alice' });
 * await resend.emails.send({ html, ... });
 * ```
 */

/**
 * Renders an Astro component to an HTML string.
 *
 * @param component - The imported `.astro` component.
 * @param props - Props to pass to the component.
 * @param options - Additional container options.
 * @returns Full HTML string output.
 */
export async function render<TProps extends Record<string, unknown>>(
	// biome-ignore lint/suspicious/noExplicitAny: intentional – mirrors astro AstroComponentFactory
	component: any,
	props?: TProps,
	options?: { slots?: Record<string, string>; tailwind?: import('./tailwind.js').TailwindConfig },
): Promise<string> {
	// Dynamically import AstroContainer to avoid bundling issues when this
	// module is loaded in a browser context.
	const { experimental_AstroContainer: AstroContainer } = await import('astro/container');
	const container = await AstroContainer.create();

	const html = await container.renderToString(component, {
		props: props ?? {},
		slots: options?.slots,
	});

	if (options?.tailwind !== undefined) {
		const { inlineTailwind } = await import('./tailwind.js');
		return inlineTailwind(html, { config: options.tailwind });
	}

	return html;
}

/**
 * Renders an Astro component to a plain-text string by stripping all HTML
 * tags and decoding basic HTML entities. Useful as the `text` fallback for
 * email clients that don't render HTML.
 */
export async function renderText<TProps extends Record<string, unknown>>(
	// biome-ignore lint/suspicious/noExplicitAny: intentional
	component: any,
	props?: TProps,
): Promise<string> {
	const html = await render(component, props);
	return html
		.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
		.replace(/<[^>]+>/g, '')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#x27;/g, "'")
		.replace(/&nbsp;/g, ' ')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
}
