import { existsSync } from 'node:fs';
import type { SiteConfig } from './types';

/** Reuse approved artwork with a transparent canvas and a fresh asset URL. */
export function siteLogoSrc(site: SiteConfig): string {
  const name = site.media?.logo;
  if (!name) return '/assets/img/logo.png';
  if (name.endsWith('.svg')) return `/assets/img/logos/${name}`;
  const transparent = `/assets/brand-media/${site.domain}-transparent-v1.png`;
  if (!existsSync(`public${transparent}`)) {
    throw new Error(`Missing approved transparent logo for ${site.domain}: ${transparent}`);
  }
  return transparent;
}

/** Refresh sharing-card URLs when their logo input changes; keep the card design. */
export function siteOgImage(site: SiteConfig): string {
  return site.ogImage.replace(/\/og-default\.png(?=$|[?#])/, '/og-transparent-20261014.png');
}
