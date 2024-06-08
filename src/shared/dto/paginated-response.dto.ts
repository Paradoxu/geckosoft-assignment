
import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

export class PaginatedResponse<T> {
  constructor(public data: T[], public total: number) { }
}

/**
 * Since there are no easy way to set a paginated response dto for swagger with decorators
 * this decorator helper will set the proper types on the swagger schema for the decorated method
 */
export const ApiOkPaginated = <DataDto extends Type<unknown>>(dataDto: DataDto) =>
  applyDecorators(
    ApiExtraModels(PaginatedResponse, dataDto),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginatedResponse) },
          {
            properties: {
              total: {
                type: 'number',
              },
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(dataDto) },
              },
            },
          },
        ],
      },
    })
  );
