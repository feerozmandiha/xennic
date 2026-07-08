module.exports = {
  apps: [
    {
      name: 'engineering-service',
      script: 'uvicorn',
      args: 'src.main:app --host 0.0.0.0 --port 8001 --reload',
      cwd: './workspace/services/engineering-service',
      interpreter: '/usr/bin/python3',
      env: {
        ENVIRONMENT: 'development',
        LOG_LEVEL: 'INFO',
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
    {
      name: 'vision-service',
      script: 'uvicorn',
      args: 'app.main:app --host 0.0.0.0 --port 8003 --reload',
      cwd: './workspace/services/vision-service',
      interpreter: '/usr/bin/python3',
      env: {
        SERVICE_PORT: '8003',
        OCR_ENGINE_MODE: 'hybrid',
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
    },
    {
      name: 'ai-service',
      script: 'uvicorn',
      args: 'app.main:app --host 0.0.0.0 --port 8002 --reload',
      cwd: './workspace/services/ai-service',
      interpreter: '/usr/bin/python3',
      env: {
        ENGINEERING_SERVICE_URL: 'http://localhost:8001',
        VISION_SERVICE_URL: 'http://localhost:8003',
        MISTRAL_API_KEY: process.env.MISTRAL_API_KEY ?? '',
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
    {
      name: 'main-api',
      script: '/usr/local/node24/bin/node',  // استفاده از node به جای bash
      args: [
        '/usr/local/node24/bin/pnpm',
        'run',
        'dev',
        '--filter',
        '@xennic/api'
      ],
      cwd: './',
      interpreter: 'none',  // مهم: از interpreter استفاده نکن
      env: {
        NODE_ENV: 'development',
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      kill_timeout: 5000,
      exp_backoff_restart_delay: 1000,
      restart_delay: 3000,
    },
    {
      name: 'web',
      script: '/usr/local/node24/bin/node',
      args: [
        '/usr/local/node24/bin/pnpm',
        'run',
        'dev',
        '--filter',
        '@xennic/web'
      ],
      cwd: './',
      interpreter: 'none',
      env: {
        NODE_ENV: 'development',
        NEXT_TELEMETRY_DISABLED: '1',
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      kill_timeout: 5000,
      exp_backoff_restart_delay: 1000,
      restart_delay: 3000,
    },
  ],
};
