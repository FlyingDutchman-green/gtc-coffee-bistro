import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site-config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;

  // Daftar rute statis website bistro lu
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0, // Halaman utama dapet prioritas tertinggi
    },
    {
      url: `${baseUrl}/admin/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3, // Rute admin diberi prioritas rendah untuk Google Index
    },
  ];

  return routes;
}