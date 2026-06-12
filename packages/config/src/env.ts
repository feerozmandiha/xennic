export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',

  postgres: {
    host: process.env.POSTGRES_HOST ?? 'localhost',
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    database: process.env.POSTGRES_DB ?? 'xennic',
    user: process.env.POSTGRES_USER ?? 'xennic',
    password: process.env.POSTGRES_PASSWORD ?? '',
  },

  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: Number(process.env.REDIS_PORT ?? 6379),
    password: process.env.REDIS_PASSWORD ?? '',
  },

  rabbitmq: {
    host: process.env.RABBITMQ_HOST ?? 'localhost',
    port: Number(process.env.RABBITMQ_PORT ?? 5672),
    user: process.env.RABBITMQ_DEFAULT_USER ?? '',
    password: process.env.RABBITMQ_DEFAULT_PASS ?? '',
  },
};