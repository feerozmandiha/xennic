import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { IReportGenerator } from '../../domain/interfaces/report-generator.interface.js';
import type { EngineeringReport, ReportFormat, ReportSection, ReportSectionType } from '../../domain/types/ei.types.js';

@Injectable()
export class ReportGenerator implements IReportGenerator {
  private readonly logger = new Logger(ReportGenerator.name);

  async generate(params: {
    title: string; format: ReportFormat;
    sections: Array<{ type: ReportSectionType; title: string; content: string; data?: Record<string, unknown> }>;
    traceId: string;
  }): Promise<EngineeringReport> {
    const sections: ReportSection[] = params.sections.map((s, i) => ({
      id: randomUUID(), type: s.type, title: s.title,
      content: this.renderSection({ id: '', type: s.type, title: s.title, content: s.content, data: s.data ?? {}, order: i }, params.format),
      data: s.data ?? {}, order: i,
    }));

    return {
      id: randomUUID(), title: params.title, format: params.format,
      sections, generatedAt: Date.now(), traceId: params.traceId,
    };
  }

  renderSection(section: ReportSection, format: ReportFormat): string {
    switch (format) {
      case 'markdown':
        return `## ${section.title}\n\n${section.content}\n`;
      case 'json':
        return JSON.stringify({ title: section.title, content: section.content, data: section.data });
      case 'pdf-ready':
        return `\\section{${section.title}}\n${section.content}`;
      case 'machine':
        return `<section type="${section.type}"><title>${section.title}</title><content>${section.content}</content></section>`;
      default:
        return section.content;
    }
  }

  toMarkdown(report: EngineeringReport): string {
    const header = `# ${report.title}\n\n*Generated: ${new Date(report.generatedAt).toISOString()}*\n\n---\n\n`;
    const body = report.sections
      .sort((a, b) => a.order - b.order)
      .map((s) => this.renderSection(s, 'markdown'))
      .join('\n');
    return header + body;
  }

  toJson(report: EngineeringReport): string {
    return JSON.stringify(report, null, 2);
  }
}
