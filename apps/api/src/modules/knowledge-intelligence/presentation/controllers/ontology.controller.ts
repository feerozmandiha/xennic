import { Controller, Get, Post, Body, Param, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { RequirePermissions } from '../../../rbac/infrastructure/decorators/permissions.decorator.js';
import { PermissionsGuard } from '../../../rbac/infrastructure/guards/permissions.guard.js';
import { WorkspaceGuard } from '../../../rbac/infrastructure/guards/workspace.guard.js';
import { GraphWorkspaceGuard } from '../guards/graph-workspace.guard.js';
<<<<<<< ours
=======
import { ClassifyGraphNodeDto, RegisterOntologyDto } from '../dtos/ontology.dto.js';
>>>>>>> theirs
import { OntologyRegistryService } from '../../application/services/ontology-registry.service.js';
import { DomainTaxonomyService } from '../../application/services/domain-taxonomy.service.js';

@ApiTags('knowledge-intelligence')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, WorkspaceGuard, PermissionsGuard, GraphWorkspaceGuard)
@RequirePermissions('knowledge.read')
@Controller('knowledge-intelligence')
export class OntologyController {
  constructor(
    private readonly ontologyService: OntologyRegistryService,
    private readonly taxonomyService: DomainTaxonomyService,
  ) {}

  @Get('ontologies')
  @ApiOperation({ summary: 'List active ontologies for workspace' })
  async listOntologies(@Request() req: any) {
    const ontologies = await this.ontologyService.getActiveOntologies(req.workspaceId);
    return { success: true, data: ontologies };
  }

  @Post('ontologies')
  @RequirePermissions('knowledge.update')
  @ApiOperation({ summary: 'Register a new ontology' })
  async registerOntology(@Request() req: any, @Body() body: RegisterOntologyDto) {
    const ontology = await this.ontologyService.registerOntology({
      workspaceId: req.workspaceId,
<<<<<<< ours
      name: body.name,
      slug: body.slug,
      version: body.version,
      description: body.description,
=======
      name: body.name.trim(),
      slug: body.slug.trim(),
      version: body.version.trim(),
      description: body.description?.trim() || undefined,
>>>>>>> theirs
    });
    return { success: true, data: ontology };
  }

  @Get('ontologies/:ontologyId/classes')
  @ApiOperation({ summary: 'List classes in an ontology' })
  async listClasses(@Request() req: any, @Param('ontologyId') ontologyId: string) {
    const classes = await this.ontologyService.listClasses(ontologyId, req.workspaceId);
    return { success: true, data: classes };
  }

  @Get('taxonomy/hierarchy')
  @ApiOperation({ summary: 'Get taxonomy hierarchy for workspace' })
  async getTaxonomyHierarchy(@Request() req: any) {
    const hierarchy = await this.taxonomyService.getTaxonomyHierarchy(req.workspaceId);
    return { success: true, data: hierarchy };
  }

  @Post('taxonomy/classify/:nodeId')
  @RequirePermissions('knowledge.update')
  @ApiOperation({ summary: 'Classify a graph node into an ontology class' })
  async classifyNode(@Param('nodeId') nodeId: string, @Body() body: ClassifyGraphNodeDto) {
    const result = await this.taxonomyService.classifyNode(nodeId, body.classUri.trim());
    return { success: true, data: result };
  }
}
