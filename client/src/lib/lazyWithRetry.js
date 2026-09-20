import { lazy } from 'react';

const RECOVERABLE =
  /ChunkLoadError|Failed to fetch dynamically imported module|error loading dynamically imported module|disallowed MIME type|Failed to fetch|dynamically imported module/i;

export default function lazyWithRetry(factory, { retries = 1 } = {}) {
  return lazy(async () => {
    let lastError = null;

    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        return await factory();
      } catch (error) {
        lastError = error;
      }
    }

    if (
      typeof window !== 'undefined' &&
      sessionStorage.getItem('lazy-reloaded') !== '1' &&
      RECOVERABLE.test(String(lastError?.message || lastError || ''))
    ) {
      sessionStorage.setItem('lazy-reloaded', '1');
      window.location.reload();
      return new Promise(() => {});
    }

    throw lastError;
  });
}
