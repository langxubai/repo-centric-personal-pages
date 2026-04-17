// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), mdx()],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
    shikiConfig: {
      theme: 'github-dark-dimmed',
      langs: [],
    },
  },
  // For GitHub Pages: set base to your repo name if not a user/org site
  // e.g., base: '/repo-centric-personal-pages'
  // Leave as '/' if deploying to username.github.io
  base: '/',
  output: 'static',
});