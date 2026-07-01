import {
  Controller, Post, Get, Body, Req, UseGuards, HttpCode, HttpStatus, Param,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../../rbac/infrastructure/guards/workspace.guard.js';
import { CalculationOrchestratorService } from '../../application/services/calculation-orchestrator.service.js';
import { FormulaRegistry } from '../../application/services/formula-registry.service.js';
import { EngineeringUnits } from '../../application/services/engineering-units.service.js';
import { CalculationQueryDto } from '../dtos/calculation.dto.js';
import type { CalculationEngineQuery } from '../../domain/types/calculation.types.js';

@ApiTags('calculation-engine')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
@Controller('calculation-engine')
export class CalculationEngineController {
  constructor(
    private readonly orchestrator: CalculationOrchestratorService,
    private readonly registry: FormulaRegistry,
    private readonly units: EngineeringUnits,
  ) {}

  @Post('execute')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute an engineering calculation', description: 'Deterministic, auditable calculation execution with validation, sensitivity, and uncertainty analysis.' })
  @ApiResponse({ status: 200, description: 'Calculation result with full audit trail' })
  async execute(@Req() req: any, @Body() dto: CalculationQueryDto) {
    const query: CalculationEngineQuery = {
      formulaId: dto.formulaId,
      inputs: dto.inputs,
      workspaceId: req.workspaceId || dto.workspaceId,
      options: {
        precision: dto.precision,
        sensitivityAnalysis: dto.sensitivityAnalysis,
        uncertaintyAnalysis: dto.uncertaintyAnalysis,
        sensitivityVariation: dto.sensitivityVariation,
        confidenceLevel: dto.confidenceLevel,
      },
    };
    const result = await this.orchestrator.execute(query);
    return { success: result.success, data: result.data, error: result.error };
  }

  @Get('formulas')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all available formulas' })
  async listFormulas() {
    const formulas = this.registry.list();
    return {
      success: true,
      data: formulas.map((f) => ({
        id: f.id, name: f.name, description: f.description, version: f.version,
        category: f.category, status: f.status,
        standards: f.standards.map((s) => ({ code: s.code, clause: s.clause })),
        inputs: f.inputs.map((p) => ({ name: p.name, label: p.label, unit: p.unit, required: p.required, min: p.min, max: p.max })),
        outputs: f.outputs.map((o) => ({ name: o.name, label: o.label, unit: o.unit })),
      })),
    };
  }

  @Get('formulas/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get formula details' })
  async getFormula(@Param('id') id: string) {
    const formula = this.registry.get(id);
    if (!formula) return { success: false, error: 'Formula not found' };
    return { success: true, data: formula.definition };
  }

  @Get('units')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List supported engineering units' })
  async listUnits() {
    return { success: true, data: this.units.listUnits() };
  }
}
