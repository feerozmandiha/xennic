import { Node, mergeAttributes, CommandProps } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mathBlock: {
      setMathBlock: (latex: string) => ReturnType;
    };
  }
}

export const MathBlock = Node.create({
  name: 'mathBlock',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      latex: { default: '', parseHTML: (el: HTMLElement) => el.getAttribute('data-latex') || '' },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="math-block"]' }];
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'math-block', class: 'math-block' }),
      ['span', { class: 'math-latex' }, HTMLAttributes.latex],
    ];
  },

  addCommands() {
    return {
      setMathBlock:
        (latex: string) =>
        ({ commands }: CommandProps) =>
          commands.insertContent({
            type: 'mathBlock',
            attrs: { latex },
          }),
    };
  },
});

export const MathInline = Node.create({
  name: 'mathInline',

  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      latex: { default: '', parseHTML: el => (el as HTMLElement).getAttribute('data-latex') || '' },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-type="math-inline"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, { 'data-type': 'math-inline', class: 'math-inline' }),
      HTMLAttributes.latex,
    ];
  },

  addCommands() {
    return {
      setMathInline:
        (latex: string) =>
        ({ commands }) =>
          commands.insertContent({
            type: 'mathInline',
            attrs: { latex },
          }),
    };
  },
});
