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
        class: 'min-h-[180px] px-3 py-2 text-brand-ink focus:outline-none',
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

      {/* Editor content — explicit styles since @tailwindcss/typography is not installed */}
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
        .kidpulse-editor img { max-width: 100%; border-radius: 8px; margin: 0.5rem 0; }
        .kidpulse-editor .is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #aaa;
          pointer-events: none;
          height: 0;
        }
      `}</style>
      <div className="kidpulse-editor">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}