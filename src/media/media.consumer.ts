import { Process, Processor } from '@nestjs/bull';
import { mediaQueueJobs, mediaQueueName } from './media.utils';
import { MediaQueueResizeJob } from './media.dto';
import { Job } from 'bull';
import * as fs from 'fs/promises';
import * as path from 'path';

@Processor(mediaQueueName)
export class MediaQueueConsumer {
  @Process(mediaQueueJobs.resize)
  async resize(job: Job<MediaQueueResizeJob>) {
    console.log(job.data);
  }
}
