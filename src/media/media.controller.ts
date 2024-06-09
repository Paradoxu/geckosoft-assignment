import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { MediaEntity } from './media.entity';
import { FormDataRequest } from 'nestjs-form-data';
import { GetMediaJobsRequest as GetQueuedJobsRequest, GetMediaListRequest, ResizeMediaRequest, UploadMediaRequest } from './media.dto';
import { ApiOkPaginated, PaginatedResponse } from 'src/shared/dto/paginated-response.dto';

@Controller('media')
@ApiTags('Media')
@ApiBearerAuth()
export class MediaController {
  constructor(
    private mediaService: MediaService,
  ) { }

  @Get()
  @ApiOperation({ summary: 'Retrieves a list of all media files' })
  @ApiOkPaginated(MediaEntity)
  async list(@Query() query: GetMediaListRequest): Promise<PaginatedResponse<MediaEntity>> {
    const [total, data] = await Promise.all([
      this.mediaService.countDocuments(),
      this.mediaService.list(query),
    ]);

    return new PaginatedResponse(data, total);
  }

  @Get('queued-jobs')
  @ApiOperation({ summary: 'A debugger endpoint to fetch the current jobs queue state' })
  async workersList(@Query() query: GetQueuedJobsRequest): Promise<unknown> {
    return this.mediaService.queuedJobs(query);
  }

  @Post()
  @FormDataRequest()
  @ApiOperation({ summary: 'Upload a new media file' })
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({ type: MediaEntity })
  upload(@Body() data: UploadMediaRequest) {
    return this.mediaService.upload(data);
  }

  @Patch('resize/:id')
  @ApiOperation({ summary: 'Resizes the image file with the given ID' })
  resize(@Param('id') id: string, @Body() data: ResizeMediaRequest): Promise<string> {
    return this.mediaService.resize(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletes the entry with the given id' })
  delete(@Param('id') id: string): Promise<void> {
    return this.mediaService.delete(id);
  }
}
