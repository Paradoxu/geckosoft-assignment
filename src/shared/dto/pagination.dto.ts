
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginatedRequest {
  @Min(0)
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  skip: number = 0;

  @Min(1)
  @Max(1000)
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  limit: number = 20;
}
