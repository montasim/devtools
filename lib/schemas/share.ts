import { z } from 'zod/v4';

export const createShareSchema = z.object({
    pageName: z.string().min(1),
    tabName: z.string().min(1),
    title: z.string().min(1).max(200),
    comment: z.string().max(1000).optional(),
    expiresAt: z.string().datetime().nullable().optional(),
    password: z.string().min(4).max(100).optional(),
    state: z.record(z.string(), z.unknown()),
});

export const accessShareSchema = z.object({
    password: z.string().optional(),
});

export const shareQuerySchema = z.object({
    pageName: z.string().optional(),
});
