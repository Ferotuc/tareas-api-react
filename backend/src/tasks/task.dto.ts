import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsString, Length } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ minLength: 3, maxLength: 80, example: 'Preparar la demostracion' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @Length(3, 80)
  title!: string;

  @ApiProperty({ maxLength: 300, example: 'Revisar los endpoints en Swagger' })
  @IsString()
  @Length(0, 300)
  description!: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  completed!: boolean;
}

export class UpdateTaskDto extends PartialType(CreateTaskDto, { skipNullProperties: false }) {}

export class TaskDto extends CreateTaskDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;
}

export class ErrorDto {
  @ApiProperty({ example: 400 })
  statusCode!: number;
  @ApiProperty({ example: 'Bad Request' })
  error!: string;
  @ApiProperty({ type: [String], example: ['title must be longer than or equal to 3 characters'] })
  message!: string[];
}
