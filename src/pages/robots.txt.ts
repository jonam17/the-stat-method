import type { APIRoute } from 'astro';
import { SITE } from '../site.config.js';

export const GET: APIRoute = ({ site }) => {
  const origin = (site?.origin || SITE.url).replace(/\/$/, '');
  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${origin}/sitemap-index.xml`,
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
