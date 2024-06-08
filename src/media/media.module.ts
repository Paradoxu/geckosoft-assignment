import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaEntity, MediaSchema } from './media.entity';
import { MediaController } from './media.controller';
import { BullModule } from '@nestjs/bull';
import { mediaQueueName } from './media.utils';
import { MediaQueueConsumer } from './media.consumer';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MediaEntity.name, schema: MediaSchema }
    ]),
    BullModule.registerQueue({
      name: mediaQueueName,
    })
  ],
  providers: [
    MediaService,
    MediaQueueConsumer
  ],
  controllers: [MediaController],
})
export class MediaModule { }
