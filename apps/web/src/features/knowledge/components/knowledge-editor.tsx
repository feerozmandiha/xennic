'use client';

import { useEditor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react';
import { Node, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TextAlign from '@tiptap/extension-text-align';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { useCallback, useRef, useState, useEffect } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, List, ListOrdered, Code, Quote,
  Minus, Undo2, Redo2, Link, Image, Table as TableIcon,
  AlignLeft, AlignCenter, AlignRight, Upload,
  X, Loader2, Subscript as SubIcon, Superscript as SupIcon,
  Variable, Hash,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useToast } from '@/stores/toast.store';
import katex from 'katex';

const lowlight = createLowlight(common);

const CODE_LANGUAGES = [
  { value: 'plaintext', label: 'Plain Text' },
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'rust', label: 'Rust' },
  { value: 'go', label: 'Go' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
  { value: 'matlab', label: 'MATLAB' },
  { value: 'r', label: 'R' },
];

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mathBlock: {
      setMathBlock: (latex: string) => ReturnType;
    };
    mathInline: {
      setMathInline: (latex: string) => ReturnType;
    };
  }
}

const MathBlockNode = Node.create({
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
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'math-block', class: 'math-block-wrapper' })];
  },
  addCommands() {
    return {
      setMathBlock:
        (latex: string) =>
        ({ commands }: any) =>
          commands.insertContent({ type: 'mathBlock', attrs: { latex } }),
    };
  },
  addNodeView() {
    return ({ node, editor, getPos }: any) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'math-block-wrapper my-2 p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.2)] text-center';
      const content = document.createElement('span');
      content.className = 'math-rendered block';
      wrapper.appendChild(content);
      const render = () => {
        try {
          katex.render(node.attrs.latex || '\\text{فرمول خالی}', content, { displayMode: true, throwOnError: false });
        } catch {
          content.innerHTML = `<code class="text-sm text-[hsl(var(--muted-foreground))]">${node.attrs.latex || ''}</code>`;
        }
      };
      render();
      if (editor.isEditable) {
        wrapper.style.cursor = 'pointer';
        wrapper.addEventListener('dblclick', () => {
          const newLatex = window.prompt('LaTeX فرمول:', node.attrs.latex);
          if (newLatex !== null && typeof getPos === 'function') {
            editor.commands.command(({ tr, dispatch }: any) => {
              if (dispatch) {
                tr.setNodeAttribute(getPos(), 'latex', newLatex);
                dispatch(tr);
              }
              return true;
            });
          }
        });
      }
      return { dom: wrapper, update: (oldNode: any) => { node.attrs.latex !== oldNode.attrs.latex && render(); return true; } };
    };
  },
});

const MathInlineNode = Node.create({
  name: 'mathInline',
  group: 'inline',
  inline: true,
  atom: true,
  addAttributes() {
    return {
      latex: { default: '', parseHTML: (el: HTMLElement) => el.getAttribute('data-latex') || '' },
    };
  },
  parseHTML() {
    return [{ tag: 'span[data-type="math-inline"]' }];
  },
  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'math-inline' })];
  },
  addCommands() {
    return {
      setMathInline:
        (latex: string) =>
        ({ commands }: any) =>
          commands.insertContent({ type: 'mathInline', attrs: { latex } }),
    };
  },
  addNodeView() {
    return ({ node, editor, getPos }: any) => {
      const span = document.createElement('span');
      span.className = 'math-inline-wrapper px-1 py-0.5 rounded bg-[hsl(var(--primary)/0.06)] border border-[hsl(var(--primary)/0.15)]';
      const render = () => {
        try {
          katex.render(node.attrs.latex || '\\text{?}', span, { displayMode: false, throwOnError: false });
        } catch {
          span.textContent = node.attrs.latex || '';
        }
      };
      render();
      if (editor.isEditable) {
        span.style.cursor = 'pointer';
        span.addEventListener('dblclick', () => {
          const newLatex = window.prompt('LaTeX فرمول:', node.attrs.latex);
          if (newLatex !== null && typeof getPos === 'function') {
            editor.commands.command(({ tr, dispatch }: any) => {
              if (dispatch) {
                tr.setNodeAttribute(getPos(), 'latex', newLatex);
                dispatch(tr);
              }
              return true;
            });
          }
        });
      }
      return { dom: span, update: (oldNode: any) => { node.attrs.latex !== oldNode.attrs.latex && render(); return true; } };
    };
  },
});

