
export const jobStatus = {
  completed: 'completed',
  waiting: 'waiting',
  active: 'active',
  delayed: 'delayed',
  failed: 'failed',
  paused: 'paused',
} as const;

export type JobStatus = keyof typeof jobStatus;
