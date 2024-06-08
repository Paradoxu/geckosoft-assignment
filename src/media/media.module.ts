import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaEntity, MediaSchema } from './media.entity';
import { MediaController } from './media.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MediaEntity.name, schema: MediaSchema }
    ])
  ],
  providers: [MediaService],
  controllers: [MediaController],
})
export class MediaModule { }
