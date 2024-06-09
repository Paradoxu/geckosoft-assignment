import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MediaEntity } from './media.entity';
import { Model } from 'mongoose';
import {
  GetMediaJobsRequest,
  GetMediaListRequest,
  MediaQueueResizeJob,
  ResizeMediaRequest,
  UploadMediaRequest,
} from './media.dto';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from 'src/config/env';
import * as path from 'path';
import * as fs from 'fs/promises';
import { nanoid } from 'nanoid';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { mediaQueueJobs, mediaQueueName } from './media.utils';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    @InjectModel(MediaEntity.name) private mediaModel: Model<MediaEntity>,
    @InjectQueue(mediaQueueName) private mediaQueue: Queue<MediaQueueResizeJob>,
    private configService: ConfigService<EnvConfig>,
  ) { }

  /**
   * Retrieve a media entity by its ID.
   * @param id The ID of the media entity to retrieve.
   * @returns A promise that resolves to the retrieved media entity.
   * @throws NotFoundException if the media entity is not found.
   */
  get(id: string): Promise<MediaEntity> {
    return this.mediaModel
      .findById(id)
      .orFail(() => new NotFoundException())
      .lean()
      .exec();
  }

  /**
   * Count the total number of media documents.
   * @returns A promise that resolves to the total count of media documents.
   */
  countDocuments(): Promise<number> {
    return this.mediaModel.countDocuments();
  }

  /**
   * Retrieve a list of media entities with optional pagination.
   * @param param0 Object containing skip and limit for pagination.
   * @returns A promise that resolves to an array of media entities.
   */
  list({ skip, limit }: GetMediaListRequest): Promise<MediaEntity[]> {
    return this.mediaModel
      .find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  /**
   * Upload a new media file.
   * @param param0 Object containing the file to be uploaded.
   * @returns A promise that resolves to the uploaded media entity.
   */
  async upload({ file }: UploadMediaRequest): Promise<MediaEntity> {
    const extName = path.extname(file.originalName);
    const newFileName = `${nanoid()}${extName}`;
    const uploadPath = this.configService.getOrThrow('STORAGE_PATH');
    const model = new this.mediaModel({
      path: newFileName,
      name: file.originalName,
      filesize: file.size,
    });

    await fs.writeFile(path.join(uploadPath, newFileName), file.buffer);
    await model.save();

    return model.toObject();
  }

  /**
   * Resize a media file asynchronously.
   * @param id The ID of the media entity to resize.
   * @param size The desired size for the resized media.
   * @returns A promise that resolves to the ID of the resize job.
   */
  async resize(id: string, size: ResizeMediaRequest): Promise<string> {
    const media = await this.get(id);
    const job = await this.mediaQueue.add(mediaQueueJobs.resize, {
      size,
      media,
    });
    return job.id.toString();
  }

  /**
   * Delete a media entity by its ID.
   * @param id The ID of the media entity to delete.
   * @returns A promise that resolves when the media entity is successfully deleted.
   * @throws NotFoundException if the media entity is not found.
   */
  async delete(id: string): Promise<void> {
    const uploadPath = this.configService.getOrThrow('STORAGE_PATH');

    // Deletes from the database first
    const media = await this.mediaModel
      .findByIdAndDelete(id)
      .orFail(() => new NotFoundException())
      .exec();

    // Only then deletes the media from the filesystem
    await fs
      .unlink(path.join(uploadPath, media.path))
      .catch((e) => this.logger.error(e));
  }

  /**
   * Retrieve a list of queued media resize jobs.
   * @param param0 Object containing the status of the jobs to retrieve.
   * @returns A promise that resolves to an array of queued media resize jobs.
   */
  async queuedJobs({ status }: GetMediaJobsRequest): Promise<unknown> {
    const jobs = await this.mediaQueue.getJobs(status);
    jobs.sort((a, b) => parseInt(b.id.toString()) - parseInt(a.id.toString()));
    return jobs;
  }
}
