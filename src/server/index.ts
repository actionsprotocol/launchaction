import dotenv from 'dotenv';
import cors from '@fastify/cors';
import fastify from 'fastify';
import { performSearchMentionsJob } from './jobs';
import { setupWorkers } from './workers';

dotenv.config();

const app = fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  },
});

const setupServer = async () => {
  await app.register(cors);
};

app.get('/health', async () => ({ status: 'ok' }));

const start = async () => {
  console.log('Starting...');

  await setupServer();
  await app.listen({ port: 3003, host: '0.0.0.0' });
  console.log('Server running at http://localhost:3003');

  const userId = process.env.TWITTER_USER_ID;
  if (!userId) {
    throw new Error('TWITTER_USER_ID is required');
  }

  await setupWorkers(userId);

  console.log('Workers started successfully');
}

start();