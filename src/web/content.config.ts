import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema(),
  }),
  blog: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/web/content/blog' }),
    schema: z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
      audio: z.string().url().optional(),
    }),
  }),
  faq: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/web/content/faq' }),
    schema: z.object({
      question: z.string(),
      description: z.string(),
      category: z.string(),
      order: z.number().default(0),
    }),
  }),
  providers: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/web/content/providers' }),
    schema: z.object({
      title: z.string(),
      description: z.string(),
      provider: z.string(),
      tagline: z.string(),
      setupCommand: z.string(),
      useCases: z.array(z.string()),
      pricing: z.string(),
      order: z.number().default(0),
    }),
  }),
  glossary: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/web/content/glossary' }),
    schema: z.object({
      title: z.string(),
      description: z.string(),
      term: z.string(),
      category: z.string(),
      related: z.array(z.string()).default([]),
    }),
  }),
  comparisons: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/web/content/comparisons' }),
    schema: z.object({
      title: z.string(),
      description: z.string(),
      toolA: z.string(),
      toolB: z.string(),
      toolAUrl: z.string(),
      toolBUrl: z.string(),
      verdict: z.string(),
      toolAPros: z.array(z.string()),
      toolBPros: z.array(z.string()),
      toolACons: z.array(z.string()),
      toolBCons: z.array(z.string()),
      useToolAWhen: z.string(),
      useToolBWhen: z.string(),
      order: z.number().default(0),
    }),
  }),
  guides: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/web/content/guides' }),
    schema: z.object({
      title: z.string(),
      description: z.string(),
      difficulty: z.string(),
      timeRequired: z.string(),
      prerequisites: z.array(z.string()),
      relatedProviders: z.array(z.string()),
      order: z.number().default(0),
    }),
  }),
};
