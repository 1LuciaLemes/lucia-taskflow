import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { SessionTaskRepository } from '../repositories/sessionTaskRepository.js';

function setup() {
  return createApp(new SessionTaskRepository(), { demoSessions: true });
}

describe('demoSession', () => {
  it('aísla las tareas entre distintas sesiones', async () => {
    const app = setup();

    await request(app).post('/tasks').set('x-demo-session', 'a').send({ title: 'De A' });
    const tasksB = await request(app).get('/tasks').set('x-demo-session', 'b');

    expect(tasksB.body).toHaveLength(0);
  });

  it('mantiene las tareas dentro de la misma sesión', async () => {
    const app = setup();

    await request(app).post('/tasks').set('x-demo-session', 'a').send({ title: 'De A' });
    const tasksA = await request(app).get('/tasks').set('x-demo-session', 'a');

    expect(tasksA.body).toHaveLength(1);
    expect(tasksA.body[0].title).toBe('De A');
  });

  it('comparte un tablero por defecto cuando no hay header', async () => {
    const app = setup();

    await request(app).post('/tasks').send({ title: 'Sin sesión' });
    const tasks = await request(app).get('/tasks');

    expect(tasks.body).toHaveLength(1);
  });

  it('no filtra tareas entre el tablero por defecto y una sesión', async () => {
    const app = setup();

    await request(app).post('/tasks').send({ title: 'Anónima' });
    const tasksA = await request(app).get('/tasks').set('x-demo-session', 'a');

    expect(tasksA.body).toHaveLength(0);
  });
});
