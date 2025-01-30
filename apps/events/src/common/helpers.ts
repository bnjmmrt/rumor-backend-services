export const normalizeCatalogName = (name: string) =>
  name
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
