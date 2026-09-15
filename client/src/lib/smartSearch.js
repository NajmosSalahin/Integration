import Fuse from 'fuse.js';

const indexCache = new WeakMap();

function getIndex(products) {
  let fuse = indexCache.get(products);
  if (!fuse) {
    fuse = new Fuse(products, {
      keys: [
        { name: 'title', weight: 0.6 },
        { name: 'tags', weight: 0.25 },
        { name: 'description', weight: 0.15 },
      ],
      threshold: 0.4,
      ignoreLocation: true,
      includeScore: true,
    });
    indexCache.set(products, fuse);
  }
  return fuse;
}

export function buildSearchIndex(products) {
  return getIndex(products);
}

export function searchProducts(products, query, limit) {
  const trimmed = (query || '').trim();
  if (!products) return undefined;
  if (!trimmed) return products;
  const fuse = getIndex(products);
  const results = fuse.search(trimmed).map((r) => r.item);
  return limit ? results.slice(0, limit) : results;
}