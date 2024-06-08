import { ApiProperty, PartialType, } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';
import { HasMimeType, IsFile, MemoryStoredFile } from 'nestjs-form-data';
import { PaginatedRequest } from 'src/shared/dto/pagination.dto';
import { MediaEntity } from './media.entity';

export class UploadMediaRequest {
  @IsFile()
  @HasMimeType(['image/*'])
  @ApiProperty({ type: String, format: 'binary', required: true })
  file: MemoryStoredFile;
}

export class GetMediaListRequest extends PartialType(PaginatedRequest) { }

export class ResizeMediaRequest {
  @IsNumber()
  @Min(0)
  width: number;

  @IsNumber()
  @Min(0)
  height: number;
}

export type MediaQueueResizeJob = {
  media: MediaEntity;
  size: ResizeMediaRequest;
}
