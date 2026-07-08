import { Injectable } from '@nestjs/common';
import type { PromptTemplate } from '../../domain/types/prompt.types.js';
import { PromptRenderingException } from '../../domain/exceptions/prompt.exception.js';

@Injectable()
export class PromptTemplateEngineService {
  render(
    template: PromptTemplate,
    variables: Record<string, string>,
  ): string {
    const missing: string[] = [];

    for (const v of template.variables) {
      if (v.required && !(v.name in variables) && v.defaultValue === undefined) {
        missing.push(v.name);
      }
    }

    if (missing.length > 0) {
      throw new PromptRenderingException(
        template.key,
        `Missing required variables: ${missing.join(', ')}`,
      );
    }

    let result = template.fullTemplate;

    for (const v of template.variables) {
      const value = variables[v.name] ?? v.defaultValue ?? '';
      result = result.replaceAll(`{{${v.name}}}`, value);
    }

    return result;
  }

  renderFromString(
    template: string,
    variables: Record<string, string>,
  ): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replaceAll(`{{${key}}}`, value);
    }
    return result;
  }
}
