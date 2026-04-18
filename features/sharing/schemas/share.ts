import { z } from 'zod/v4';

export const accessShareWithPasswordSchema = z.object({
    password: z.string().min(1, 'Password is required'),
});
