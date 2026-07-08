import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OntologyRegistryService } from '../../application/services/ontology-registry.service.js';
import { DomainTaxonomyService } from '../../application/services/domain-taxonomy.service.js';

@ApiTags('knowledge-intelligence')
@ApiBearerAuth('JWT-auth')
@Controller('knowledge-intelligence')
export class OntologyController {
  constructor(
    private readonly ontologyService: OntologyRegistryService,
    private readonly taxonomyService: DomainTaxonomyService,
  ) {}

  @Get('ontologies')
  @ApiOperation({ summary: 'List active ontologies for workspace' })
  async listOntologies(@Request() req: any) {
    const ontologies = await this.ontologyService.getActiveOntologies(req.user?.workspaceId);
    return { success: true, data: ontologies };
  }

  @Post('ontologies')
  @ApiOperation({ summary: 'Register a new ontology' })
  async registerOntology(@Request() req: any, @Body() body: { name: string; slug: string; version: string; description?: string }) {
    const ontology = await this.ontologyService.registerOntology({
      workspaceId: req.user?.workspaceId,
      name: body.name,
      slug: body.slug,
      version: body.version,
      description: body.description,
    });
    return { success: true, data: ontology };
  }

  @Get('ontologies/:ontologyId/classes')
  @ApiOperation({ summary: 'List classes in an ontology' })
  async listClasses(@Param('ontologyId') ontologyId: string) {
    const classes = await this.ontologyService.listClasses(ontologyId);
    return { success: true, data: classes };
  }

  @Get('taxonomy/hierarchy')
  @ApiOperation({ summary: 'Get taxonomy hierarchy for workspace' })
  async getTaxonomyHierarchy(@Request() req: any) {
    const hierarchy = await this.taxonomyService.getTaxonomyHierarchy(req.user?.workspaceId);
    return { success: true, data: hierarchy };
  }

  @Post('taxonomy/classify/:nodeId')
  @ApiOperation({ summary: 'Classify a graph node into an ontology class' })
  async classifyNode(@Param('nodeId') nodeId: string, @Body() body: { classUri: string }) {
    const result = await this.taxonomyService.classifyNode(nodeId, body.classUri);
    return { success: true, data: result };
  }
}
