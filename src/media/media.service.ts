import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MediaEntity } from './media.entity';
import { Model } from 'mongoose';
import { UploadMediaRequest } from './media.dto';

@Injectable()
export class MediaService {
  constructor(
    @InjectModel(MediaEntity.name) private mediaModel: Model<MediaEntity>
  ) { }

  list(): Promise<MediaEntity[]> {
    return this.mediaModel
      .find()
      .lean()
      .exec();
  }

  upload({ file }: UploadMediaRequest): Promise<MediaEntity> {

  }
}
