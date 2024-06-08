import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { MediaEntity } from './media.entity';
import { FormDataRequest } from 'nestjs-form-data';
import { UploadMediaRequest } from './media.dto';

@Controller('media')
@ApiTags('Media')
@ApiBearerAuth()
export class MediaController {
  constructor(
    private mediaService: MediaService,
  ) { }

  @Get()
  list(): Promise<MediaEntity[]> {
    return this.mediaService.list();
  }

  @Post()
  @FormDataRequest()
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({ type: MediaEntity })
  upload(@Body() data: UploadMediaRequest) {
    return this.mediaService.upload(data);
  }
}
