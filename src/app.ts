import { Database } from './models/database';
import { AppServer } from './server';

const PORT = process.env.PORT || 8080;

async function initServer(database = new Database()) {
  const db = await database.connect();
  const server = new AppServer(db);
  server.configureRoutes();
  await server.initDbData('./fixtures/prod.json');
  server.start(PORT);
}

initServer();
