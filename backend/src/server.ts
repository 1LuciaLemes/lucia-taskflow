import { createApp } from './app.js';
import { createPool } from './db/pool.js';
import { InMemoryTaskRepository } from './repositories/inMemoryTaskRepository.js';
import { PgTaskRepository } from './repositories/pgTaskRepository.js';
import { TaskService } from './services/taskService.js';
import { seedDemoData } from './seed.js';

const PORT = Number(process.env.PORT ?? 3000);

async function start() {
  const repository = process.env.DATABASE_URL
    ? new PgTaskRepository(createPool())
    : new InMemoryTaskRepository();

  if (!process.env.DATABASE_URL) {
    await seedDemoData(new TaskService(repository));
  }

  createApp(repository).listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
  });
}

void start();
