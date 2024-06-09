import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { MediaService } from './media.service';
import { MediaEntity } from './media.entity';
import { FormDataRequest } from 'nestjs-form-data';
import {
  GetMediaJobsRequest as GetQueuedJobsRequest,
  GetMediaListRequest,
  ResizeMediaRequest,
  UploadMediaRequest,
} from './media.dto';
import {
  ApiOkPaginated,
  PaginatedResponse,
} from 'src/shared/dto/paginated-response.dto';

@Controller('media')
@ApiTags('Media')
@ApiBearerAuth()
export class MediaController {
  constructor(private mediaService: MediaService) { }

  /**
   * Retrieve a paginated list of all media files.
   * @param query Query parameters for pagination.
   * @returns A promise that resolves to a paginated response of media entities.
   */
  @Get()
  @ApiOperation({ summary: 'Retrieves a list of all media files' })
  @ApiOkPaginated(MediaEntity)
  async list(
    @Query() query: GetMediaListRequest,
  ): Promise<PaginatedResponse<MediaEntity>> {
    const [total, data] = await Promise.all([
      this.mediaService.countDocuments(),
      this.mediaService.list(query),
    ]);

    return new PaginatedResponse(data, total);
  }

  /**
   * Retrieve a list of queued media resize jobs.
   * @param query Query parameters for filtering queued jobs.
   * @returns A promise that resolves to a list of queued media resize jobs.
   */
  @Get('queued-jobs')
  @ApiOperation({
    summary: 'A debugger endpoint to fetch the current jobs queue state',
  })
  async workersList(@Query() query: GetQueuedJobsRequest): Promise<unknown> {
    return this.mediaService.queuedJobs(query);
  }

  /**
   * Upload a new media file.
   * @param data Object containing the uploaded file.
   * @returns A promise that resolves to the uploaded media entity.
   */
  @Post()
  @FormDataRequest()
  @ApiOperation({ summary: 'Upload a new media file' })
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({ type: MediaEntity })
  upload(@Body() data: UploadMediaRequest) {
    return this.mediaService.upload(data);
  }

  /**
   * Resize a media file.
   * @param id The ID of the media entity to resize.
   * @param data Object containing the resize parameters.
   * @returns A promise that resolves to the ID of the resize job.
   */
  @Patch('resize/:id')
  @ApiOperation({ summary: 'Resizes the image file with the given ID' })
  resize(
    @Param('id') id: string,
    @Body() data: ResizeMediaRequest,
  ): Promise<string> {
    return this.mediaService.resize(id, data);
  }

  /**
   * Delete a media entity.
   * @param id The ID of the media entity to delete.
   * @returns A promise that resolves when the media entity is successfully deleted.
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Deletes the entry with the given id' })
  delete(@Param('id') id: string): Promise<void> {
    return this.mediaService.delete(id);
  }
}
