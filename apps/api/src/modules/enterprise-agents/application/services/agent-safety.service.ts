import { Injectable } from '@nestjs/common';
import type { IAgentSafety } from '../../domain/interfaces/agent-safety.interface.js';
import type { SafetyValidationRequest, SafetyValidationResult, SafetyCheck } from '../../domain/types/agent.types.js';
import { SafetySeverity } from '../../domain/types/agent.types.js';

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|above|prior)\s+instructions/i,
  /system\s+prompt/i,
  /you\s+are\s+(now|not\s+an?\s+)/i,
  /disregard/i,
  /forget\s+(all\s+)?(previous|prior)/i,
  /new\s+instruction/i,
  /role\s+play/i,
];

const UNSUPPORTED_PATTERNS = [
  /i\s+(am\s+)?not\s+(sure|certain|confident)/i,
  /cannot\s+(determine|calculate|analyze)/i,
  /may\s+not\s+be\s+accurate/i,
  /beyond\s+my\s+(scope|capability|knowledge)/i,
];

@Injectable()
export class AgentSafety implements IAgentSafety {
  validate(request: SafetyValidationRequest): SafetyValidationResult {
    const checks: SafetyCheck[] = [
      this.checkInputSafety(request.input),
      this.checkOutputConsistency(request.input, request.output),
      this.checkToolSafety(request.toolsUsed),
      this.checkConfidence(request.output, request.context),
    ];

    const totalScore = checks.reduce((sum, c) => sum + c.score, 0);
    const overallScore = checks.length > 0 ? totalScore / checks.length : 1;
    const passed = checks.every((c) => c.passed) && overallScore >= 0.5;
    const confidence = checks.filter((c) => c.passed).length / checks.length;

    return { passed, score: Math.round(overallScore * 100) / 100, checks, confidence };
  }

  checkInputSafety(input: string): SafetyCheck {
    const matches: string[] = [];
    for (const pattern of INJECTION_PATTERNS) {
      const match = input.match(pattern);
      if (match) matches.push(match[0]);
    }

    const passed = matches.length === 0;
    return {
      name: 'input-safety', passed,
      score: passed ? 1 : Math.max(0, 1 - matches.length * 0.33),
      details: passed ? 'No prompt injection patterns detected' : `Suspicious patterns found: ${matches.join(', ')}`,
      severity: passed ? SafetySeverity.LOW : SafetySeverity.HIGH,
    };
  }

  checkOutputConsistency(input: string, output: string): SafetyCheck {
    if (!output || output.trim().length === 0) {
      return { name: 'output-consistency', passed: false, score: 0, details: 'Output is empty', severity: SafetySeverity.HIGH };
    }

    const outputWords = output.split(/\s+/).length;
    if (output.length < 10) {
      return { name: 'output-consistency', passed: false, score: 0.2, details: 'Output is too short to be meaningful', severity: SafetySeverity.MEDIUM };
    }

    const unsupportedMatches: string[] = [];
    for (const pattern of UNSUPPORTED_PATTERNS) {
      const match = output.match(pattern);
      if (match) unsupportedMatches.push(match[0]);
    }

    const passed = unsupportedMatches.length === 0 && outputWords >= 5;
    const score = passed ? 1 : Math.max(0.1, 1 - unsupportedMatches.length * 0.25);

    let details: string;
    if (passed) {
      details = 'Output is consistent and sufficiently detailed';
    } else {
      details = `Output shows uncertainty: ${unsupportedMatches.join(', ')}`;
    }

    return { name: 'output-consistency', passed, score, details, severity: passed ? SafetySeverity.LOW : SafetySeverity.MEDIUM };
  }

  checkToolSafety(toolsUsed: string[]): SafetyCheck {
    if (!toolsUsed || toolsUsed.length === 0) {
      return { name: 'tool-safety', passed: true, score: 1, details: 'No tools were used', severity: SafetySeverity.LOW };
    }

    const restrictedTools = toolsUsed.filter((t) =>
      t.toLowerCase().includes('admin') || t.toLowerCase().includes('delete') || t.toLowerCase().includes('system'),
    );

    const passed = restrictedTools.length === 0;
    const score = passed ? 1 : Math.max(0, 1 - restrictedTools.length * 0.5);

    return {
      name: 'tool-safety', passed, score,
      details: passed ? `All ${toolsUsed.length} tools are safe` : `Restricted tools detected: ${restrictedTools.join(', ')}`,
      severity: restrictedTools.length > 0 ? SafetySeverity.CRITICAL : SafetySeverity.LOW,
    };
  }

  checkConfidence(output: string, context: Record<string, unknown>): SafetyCheck {
    let score = 0.7;

    if (output.length > 100) score += 0.1;
    if (output.includes('IEC') || output.includes('IEEE') || output.includes('EN ')) score += 0.1;
    if (Object.keys(context).length > 0) score += 0.05;

    const hasNumericData = /\d+\.?\d*\s*(kV|A|V|W|Hz|mm²|kA|MVA)/.test(output);
    if (hasNumericData) score += 0.05;

    const passed = score >= 0.5;
    return {
      name: 'confidence', passed, score: Math.min(1, Math.round(score * 100) / 100),
      details: passed ? 'Confidence level is acceptable' : 'Confidence too low — output lacks technical specificity',
      severity: passed ? SafetySeverity.LOW : SafetySeverity.MEDIUM,
    };
  }
}
