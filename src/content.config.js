import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blogCategorySlugs = ['kakutei-shinkoku', 'nematsu-chosei', 'shakai-hoken', 'zeikin-kiso', 'life-event', 'life', 'health', 'pet', 'tools'];

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.enum(blogCategorySlugs),
    tags: z.array(z.string()).default([]),
    author: z.string().default('計算ツール編集部'),
    reviewedDate: z.coerce.date().optional(),
    applicableYear: z.number().int().min(2025).max(2100).optional(),
    sources: z.array(z.object({ name: z.string(), url: z.string().url() })).default([]),
    relatedTools: z.array(z.string()).default([]),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    ogImage: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
