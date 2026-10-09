import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateTaskDto, TaskDto, UpdateTaskDto } from './task.dto';

@Injectable()
export class TasksService {
  private readonly tasks = new Map<string, TaskDto>();

  findAll(): TaskDto[] { return [...this.tasks.values()]; }
  findOne(id: string): TaskDto {
    const task = this.tasks.get(id);
    if (!task) throw new NotFoundException('La tarea no existe');
    return task;
  }
  private checkTitle(title: string, exceptId?: string) {
    if (this.findAll().some(t => t.id !== exceptId && t.title.toLowerCase() === title.toLowerCase())) {
      throw new ConflictException('Ya existe una tarea con ese titulo');
    }
  }
  create(dto: CreateTaskDto): TaskDto {
    this.checkTitle(dto.title);
    const task = { ...dto, id: randomUUID() };
    this.tasks.set(task.id, task);
    return task;
  }
  update(id: string, dto: UpdateTaskDto): TaskDto {
    const current = this.findOne(id);
    if (dto.title !== undefined) this.checkTitle(dto.title, id);
    const task = { ...current, ...dto };
    this.tasks.set(id, task);
    return task;
  }
  remove(id: string): void { this.findOne(id); this.tasks.delete(id); }
}
