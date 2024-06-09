import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for paginated requests.
 * Used to specify pagination parameters like skip and limit.
 */
export class PaginatedRequest {
  /**
   * The number of items to skip in the pagination.
   * @minimum 0
   * @type number
   * @optional
   */
  @Min(0)
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  skip: number = 0;

  /**
   * The maximum number of items to include in a single page of results.
   * @minimum 1
   * @maximum 1000
   * @type number
   * @optional
   */
  @Min(1)
  @Max(1000)
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  limit: number = 20;
}