const PROSE_CLASSES = [
  'prose prose-sm max-w-none dark:prose-invert',
  '[&_.ProseMirror]:outline-none',
  '[&_.ProseMirror_p]:my-1',
  '[&_.ProseMirror_ul]:my-2 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pr-5',
  '[&_.ProseMirror_ol]:my-2 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pr-5',
  '[&_.ProseMirror_h1]:text-xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:mt-4 [&_.ProseMirror_h1]:mb-2',
  '[&_.ProseMirror_h2]:text-lg [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:mt-3 [&_.ProseMirror_h2]:mb-1.5',
  '[&_.ProseMirror_h3]:text-base [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:mt-2 [&_.ProseMirror_h3]:mb-1',
  '[&_.ProseMirror_pre]:bg-[hsl(var(--muted))] [&_.ProseMirror_pre]:p-3 [&_.ProseMirror_pre]:rounded-[var(--radius)] [&_.ProseMirror_pre]:font-mono [&_.ProseMirror_pre]:text-sm',
  '[&_.ProseMirror_blockquote]:border-r-2 [&_.ProseMirror_blockquote]:border-[hsl(var(--primary)/0.3)] [&_.ProseMirror_blockquote]:pr-3 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:text-[hsl(var(--muted-foreground))]',
  '[&_.ProseMirror_table]:w-full [&_.ProseMirror_table]:border-collapse [&_.ProseMirror_table]:my-2',
  '[&_.ProseMirror_th]:border [&_.ProseMirror_th]:border-[hsl(var(--border))] [&_.ProseMirror_th]:px-3 [&_.ProseMirror_th]:py-2 [&_.ProseMirror_th]:bg-[hsl(var(--muted))] [&_.ProseMirror_th]:font-semibold [&_.ProseMirror_th]:text-right',
  '[&_.ProseMirror_td]:border [&_.ProseMirror_td]:border-[hsl(var(--border))] [&_.ProseMirror_td]:px-3 [&_.ProseMirror_td]:py-2',
  '[&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:h-auto [&_.ProseMirror_img]:rounded-[var(--radius)] [&_.ProseMirror_img]:my-2',
  '[&_.ProseMirror_img.ProseMirror-selectednode]:ring-2 [&_.ProseMirror_img.ProseMirror-selectednode]:ring-[hsl(var(--primary))]',
  '[&_.ProseMirror_hr]:my-4 [&_.ProseMirror_hr]:border-[hsl(var(--border))]',
  '[&_.math-block-wrapper_.katex]:text-lg [&_.math-inline-wrapper_.katex]:text-sm',
].join(' ');

const PROSE_CLASSES_EDITOR = [
  ...PROSE_CLASSES,
  'focus:outline-none',
  '[&_.ProseMirror]:min-h-[300px]',
  '[&_.ProseMirror]:p-2',
  '[&_p.is-editor-empty:first-child::before]:text-[hsl(var(--muted-foreground))]',
  '[&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]',
  '[&_p.is-editor-empty:first-child::before]:float-right',
  '[&_p.is-editor-empty:first-child::before]:pointer-events-none',
  '[&_p.is-editor-empty:first-child::before]:h-0',
].join(' ');

interface Props {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
  placeholder?: string;
  editable?: boolean;
}

