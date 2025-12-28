"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { useEffect } from "react";

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const getButtonClass = (isActive: boolean) => 
    `px-3 py-1.5 text-sm font-medium rounded transition-colors ${
      isActive 
        ? "bg-gray-200 text-black font-bold" 
        : "text-gray-600 hover:bg-gray-100 hover:text-black"
    }`;

  const addImage = () => {
    const url = window.prompt("Enter image URL:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="border-b border-gray-200 bg-gray-50 p-2 flex flex-wrap gap-1 sticky top-0 z-10">
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={getButtonClass(editor.isActive("bold"))}>Bold</button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={getButtonClass(editor.isActive("italic"))}>Italic</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={getButtonClass(editor.isActive("heading", { level: 2 }))}>H2</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={getButtonClass(editor.isActive("heading", { level: 3 }))}>H3</button>
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={getButtonClass(editor.isActive("bulletList"))}>• List</button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={getButtonClass(editor.isActive("orderedList"))}>1. List</button>
      <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={getButtonClass(editor.isActive("blockquote"))}>"Quote"</button>
      <button onClick={addImage} className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors">+ Image</button>
      
      <div className="ml-auto flex gap-1">
        <button onClick={() => editor.chain().focus().undo().run()} className="px-2 text-gray-400 hover:text-black">↩</button>
        <button onClick={() => editor.chain().focus().redo().run()} className="px-2 text-gray-400 hover:text-black">↪</button>
      </div>
    </div>
  );
};

export default function TiptapEditor({ content, onChange }: { content: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: content,
    immediatelyRender: false, // <--- THIS IS THE FIX (Prevents SSR Crash)
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-lg focus:outline-none max-w-none min-h-[300px] p-6",
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}