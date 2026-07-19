// components/RichTextEditor.jsx
import React, { useEffect, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight } from "lowlight";
import javascript from "highlight.js/lib/languages/javascript";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Highlighter,
  Heading1,
  Heading2,
  Heading3,
  Type,
  RemoveFormatting,
} from "lucide-react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";

const lowlight = createLowlight();
lowlight.register("javascript", javascript);

const ToolbarButton = ({ onClick, active, disabled, title, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-1.5 rounded transition-colors ${
      active
        ? "bg-amber-100 text-amber-800 font-semibold"
        : "text-gray-600 hover:bg-gray-100"
    } ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
  >
    {children}
  </button>
);

const ToolbarDivider = () => (
  <div className="w-px h-5 bg-gray-300 mx-0.5 self-center" />
);

const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Write your blog post content here...",
}) => {
  const imageInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Underline,
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full rounded-lg my-4",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-amber-700 underline hover:text-amber-900",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-amber max-w-none min-h-[320px] p-4 focus:outline-none text-gray-800",
      },
    },
  });

  // Sync external value changes (e.g. when loading a post for editing)
  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const setLink = useCallback(() => {
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL", prev || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }
  }, [editor]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await Axios({
        ...SummaryApi.uploadImage,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.success) {
        const url = response.data.data?.secure_url || response.data.data?.url;
        editor.chain().focus().setImage({ src: url, alt: file.name }).run();
      }
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("Image upload failed. Please try again.");
    } finally {
      e.target.value = "";
    }
  };

  const handleImageUrl = () => {
    const url = window.prompt("Paste image URL");
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  if (!editor) return null;

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-amber-500 bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
        {/* History */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo size={15} />
        </ToolbarButton>
        <ToolbarDivider />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setParagraph().run()}
          active={editor.isActive("paragraph")}
          title="Paragraph"
        >
          <Type size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          <Heading1 size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 size={15} />
        </ToolbarButton>
        <ToolbarDivider />

        {/* Inline formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <Italic size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline"
        >
          <UnderlineIcon size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Strikethrough"
        >
          <Strikethrough size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHighlight({ color: "#fef08a" }).run()
          }
          active={editor.isActive("highlight")}
          title="Highlight"
        >
          <Highlighter size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().unsetAllMarks().clearNodes().run()
          }
          title="Clear Formatting"
        >
          <RemoveFormatting size={15} />
        </ToolbarButton>
        <ToolbarDivider />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="Align Left"
        >
          <AlignLeft size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="Align Center"
        >
          <AlignCenter size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          title="Align Right"
        >
          <AlignRight size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          active={editor.isActive({ textAlign: "justify" })}
          title="Justify"
        >
          <AlignJustify size={15} />
        </ToolbarButton>
        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Numbered List"
        >
          <ListOrdered size={15} />
        </ToolbarButton>
        <ToolbarDivider />

        {/* Blocks */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Blockquote"
        >
          <Quote size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          title="Inline Code"
        >
          <Code size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
          title="Code Block"
        >
          <span className="text-xs font-mono font-bold px-0.5">{"</>"}</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <Minus size={15} />
        </ToolbarButton>
        <ToolbarDivider />

        {/* Links & Images */}
        <ToolbarButton
          onClick={setLink}
          active={editor.isActive("link")}
          title="Insert Link"
        >
          <LinkIcon size={15} />
        </ToolbarButton>

        {/* Image upload */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
        <ToolbarButton
          onClick={() => imageInputRef.current?.click()}
          title="Upload Image"
        >
          <ImageIcon size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={handleImageUrl} title="Insert Image by URL">
          <span className="text-xs font-bold">URL</span>
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />

      {/* Word count footer */}
      <div className="px-4 py-1.5 border-t border-gray-100 bg-gray-50 text-xs text-gray-400 flex justify-between">
        <span>
          {editor.storage?.characterCount?.words?.() ??
            editor.getText().trim().split(/\s+/).filter(Boolean).length}{" "}
          words
        </span>
        <span className="text-gray-300">
          Tip: Drag &amp; drop images directly into the editor
        </span>
      </div>
    </div>
  );
};

export default RichTextEditor;
