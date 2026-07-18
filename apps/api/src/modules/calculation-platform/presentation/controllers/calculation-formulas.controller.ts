import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { CalculationValidationService } from '../../application/services/calculation-validation.service.js';

@ApiTags('Calculations - Formulas')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('calculations/formulas')
export class CalculationFormulasController {
  constructor(private readonly validation: CalculationValidationService) {}

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate a formula expression' })
  async validateFormula(@Body('expression') expression: string) {
    const result = await this.validation.validateFormula(expression);
    return { success: true, data: result };
  }

  @Post('detect-circular')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Detect circular dependencies in formulas' })
  async detectCircular(@Body('formulas') formulas: Array<{ name: string; expression: string }>) {
    const result = await this.validation.detectCircularDependencies(formulas);
    return { success: true, data: result };
  }
}
