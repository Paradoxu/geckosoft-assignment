import { ApiProperty, } from '@nestjs/swagger';
import { HasMimeType, IsFile, MemoryStoredFile } from 'nestjs-form-data';

export class UploadMediaRequest {
  @IsFile()
  @HasMimeType(['image/*'])
  @ApiProperty({ type: String, format: 'binary', required: true })
  file: MemoryStoredFile;
}
