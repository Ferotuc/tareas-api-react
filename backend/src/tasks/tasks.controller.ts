import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CreateTaskDto, ErrorDto, TaskDto, UpdateTaskDto } from './task.dto';
import { TasksService } from './tasks.service';

@ApiTags('tareas')
@ApiBadRequestResponse({ type: ErrorDto, description: 'Datos invalidos o propiedades desconocidas' })
@Controller('tasks')
export class TasksController {
  constructor(private readonly service: TasksService) {}
  @Get()
  @ApiOkResponse({ type: [TaskDto] })
  all() { return this.service.findAll(); }

  @Get(':id')
  @ApiOkResponse({ type: TaskDto })
  @ApiNotFoundResponse({ type: ErrorDto })
  one(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) { return this.service.findOne(id); }

  @Post()
  @ApiCreatedResponse({ type: TaskDto })
  @ApiConflictResponse({ type: ErrorDto })
  create(@Body() dto: CreateTaskDto) { return this.service.create(dto); }

  @Patch(':id')
  @ApiOkResponse({ type: TaskDto })
  @ApiNotFoundResponse({ type: ErrorDto })
  @ApiConflictResponse({ type: ErrorDto })
  update(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() dto: UpdateTaskDto) { return this.service.update(id, dto); }

  @Delete(':id')
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'Eliminada; sin cuerpo de respuesta' })
  @ApiNotFoundResponse({ type: ErrorDto })
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) { this.service.remove(id); }
}
