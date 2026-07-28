import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site-config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/', // Melarang Google Bot masuk ke halaman login/dashboard admin lu
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}