import { Test, TestingModule } from '@nestjs/testing';
import { ReportGenerator } from '../application/services/report-generator.service.js';

describe('ReportGenerator', () => {
  let service: ReportGenerator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportGenerator],
    }).compile();
    service = module.get<ReportGenerator>(ReportGenerator);
  });

  it('generates a markdown report', async () => {
    const report = await service.generate({
      title: 'Engineering Analysis Report', format: 'markdown', traceId: 'trace-1',
      sections: [
        { type: 'executive-summary', title: 'Executive Summary', content: 'This is the summary.' },
        { type: 'analysis', title: 'Analysis', content: 'Detailed analysis here.' },
      ],
    });
    expect(report.id).toBeTruthy();
    expect(report.format).toBe('markdown');
    expect(report.sections).toHaveLength(2);
    expect(report.sections[0].content).toContain('## Executive Summary');
  });

  it('generates a JSON report', async () => {
    const report = await service.generate({
      title: 'JSON Report', format: 'json', traceId: 'trace-2',
      sections: [{ type: 'decision', title: 'Decision', content: 'Selected option A' }],
    });
    const json = service.toJson(report);
    const parsed = JSON.parse(json);
    expect(parsed.title).toBe('JSON Report');
  });

  it('renders sections correctly for each format', () => {
    const section = { id: 's1', type: 'analysis' as any, title: 'Test Section', content: 'Content here', data: {}, order: 0 };
    expect(service.renderSection(section, 'markdown')).toContain('## Test Section');
    expect(service.renderSection(section, 'json')).toContain('"title"');
    expect(service.renderSection(section, 'pdf-ready')).toContain('\\section');
    expect(service.renderSection(section, 'machine')).toContain('<section');
  });

  it('toMarkdown produces full document', async () => {
    const report = await service.generate({
      title: 'Doc', format: 'markdown', traceId: 't1',
      sections: [{ type: 'references', title: 'References', content: '[1] IEC 60076' }],
    });
    const md = service.toMarkdown(report);
    expect(md).toContain('# Doc');
    expect(md).toContain('[1] IEC 60076');
  });
});
