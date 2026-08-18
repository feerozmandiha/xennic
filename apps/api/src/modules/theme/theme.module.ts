import { Module } from '@nestjs/common';
import { ThemeController } from './presentation/controllers/theme.controller.js';
import { ThemeService } from './application/services/theme.service.js';
import { ThemeRepository } from './infrastructure/theme.repository.js';

@Module({
  controllers: [ThemeController],
  providers: [ThemeService, ThemeRepository],
  exports: [ThemeService],
})
export class ThemeModule {}
