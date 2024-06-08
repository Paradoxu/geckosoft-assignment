import z from 'zod';

const configSchema = z.object({
  PORT: z
    .string()
    .default('3000')
    .transform((value) => parseInt(value, 10)),
  MONGO_CONNECITON_URL: z.string(),
  STORAGE_PATH: z.string(),

  REDIS_CONNECTION_URL: z.string(),
});

export type EnvConfig = z.infer<typeof configSchema>;

export default () => configSchema.parse(process.env);
