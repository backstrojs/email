import { getViteConfig } from 'astro/config';

/**
 * Uses Astro's own Vite configuration so that `.astro` component imports
 * are transformed correctly inside vitest (same pipeline as a real Astro build).
 */
export default getViteConfig({
	test: {
		globals: true,
		include: [ 'tests/**/*.spec.ts' ],
	},
});
