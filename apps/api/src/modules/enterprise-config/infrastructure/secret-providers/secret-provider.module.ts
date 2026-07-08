import { Module, Global } from '@nestjs/common';
import { I_SECRET_PROVIDER } from '../../domain/interfaces/secret-provider.interface.js';
import { EnvSecretProvider } from './env-secret-provider.js';

@Global()
@Module({
  providers: [
    { provide: I_SECRET_PROVIDER, useClass: EnvSecretProvider },
  ],
  exports: [I_SECRET_PROVIDER],
})
export class SecretProviderModule {}
