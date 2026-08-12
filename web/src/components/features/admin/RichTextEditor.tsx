'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Heading from '@tiptap/extension-heading';
import Placeholder from '@tiptap/extension-placeholder';
import { adminApi, fileToBase64 } from '@/lib/adminApi';
import { useAuthStore } from '@/stores/authStore';
import { useRef } from 'react';

interface Props {
  value: string;
  onChange: (html: string) => void;
}

const btnClass =
  'rounded px-2 py-1 text-[0.78rem] font-semibold border border-brand-line hover:bg-brand-cream transition-colors';
const activeBtnClass =
  'rounded px-2 py-1 text-[0.78rem] font-semibold border border-brand-indigo bg-brand-indigo text-white';

export function RichTextEditor({ value, onChange }: Props) {
  const token = useAuthStore((s) => s.accessToken);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Heading.configure({ levels: [1, 2, 3] }),
      Image.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder: 'Write the product description here…' }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-[180px] px-3 py-2 text-brand-ink focus:outline-none',
      },
    },
  });

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    try {
      const dataBase64 = await fileToBase64(file);
      const result = await adminApi.uploadImage(
        {
          filename: file.name,
          contentType: file.type,
          dataBase64,
          folder: 'products',
        },
        token
      );
      editor.chain().focus().setImage({ src: result.url }).run();
    } catch {
      // silent fail — image upload failed
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  if (!editor) return null;

  return (
    <div className="rounded-[10px] border border-brand-line bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-brand-line bg-brand-cream/40 px-2 py-1.5">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? activeBtnClass : btnClass}
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? activeBtnClass : btnClass}
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? activeBtnClass : btnClass}
          title="Heading 3"
        >
          H3
        </button>
        <span className="mx-1 h-4 w-px bg-brand-line" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? activeBtnClass : btnClass}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? activeBtnClass : btnClass}
          title="Italic"
        >
          <em>I</em>
        </button>
        <span className="mx-1 h-4 w-px bg-brand-line" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? activeBtnClass : btnClass}
          title="Bullet list"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? activeBtnClass : btnClass}
          title="Numbered list"
        >
          1. List
        </button>
        <span className="mx-1 h-4 w-px bg-brand-line" />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={btnClass}
          title="Insert image"
        >
          📷 Image
        </button>
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
          title="Undo"
        >
          ↩
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className={btnClass}
          title="Redo"
        >
          ↪
        </button>
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} />
    </div>
  );
}