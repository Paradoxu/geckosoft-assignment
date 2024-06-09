import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { HasMimeType, IsFile, MemoryStoredFile } from 'nestjs-form-data';
import { PaginatedRequest } from 'src/shared/dto/pagination.dto';
import { MediaEntity } from './media.entity';
import { JobStatus } from 'bull';
import { jobStatus } from 'src/shared/enums/job-status.enum';

/**
 * DTO for uploading a new media file.
 */
export class UploadMediaRequest {
  @IsFile()
  @HasMimeType(['image/*'])
  @ApiProperty({ type: String, format: 'binary', required: true })
  file: MemoryStoredFile;
}

/**
 * DTO for retrieving a list of media entities.
 */
export class GetMediaListRequest extends PartialType(PaginatedRequest) { }

/**
 * DTO for retrieving queued media resize jobs.
 */
export class GetMediaJobsRequest {
  @IsEnum(jobStatus, { each: true })
  @IsOptional()
  @ApiProperty({
    type: [String],
    enum: jobStatus,
    default: Object.values(jobStatus),
  })
  status: JobStatus[] = Object.values(jobStatus);
}

/**
 * DTO for resizing a media file.
 */
export class ResizeMediaRequest {
  @IsNumber()
  @Min(0)
  @ApiProperty({ type: Number, minimum: 0 })
  width: number;

  @IsNumber()
  @Min(0)
  @ApiProperty({ type: Number, minimum: 0 })
  height: number;
}

/**
 * Type definition for a media queue resize job.
 */
export type MediaQueueResizeJob = {
  media: MediaEntity;
  size: ResizeMediaRequest;
};
