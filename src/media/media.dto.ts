import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { HasMimeType, IsFile, MemoryStoredFile } from 'nestjs-form-data';
import { PaginatedRequest } from 'src/shared/dto/pagination.dto';
import { MediaEntity } from './media.entity';
import { JobStatus } from 'bull';
import { jobStatus } from 'src/shared/enums/job-status.enum';

export class UploadMediaRequest {
  @IsFile()
  @HasMimeType(['image/*'])
  @ApiProperty({ type: String, format: 'binary', required: true })
  file: MemoryStoredFile;
}

export class GetMediaListRequest extends PartialType(PaginatedRequest) { }

export class GetMediaJobsRequest {
  @IsEnum(jobStatus, { each: true })
  @IsOptional()
  @ApiProperty({ type: [String], enum: jobStatus, default: Object.values(jobStatus) })
  status: JobStatus[] = Object.values(jobStatus);
}

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
};
