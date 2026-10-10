/** Prefixes a public/ path with the deploy base (e.g. "/fv-wedding" on GitHub Pages). */
export const asset = (path: string) => `${import.meta.env.BASE_URL.replace(/\/$/, '')}${path}`;
