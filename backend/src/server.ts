import { createApp } from './app.js';
import { createPool } from './db/pool.js';
import { PgTaskRepository } from './repositories/pgTaskRepository.js';
import { SessionTaskRepository } from './repositories/sessionTaskRepository.js';

const PORT = Number(process.env.PORT ?? 3000);
const isDemo = !process.env.DATABASE_URL;

const repository = isDemo ? new SessionTaskRepository() : new PgTaskRepository(createPool());

createApp(repository, { demoSessions: isDemo }).listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