function ToolbarButton({ onClick, active, children, title }: {
  onClick: () => void; active?: boolean; children: React.ReactNode; title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`p-1.5 rounded-[var(--radius)] transition-colors ${
        active
          ? 'bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))]'
          : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]'
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-[hsl(var(--border))] shrink-0" />;
}

export function KnowledgeEditor({ content, onChange, placeholder, editable = true }: Props) {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({ lowlight }),
      Underline,
      Subscript,
      Superscript,
      Placeholder.configure({ placeholder: placeholder ?? 'شروع به نوشتن کنید...' }),
      LinkExtension.configure({ openOnClick: false }),
      ImageExtension.configure({ inline: false, allowBase64: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      MathBlockNode,
      MathInlineNode,
    ],
    content: content && Object.keys(content).length > 0 ? content : undefined,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON() as Record<string, unknown>);
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('آدرس لینک:', previousUrl ?? '');
    if (url === null) return;
    if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImageFromUrl = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('آدرس تصویر:', '');
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!editor) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      const res = await apiClient.post<{ success: boolean; data: { url: string } }>('/storage/upload', formData);
      const fileUrl = res.data?.url ?? '';
      if (fileUrl) {
        editor.chain().focus().setImage({ src: fileUrl }).run();
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          editor.chain().focus().setImage({ src: e.target?.result as string }).run();
        };
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (e) => {
        editor.chain().focus().setImage({ src: e.target?.result as string }).run();
      };
      reader.readAsDataURL(file);
      toast.error('آپلود روی سرور انجام نشد، تصویر به صورت محلی درج شد');
    } finally {
      setUploading(false);
    }
  }, [editor, toast]);

  const addTable = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  const addMathBlock = useCallback(() => {
    if (!editor) return;
    const latex = window.prompt('LaTeX فرمول (مثال: E = mc^2):', '');
    if (latex) editor.chain().focus().setMathBlock(latex).run();
  }, [editor]);

  const addMathInline = useCallback(() => {
    if (!editor) return;
    const latex = window.prompt('LaTeX فرمول درون‌خطی (مثال: \\Omega):', '');
    if (latex) editor.chain().focus().setMathInline(latex).run();
  }, [editor]);

  if (!editor) return null;

  const codeAttrs = editor.getAttributes('codeBlock');
  const currentLang = codeAttrs?.language || 'plaintext';

  return (
    <div className="border border-[hsl(var(--border))] rounded-[var(--radius)] overflow-hidden">
      {editable && (
        <div className="flex items-center gap-0.5 p-1.5 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] flex-wrap">
          {/* Text formatting */}
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="پررنگ">
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="ایتالیک">
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="زیرخط">
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="خط‌خورده">
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive('subscript')} title="زیرنویس">
            <SubIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive('superscript')} title="بالانویس">
            <SupIcon className="h-4 w-4" />
          </ToolbarButton>
          <Divider />

          {/* Headings */}
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="تیتر ۱">
            <Heading1 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="تیتر ۲">
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="تیتر ۳">
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>
          <Divider />

          {/* Lists */}
          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="لیست">
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="لیست شماره‌دار">
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <Divider />

          {/* Alignment */}
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="چپ‌چین">
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="وسط‌چین">
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="راست‌چین">
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>
          <Divider />

          {/* Blocks */}
          <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="کد">
            <Code className="h-4 w-4" />
          </ToolbarButton>
          {editor.isActive('codeBlock') && (
            <select
              value={currentLang}
              onChange={(e) => editor.chain().focus().updateAttributes('codeBlock', { language: e.target.value }).run()}
              className="h-7 text-[11px] px-1.5 rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] outline-none"
              onClick={(e) => e.stopPropagation()}
            >
              {CODE_LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          )}
          <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="نقل‌قول">
            <Quote className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="خط جداکننده">
            <Minus className="h-4 w-4" />
          </ToolbarButton>
          <Divider />

          {/* Math */}
          <ToolbarButton onClick={addMathBlock} title="فرمول (block)">
            <Variable className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={addMathInline} title="فرمول (inline)">
            <Hash className="h-4 w-4" />
          </ToolbarButton>
          <Divider />

          {/* Links & Media */}
          <ToolbarButton onClick={setLink} active={editor.isActive('link')} title="لینک">
            <Link className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={addImageFromUrl} title="تصویر از آدرس">
            <Image className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => fileInputRef.current?.click()} title="آپلود تصویر">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          </ToolbarButton>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); e.target.value = ''; }}
          />
          <Divider />

          {/* Table */}
          <ToolbarButton onClick={addTable} title="جدول">
            <TableIcon className="h-4 w-4" />
          </ToolbarButton>
          {editor.can().addColumnBefore?.() && (
            <>
              <button
                type="button"
                onClick={() => editor.chain().focus().addColumnBefore().run()}
                className="text-[10px] px-1.5 py-1 rounded hover:bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]"
                title="ستون قبل"
              >◀</button>
              <button
                type="button"
                onClick={() => editor.chain().focus().addColumnAfter().run()}
                className="text-[10px] px-1.5 py-1 rounded hover:bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]"
                title="ستون بعد"
              >▶</button>
              <button
                type="button"
                onClick={() => editor.chain().focus().addRowBefore().run()}
                className="text-[10px] px-1.5 py-1 rounded hover:bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]"
                title="ردیف قبل"
              >▲</button>
              <button
                type="button"
                onClick={() => editor.chain().focus().addRowAfter().run()}
                className="text-[10px] px-1.5 py-1 rounded hover:bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]"
                title="ردیف بعد"
              >▼</button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteColumn().run()}
                className="text-[10px] px-1.5 py-1 rounded hover:bg-red-50 text-red-400"
                title="حذف ستون"
              >
                <X className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteRow().run()}
                className="text-[10px] px-1.5 py-1 rounded hover:bg-red-50 text-red-400"
                title="حذف ردیف"
              >
                <X className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteTable().run()}
                className="text-[10px] px-1.5 py-1 rounded hover:bg-red-50 text-red-500"
                title="حذف جدول"
              >🗑</button>
            </>
          )}
          <Divider />

          {/* Undo / Redo */}
          <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="برگشت">
            <Undo2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="جلو">
            <Redo2 className="h-4 w-4" />
          </ToolbarButton>
        </div>
      )}
      <div className="p-4">
        <EditorContent editor={editor} className={PROSE_CLASSES_EDITOR} />
      </div>
    </div>
  );
}

export function KnowledgeRenderer({ content }: { content: Record<string, unknown> }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({ lowlight }),
      Underline,
      Subscript,
      Superscript,
      LinkExtension.configure({ openOnClick: true }),
      ImageExtension.configure({ inline: false }),
      Table.configure({ resizable: false }),
      TableRow,
      TableCell,
      TableHeader,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      MathBlockNode,
      MathInlineNode,
    ],
    content,
    editable: false,
  });
  if (!editor) return null;
  return (
    <div className={PROSE_CLASSES}>
      <EditorContent editor={editor} />
    </div>
  );
}
