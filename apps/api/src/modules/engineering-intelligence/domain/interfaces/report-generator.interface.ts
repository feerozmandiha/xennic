import type { EngineeringReport, ReportFormat, ReportSection, ReportSectionType } from '../types/ei.types.js';

export interface IReportGenerator {
  generate(params: {
    title: string;
    format: ReportFormat;
    sections: Array<{ type: ReportSectionType; title: string; content: string; data?: Record<string, unknown> }>;
    traceId: string;
  }): Promise<EngineeringReport>;
  renderSection(section: ReportSection, format: ReportFormat): string;
  toMarkdown(report: EngineeringReport): string;
  toJson(report: EngineeringReport): string;
}
