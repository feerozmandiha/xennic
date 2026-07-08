import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TextNormalizationService {
  private readonly logger = new Logger(TextNormalizationService.name);

  normalize(rawText: string, language = 'fa'): string {
    let text = rawText;

    text = this.removeControlChars(text);
    text = this.normalizeWhitespace(text);
    text = this.removePageHeaders(text);
    text = this.normalizeLineBreaks(text);

    if (language === 'fa') {
      text = this.normalizePersian(text);
    }

    return text.trim();
  }

  private removeControlChars(text: string): string {
    return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ''); // eslint-disable-line no-control-regex
  }

  private normalizeWhitespace(text: string): string {
    return text
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n');
  }

  private removePageHeaders(text: string): string {
    return text
      .replace(/^\s*\d+\s*$/gm, '')
      .replace(/^Page \d+\s*$/gim, '')
      .replace(/^صفحه \d+\s*$/gim, '');
  }

  private normalizeLineBreaks(text: string): string {
    return text
      .replace(/[ \t]*\r\n?/g, '\n')
      .replace(/[ \t]*\n[ \t]*/g, '\n');
  }

  private normalizePersian(text: string): string {
    const arabicChars = ['\u064B', '\u064C', '\u064D', '\u064E', '\u064F', '\u0650', '\u0651', '\u0652'];
    let result = text;

    arabicChars.forEach((char) => {
      result = result.replace(new RegExp(char, 'g'), '');
    });

    return result;
  }

  splitIntoSections(text: string): Array<{ title: string; content: string }> {
    const sectionRegex = /^#{1,6}\s+(.+)$/gm;
    const sections: Array<{ title: string; content: string }> = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let currentTitle = 'Introduction';

    while ((match = sectionRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        sections.push({
          title: currentTitle,
          content: text.slice(lastIndex, match.index).trim(),
        });
      }
      currentTitle = match[1] ?? 'Untitled';
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      sections.push({
        title: currentTitle,
        content: text.slice(lastIndex).trim(),
      });
    }

    if (sections.length === 0) {
      sections.push({ title: 'Full Document', content: text.trim() });
    }

    return sections;
  }
}
