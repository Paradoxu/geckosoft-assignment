import { Process, Processor } from '@nestjs/bull';
import { mediaQueueJobs, mediaQueueName } from './media.utils';
import { MediaQueueResizeJob } from './media.dto';
import { Job } from 'bull';
import * as fs from 'fs/promises';
import * as path from 'path';
import { EnvConfig } from 'src/config/env';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import * as sharp from 'sharp';

@Processor(mediaQueueName)
export class MediaQueueConsumer {
  readonly logger = new Logger(MediaQueueConsumer.name);

  constructor(private configService: ConfigService<EnvConfig>) { }

  @Process(mediaQueueJobs.resize)
  async resize(job: Job<MediaQueueResizeJob>) {
    try {
      const log = (message: string) => {
        this.logger.log(`[${job.id}] - ${message}`);
        job.log(message);
      }
      const uploadPath = this.configService.getOrThrow('STORAGE_PATH');
      const { media, size } = job.data;
      const filePath = path.join(uploadPath, media.path);

      log(`Resizing image ${media.path} to ${size.width}x${size.height}`);

      const resizedFileBuffer = await sharp(filePath)
        .withMetadata()
        .resize(size.width, size.height)
        .toBuffer();

      await fs.writeFile(filePath, resizedFileBuffer);

      log(`Done`);
      return {};
    } catch (error) {
      this.logger.error(error, error?.stack);
      job.moveToFailed(error)
    }
  }
}
