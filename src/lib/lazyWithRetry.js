import { lazy } from 'react';

/**
 * React.lazy with stale-chunk recovery.
 *
 * After a deploy, an open client may request a code-split chunk whose hashed
 * filename no longer exists (the service worker rotated assets). The dynamic
 * import() then rejects and the view goes blank until a manual refresh. This
 * wrapper reloads the page exactly once on such a failure so the client picks
 * up the new asset graph automatically.
 */
export function lazyWithRetry(factory, name = 'chunk') {
  return lazy(async () => {
    const key = `chunk-retry-${name}`;
    try {
      const mod = await factory();
      sessionStorage.removeItem(key);
      return mod;
    } catch (err) {
      if (typeof window !== 'undefined' && !sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1');
        window.location.reload();
        return new Promise(() => {}); // keep Suspense pending during reload
      }
      throw err;
    }
  });
}
