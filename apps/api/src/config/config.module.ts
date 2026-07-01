import { Global, Module, OnApplicationBootstrap } from '@nestjs/common';
import { validateEnvironment, type EnvConfig } from './env-validation.js';

export { type EnvConfig };

let cachedConfig: EnvConfig | null = null;

export function getConfig(): EnvConfig {
  if (!cachedConfig) {
    cachedConfig = validateEnvironment();
  }
  return cachedConfig;
}

@Global()
@Module({
  providers: [
    {
      provide: 'CONFIG',
      useFactory: () => getConfig(),
    },
  ],
  exports: ['CONFIG'],
})
export class ConfigModule implements OnApplicationBootstrap {
  onApplicationBootstrap() {
    getConfig();
  }
}
