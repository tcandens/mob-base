import * as z from 'zod';

const envSchema = z.object({
	NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
	SERVER_PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.coerce.string().default('data/db.sqlite'),
});

export const env = envSchema.parse(process.env);
export default env;
