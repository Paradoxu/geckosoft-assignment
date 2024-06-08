import { toMs } from 'ms-typescript';
import z from 'zod';

export const configSchema = z.object({
  PORT: z
    .string()
    .default('3000')
    .transform((v) => parseInt(v, 10)),
  MONGO_CONNECITON_URL: z.string(),
  STORAGE_PATH: z.string(),

  REDIS_CONNECTION_URL: z.string(),
  WORKER_MAX_COMPLETE_JOBS_ON_QUEUE: z
    .string()
    .transform((v) => parseInt(v, 10)),
  WORKER_MAX_FAILED_JOBS_ON_QUEUE: z.string().transform((v) => parseInt(v, 10)),
  WORKER_TIMEOUT: z.string().transform((v) => toMs(v)),
});

export type EnvConfig = z.infer<typeof configSchema>;
export const getConfig = () => process.env;
