# API HTTP validada con cliente React

## Ejecutar

Requiere Node.js 22.12 o superior y npm. Desde esta carpeta:

```sh
npm install
npm run dev:api
```

En otra terminal, desde la misma carpeta:

```sh
npm run dev:web
```

Frontend: http://localhost:5173 (usar este origen exacto).
Backend: http://localhost:3000/tasks.
Swagger interactivo: http://localhost:3000/docs.
Contrato OpenAPI JSON: http://localhost:3000/docs-json.

El backend compila antes de iniciar. Para aplicar cambios de codigo, reiniciarlo.

## Arquitectura

TasksModule agrupa controlador, servicio y DTO. El controlador define rutas y delega; el servicio mantiene un Map en memoria y aplica unicidad; los DTO declaran validacion y esquemas OpenAPI. Al reiniciar se pierden los datos. No hay base de datos ni autenticacion.

ValidationPipe global usa whitelist, forbidNonWhitelisted y transform. El titulo se recorta; no se convierten cadenas en booleanos. El filtro global normaliza las excepciones HTTP estandar, sin @Res() en controladores. No hay rutas que provoquen errores 500.

React consume el contrato mediante tipos Task y TaskInput y un cliente fetch centralizado. Solo incorpora recursos devueltos por POST/PATCH y elimina tras recibir 204. Los tipos del cliente corresponden al contrato documentado; no se generan automaticamente desde OpenAPI.

## Contrato

| Metodo y ruta | Exito | Errores |
| --- | --- | --- |
| GET /tasks | 200, arreglo (incluso vacio) | - |
| GET /tasks/:id | 200, recurso | 400 UUID invalido; 404 inexistente |
| POST /tasks | 201, recurso creado | 400 datos invalidos; 409 titulo duplicado |
| PATCH /tasks/:id | 200, recurso actualizado | 400 datos invalidos; 404 inexistente; 409 duplicado |
| DELETE /tasks/:id | 204, sin cuerpo | 400 UUID invalido; 404 inexistente |

POST requiere title (string de 3 a 80 caracteres despues de recortar espacios), description (string de 0 a 300) y completed (boolean). id es UUID v4 generado por el servidor. Los titulos son unicos sin distinguir mayusculas. PATCH permite cualquier subconjunto de los tres campos; {} es una operacion sin cambios. null y propiedades desconocidas se rechazan. No se implementa PUT.

Los errores HTTP tienen esta forma:

```json
{"statusCode":409,"error":"Conflict","message":["Ya existe una tarea con ese titulo"]}
```

CORS permite exactamente http://localhost:5173. CORS es una politica del navegador, no autenticacion ni una restriccion de acceso para clientes como curl.

## Demostracion

1. Abrir React y observar la coleccion vacia (200).
2. Crear una tarea y observar el recurso confirmado (201).
3. Crear otra con el mismo titulo: mostrar 409 y que la lista conserva sus datos.
4. Editar una tarea y marcarla completada (PATCH 200).
5. Desde Swagger ejecutar POST con titulo de dos caracteres, completed como texto o una propiedad extra (400).
6. Consultar un UUID v4 inexistente, por ejemplo 00000000-0000-4000-8000-000000000000 (404).
7. Eliminar desde React (204) y consultar su id desde Swagger (404).
8. Detener el backend y recargar React para mostrar el estado de error de conexion; iniciarlo nuevamente y recargar.

## Verificacion

```sh
npm run build
npm test
```

La prueba levanta Nest en un puerto efimero y verifica CRUD, los seis codigos requeridos, errores consistentes, propiedades desconocidas, null, tipos, unicidad, CORS y publicacion de OpenAPI. No se fabrican errores internos.

Referencias: https://docs.nestjs.com/application/validation y https://docs.nestjs.com/openapi/introduction.
