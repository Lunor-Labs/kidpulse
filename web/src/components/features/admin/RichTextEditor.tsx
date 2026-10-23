'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Heading from '@tiptap/extension-heading';
import Placeholder from '@tiptap/extension-placeholder';
import { adminApi, fileToBase64 } from '@/lib/adminApi';
import { useAuthStore } from '@/stores/authStore';
import { useRef, useEffect } from 'react';

interface Props {
  value: string;
  onChange: (html: string) => void;
}

const btnClass =
  'rounded px-2 py-1 text-[0.78rem] font-semibold border border-brand-line hover:bg-brand-cream transition-colors';

const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: { default: null },
      height: { default: null },
      style: { default: null },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'img[src]',
        getAttrs: (el) => {
          const img = el as HTMLImageElement;
          return {
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt'),
            title: img.getAttribute('title'),
            width: img.getAttribute('width'),
            height: img.getAttribute('height'),
            style: img.getAttribute('style'),
          };
        },
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ['img', HTMLAttributes];
  },
});

function removeFirstImage(editor: ReturnType<typeof useEditor>) {
  if (!editor) return false;
  let imagePos = -1;
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === 'image' && imagePos === -1) {
      imagePos = pos;
    }
  });
  if (imagePos === -1) return false;
  const { tr } = editor.state;
  const node = editor.state.doc.nodeAt(imagePos);
  if (!node) return false;
  editor.view.dispatch(tr.delete(imagePos, imagePos + node.nodeSize));
  return true;
}

export function RichTextEditor({ value, onChange }: Props) {
  const token = useAuthStore((s) => s.accessToken);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastSetValue = useRef<string>('');
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Heading.configure({ levels: [1, 2, 3] }),
      CustomImage.configure({ inline: true, allowBase64: true }),
      Placeholder.configure({ placeholder: 'Write the product description here…' }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      lastSetValue.current = html;
      onChangeRef.current(html);
    },
    editorProps: {
      attributes: {
        class: 'min-h-[180px] px-3 py-2 text-brand-ink focus:outline-none',
      },
    },
  });

  useEffect(() => {
    if (!editor || !value) return;
    if (value === lastSetValue.current) return;
    if (value === editor.getHTML()) return;
    lastSetValue.current = value;
    editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  useEffect(() => {
    if (!editor) return;
    const dom = editor.view.dom;
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName !== 'IMG') return;
      e.preventDefault();
      e.stopPropagation();
      if (!window.confirm('Remove this image from the description?')) return;
      const removed = removeFirstImage(editor);
      if (removed) {
        onChangeRef.current(editor!.getHTML());
      }
    }
    dom.addEventListener('click', handleClick);
    return () => dom.removeEventListener('click', handleClick);
  }, [editor]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    try {
      const dataBase64 = await fileToBase64(file);
      const result = await adminApi.uploadImage(
        { filename: file.name, contentType: file.type, dataBase64, folder: 'products' },
        token
      );
      editor.chain().focus().setImage({ src: result.url }).run();
    } catch {
      // silent fail
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  if (!editor) return null;

  return (
    <div className="rounded-[10px] border border-brand-line bg-white overflow-hidden">
      <div className="flex flex-wrap items-center gap-1 border-b border-brand-line bg-brand-cream/40 px-2 py-1.5">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'rounded px-2 py-1 text-[0.78rem] font-semibold border border-brand-indigo bg-brand-indigo text-white' : btnClass}
        >H1</button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'rounded px-2 py-1 text-[0.78rem] font-semibold border border-brand-indigo bg-brand-indigo text-white' : btnClass}
        >H2</button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'rounded px-2 py-1 text-[0.78rem] font-semibold border border-brand-indigo bg-brand-indigo text-white' : btnClass}
        >H3</button>
        <span className="mx-1 h-4 w-px bg-brand-line" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'rounded px-2 py-1 text-[0.78rem] font-semibold border border-brand-indigo bg-brand-indigo text-white' : btnClass}
        ><strong>B</strong></button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'rounded px-2 py-1 text-[0.78rem] font-semibold border border-brand-indigo bg-brand-indigo text-white' : btnClass}
        ><em>I</em></button>
        <span className="mx-1 h-4 w-px bg-brand-line" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'rounded px-2 py-1 text-[0.78rem] font-semibold border border-brand-indigo bg-brand-indigo text-white' : btnClass}
        >• List</button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'rounded px-2 py-1 text-[0.78rem] font-semibold border border-brand-indigo bg-brand-indigo text-white' : btnClass}
        >1. List</button>
        <span className="mx-1 h-4 w-px bg-brand-line" />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={btnClass}
          title="Insert image"
        >📷 Image</button>
        <button
          type="button"
          onClick={() => {
            const removed = removeFirstImage(editor);
            if (removed) onChangeRef.current(editor.getHTML());
          }}
          className={btnClass}
          title="Remove image from description"
        >🗑 Remove image</button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={handleImageUpload}
        />
        <span className="mx-1 h-4 w-px bg-brand-line" />
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className={btnClass}
        >↩</button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className={btnClass}
        >↪</button>
      </div>

      <style>{`
        .kidpulse-editor h1 { font-size: 1.6rem; font-weight: 700; color: #1a1a6e; margin-bottom: 0.5rem; }
        .kidpulse-editor h2 { font-size: 1.3rem; font-weight: 700; color: #1a1a6e; margin-bottom: 0.4rem; }
        .kidpulse-editor h3 { font-size: 1.1rem; font-weight: 600; color: #333; margin-bottom: 0.3rem; }
        .kidpulse-editor p { margin-bottom: 0.5rem; }
        .kidpulse-editor ul { list-style-type: disc; padding-left: 1.4rem; margin-bottom: 0.5rem; }
        .kidpulse-editor ol { list-style-type: decimal; padding-left: 1.4rem; margin-bottom: 0.5rem; }
        .kidpulse-editor li { margin-bottom: 0.2rem; }
        .kidpulse-editor strong { font-weight: 700; }
        .kidpulse-editor em { font-style: italic; }
        .kidpulse-editor img { width: 100%; height: auto; display: block; margin: 0.75rem 0; border-radius: 8px; cursor: pointer; border: 2px dashed transparent; }
        .kidpulse-editor img:hover { border: 2px dashed #ef4444; }
        .kidpulse-editor .is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left; color: #aaa; pointer-events: none; height: 0;
        }
      `}</style>
      <div className="kidpulse-editor">
        <EditorContent editor={editor} />
      </div>
      <p className="px-3 py-1.5 text-[0.72rem] text-brand-ink-soft border-t border-brand-line">
        💡 Click an image in the editor to remove it, or use the 🗑 Remove image button.
      </p>
    </div>
  );
}