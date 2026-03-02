import { experimental_AstroContainer as AstroContainer } from 'astro/container';

/**
 * Renders an Astro component to an HTML string using AstroContainer.
 * Convenience wrapper used across all component tests.
 */
export async function render(
	// biome-ignore lint/suspicious/noExplicitAny: intentional – matches AstroComponentFactory
	component: any,
	props: Record<string, unknown> = {},
	slots: Record<string, string> = {},
): Promise<string> {
	const container = await AstroContainer.create();
	return container.renderToString(component, {
		props,
		slots,
	});
}
