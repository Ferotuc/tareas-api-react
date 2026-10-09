import 'reflect-metadata';
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Module, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TasksModule } from './tasks/tasks.module';

@Catch(HttpException)
class HttpErrorFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const statusCode = exception.getStatus();
    const body = exception.getResponse();
    const data = typeof body === 'string' ? { message: body, error: exception.name } : body as { message?: string | string[]; error?: string };
    host.switchToHttp().getResponse().status(statusCode).json({
      statusCode, error: data.error ?? exception.name,
      message: Array.isArray(data.message) ? data.message : [data.message ?? exception.message],
    });
  }
}
@Module({ imports: [TasksModule] })
class AppModule {}
export async function createApp() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: 'http://localhost:5173', methods: ['GET', 'POST', 'PATCH', 'DELETE'] });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalFilters(new HttpErrorFilter());
  const config = new DocumentBuilder().setTitle('API de tareas').setDescription('CRUD en memoria. Titulos unicos sin distinguir mayusculas. PATCH parcial; {} no cambia el recurso.').setVersion('1.0').build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));
  return app;
}
