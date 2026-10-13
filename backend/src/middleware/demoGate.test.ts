import { afterEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { InMemoryTaskRepository } from '../repositories/inMemoryTaskRepository.js';

const originalKey = process.env.DEMO_API_KEY;

function setup() {
  return createApp(new InMemoryTaskRepository());
}

afterEach(() => {
  if (originalKey === undefined) {
    delete process.env.DEMO_API_KEY;
  } else {
    process.env.DEMO_API_KEY = originalKey;
  }
});

describe('demoGate', () => {
  it('permite escribir sin clave cuando no hay DEMO_API_KEY', async () => {
    delete process.env.DEMO_API_KEY;
    const app = setup();

    const res = await request(app).post('/tasks').send({ title: 'Task' });

    expect(res.status).toBe(201);
  });

  it('rechaza escrituras sin clave cuando DEMO_API_KEY está definida', async () => {
    process.env.DEMO_API_KEY = 'secreta';
    const app = setup();

    const res = await request(app).post('/tasks').send({ title: 'Task' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('UNAUTHORIZED');
  });

  it('acepta escrituras con la clave en el header x-api-key', async () => {
    process.env.DEMO_API_KEY = 'secreta';
    const app = setup();

    const res = await request(app)
      .post('/tasks')
      .set('x-api-key', 'secreta')
      .send({ title: 'Task' });

    expect(res.status).toBe(201);
  });

  it('rechaza escrituras con una clave incorrecta', async () => {
    process.env.DEMO_API_KEY = 'secreta';
    const app = setup();

    const res = await request(app)
      .post('/tasks')
      .set('x-api-key', 'incorrecta')
      .send({ title: 'Task' });

    expect(res.status).toBe(401);
  });

  it('deja pasar las lecturas aunque DEMO_API_KEY esté definida', async () => {
    process.env.DEMO_API_KEY = 'secreta';
    const app = setup();

    const res = await request(app).get('/tasks');

    expect(res.status).toBe(200);
  });
});
