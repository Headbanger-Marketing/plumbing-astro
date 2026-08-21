// Deterministic per-domain variant picker for network template copy.
//
// The estates share one Astro source across dozens of sites; any template
// fallback string would otherwise render identically on every domain (a
// cross-site duplicate-content footprint). Pages define pools of equally
// true, equally in-voice variants per copy slot; pick() hashes domain+slot
// so every site gets a stable site-specific combination with zero per-site
// config. Same domain+slot always yields the same pick across builds.
export function pick<T>(domain: string, slot: string, pool: readonly T[]): T {
  let h = 5381;
  const s = `${domain}:${slot}`;
  for (let i = 0; i < s.length; i++) {
    h = (((h << 5) + h) + s.charCodeAt(i)) >>> 0;
  }
  // Murmur3-style finalizer: the slot name sits at the tail of the string
  // where plain djb2 barely mixes, which correlated picks across slots and
  // let some site pairs collide on every slot at once.
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return pool[(h >>> 0) % pool.length];
}
