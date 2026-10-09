const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../dist/app');
test('Contrato HTTP completo, validacion y errores', async () => {
  const app = await createApp();
  await app.listen(0, '127.0.0.1');
  const base = await app.getUrl();
  const call = (path = '/tasks', method = 'GET', body) => fetch(base + path, { method, headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' }, body: body === undefined ? undefined : JSON.stringify(body) });
  try {
    let r = await call(); assert.equal(r.status, 200); assert.deepEqual(await r.json(), []);
    assert.equal(r.headers.get('access-control-allow-origin'), 'http://localhost:5173');
    for (const body of [{}, { title: 7, description: '', completed: false }, { title: 'ab', description: '', completed: false }, { title: 'Valid', description: '', completed: 'false' }, { title: 'Valid', description: '', completed: false, extra: 1 }]) {
      r = await call('/tasks', 'POST', body); assert.equal(r.status, 400); const e = await r.json(); assert.equal(e.statusCode, 400); assert.ok(Array.isArray(e.message));
    }
    const data = { title: 'Primera tarea', description: 'Detalle', completed: false };
    r = await call('/tasks', 'POST', data); assert.equal(r.status, 201); const task = await r.json();
    r = await call('/tasks/' + task.id); assert.equal(r.status, 200); assert.deepEqual(await r.json(), task);
    r = await call('/tasks', 'POST', { ...data, title: ' PRIMERA TAREA ' }); assert.equal(r.status, 409); assert.ok(Array.isArray((await r.json()).message));
    r = await call('/tasks/' + task.id, 'PATCH', { completed: true }); assert.equal(r.status, 200); assert.equal((await r.json()).completed, true);
    r = await call('/tasks/' + task.id, 'PATCH', { title: null }); assert.equal(r.status, 400);
    r = await call('/tasks/' + task.id, 'PATCH', { unexpected: 1 }); assert.equal(r.status, 400);
    r = await call('/tasks', 'POST', { ...data, title: 'Segunda tarea' }); const second = await r.json();
    r = await call('/tasks/' + second.id, 'PATCH', { title: data.title }); assert.equal(r.status, 409);
    r = await call('/tasks/not-a-uuid'); assert.equal(r.status, 400);
    r = await call('/tasks/' + task.id, 'DELETE'); assert.equal(r.status, 204); assert.equal(await r.text(), '');
    for (const method of ['GET', 'PATCH', 'DELETE']) { r = await call('/tasks/' + task.id, method, method === 'PATCH' ? {} : undefined); assert.equal(r.status, 404); }
    r = await call('/docs-json'); assert.equal(r.status, 200); const spec = await r.json(); assert.ok(spec.paths['/tasks']); assert.ok(spec.paths['/tasks/{id}']);
  } finally { await app.close(); }
});
