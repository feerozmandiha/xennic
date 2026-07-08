import { Controller, Get, Post, Param, Query, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { UnitConversionService } from '../../application/services/unit-conversion.service.js';

@ApiTags('Calculations - Units')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('calculations/units')
export class CalculationUnitsController {
  constructor(
    private readonly unitService: UnitConversionService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all units' })
  async getAllUnits() {
    const units = await this.unitService.getAllUnits();
    return { success: true, data: units };
  }

  @Get('categories')
  @ApiOperation({ summary: 'List unit categories' })
  async getCategories() {
    return { success: true, data: this.unitService.getCategories() };
  }

  @Get('categories/:category')
  @ApiOperation({ summary: 'Get units by category' })
  async getByCategory(@Param('category') category: string) {
    const units = await this.unitService.getUnitsByCategory(category);
    return { success: true, data: units };
  }

  @Post('convert')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Convert value between units' })
  async convert(@Body() body: { value: number; fromUnit: string; toUnit: string }) {
    const result = await this.unitService.convert(body.value, body.fromUnit, body.toUnit);
    return { success: true, data: result };
  }

  @Get('can-convert')
  @ApiOperation({ summary: 'Check if conversion is possible' })
  @ApiQuery({ name: 'from', required: true })
  @ApiQuery({ name: 'to', required: true })
  async canConvert(@Query('from') from: string, @Query('to') to: string) {
    return { success: true, data: { canConvert: this.unitService.canConvert(from, to) } };
  }
}
