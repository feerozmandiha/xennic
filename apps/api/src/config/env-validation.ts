import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  PORT: z.coerce.number().int().positive().max(65535).default(3000),
  HOST: z.string().default('0.0.0.0'),

  DATABASE_URL: z.string().url().refine(
    (val) => val.startsWith('postgresql://') || val.startsWith('postgres://'),
    { message: 'DATABASE_URL must be a PostgreSQL connection string' },
  ),

  JWT_PRIVATE_KEY_PATH: z.string().min(1),
  JWT_PUBLIC_KEY_PATH: z.string().min(1),
  JWT_ACCESS_TOKEN_TTL: z.coerce.number().int().positive().default(900),
  JWT_REFRESH_TOKEN_TTL: z.coerce.number().int().positive().default(2592000),
  JWT_ISSUER: z.string().min(1).default('xennic-platform'),
  JWT_AUDIENCE: z.string().min(1).default('xennic-client'),

  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().int().positive().max(65535).default(6379),
  REDIS_PASSWORD: z.string().optional(),

  CORS_ORIGINS: z.string().optional(),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().max(65535).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),

  MINIO_ENDPOINT: z.string().optional(),
  MINIO_PORT: z.coerce.number().int().positive().optional(),
  MINIO_ACCESS_KEY: z.string().optional(),
  MINIO_SECRET_KEY: z.string().optional(),
  MINIO_USE_SSL: z.string().optional(),

  RABBITMQ_HOST: z.string().optional(),
  RABBITMQ_PORT: z.coerce.number().int().positive().optional(),
  RABBITMQ_DEFAULT_USER: z.string().optional(),
  RABBITMQ_DEFAULT_PASS: z.string().optional(),

  GROQ_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),

  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().optional(),

  ENGINEERING_SERVICE_URL: z.string().url().optional(),
  AI_SERVICE_URL: z.string().url().optional(),
  VISION_SERVICE_URL: z.string().url().optional(),

  FRONTEND_URL: z.string().url().optional(),
  ZARINPAL_MERCHANT_ID: z.string().optional(),
  ZARINPAL_SANDBOX: z.string().optional(),

  ENCRYPTION_MASTER_KEY: z.string().optional(),
  SIGNED_URL_SECRET: z.string().optional(),
  BACKUP_STORAGE_PATH: z.string().optional().default('./backups'),
  BACKUP_RETENTION_DAYS: z.coerce.number().int().positive().default(90),
  CACHE_DEFAULT_TTL: z.coerce.number().int().positive().default(300),
  JOB_MAX_RETRIES: z.coerce.number().int().min(0).default(3),
  WORKER_CONCURRENCY: z.coerce.number().int().positive().default(4),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnvironment(): EnvConfig {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.issues.map(
      (issue) => `  ${issue.path.join('.')}: ${issue.message}`,
    );

    console.error('');
    console.error('═══════════════════════════════════════════');
    console.error('  INVALID ENVIRONMENT CONFIGURATION');
    console.error('  Application will not start.');
    console.error('═══════════════════════════════════════════');
    console.error('');
    console.error('Missing or invalid environment variables:');
    errors.forEach((e) => console.error(e));
    console.error('');

    process.exit(1);
  }

  return result.data;
}
