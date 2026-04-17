import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Astro v5+ Content Layer API with glob loader
const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
  schema: z.object({
    // Common fields
    title: z.string(),
    date: z.coerce.date(),
    visibility: z.enum(['public', 'private']).default('public'),

    // Index-only fields
    description: z.string().optional(),
    status: z
      .enum(['active', 'completed', 'archived', 'paused', 'draft', 'in-progress', 'verified', 'failed'])
      .optional(),
    tags: z.array(z.string()).default([]),
    links: z
      .object({
        github: z.string().optional(),
        paper: z.string().optional(),
        demo: z.string().optional(),
      })
      .optional(),

    // Node-only fields
    id: z.string().optional(),
    type: z.enum(['math', 'code', 'logic', 'bugfix']).optional(),
    parents: z.array(z.string()).default([]),

    // Commit-only fields
    summary: z.string().optional(),
  }),
});

export const collections = { projects };
