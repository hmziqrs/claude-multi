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
  alternatives: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/web/content/alternatives' }),
    schema: z.object({
      title: z.string(),
      description: z.string(),
      tool: z.string(),
      url: z.string().url(),
      strengths: z.array(z.string()),
      weaknesses: z.array(z.string()),
      useWhen: z.string(),
      order: z.number().default(0),
    }),
  }),
  personas: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/web/content/personas' }),
    schema: z.object({
      title: z.string(),
      description: z.string(),
      slug: z.string(),
      audience: z.string(),
      painPoints: z.array(z.string()),
      benefits: z.array(z.string()),
      recommendedProviders: z.array(z.string()),
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
  usecases: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/web/content/usecases' }),
    schema: z.object({
      title: z.string(),
      description: z.string(),
      slug: z.string(),
      persona: z.string(),
      painPoint: z.string(),
      solution: z.string(),
      steps: z
        .array(
          z.object({
            title: z.string(),
            code: z.string(),
          }),
        )
        .default([]),
      providers: z.array(z.string()).default([]),
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
};
