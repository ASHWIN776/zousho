'use client'

import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { cn } from '@/lib/utils'
import { markdownToHtml } from '@/lib/helper'
import { Markdown } from 'tiptap-markdown'
import Placeholder from '@tiptap/extension-placeholder'
import { useDebouncedCallback } from 'use-debounce'
import { useState } from 'react'

interface Props {
  onChange?: (content: string) => void
  content?: string
  setCanSave?: React.Dispatch<React.SetStateAction<boolean>>
}

const TipTapEditor = ({ onChange, content = '', setCanSave }: Props) => {
  const [saveStatus, setSaveStatus] = useState('Idle');

  const debouncedUpdates = useDebouncedCallback(async (editor: Editor) => {
    const markdown = editor.storage.markdown.getMarkdown();
    onChange?.(markdown);
    setSaveStatus('Saved');
    setCanSave?.(true);
  }, 500);  

  const editor = useEditor({
    extensions: [StarterKit, Markdown, Placeholder.configure({ placeholder: 'Start writing something...' })],
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-stone dark:prose-invert prose-base focus:outline-hidden'
        ),
      },
    },
    content: markdownToHtml(content),
    onUpdate: ({ editor }) => {
      setCanSave?.(false);
      setSaveStatus('Not saved');
      debouncedUpdates(editor);
    },
  })

  // Clicking on container will focus the editor
  const handleContainerClick = () => {
    if (editor && !editor.isFocused) {
      editor.chain().focus().run()
    }
  }

  return (
    <div 
      className="relative min-h-[800px] w-full max-w-(--breakpoint-lg) border-muted bg-background sm:mb-[calc(20vh)] sm:rounded-lg sm:border sm:shadow-lg dark:bg-zinc-800/50 dark:border-zinc-700 p-12 cursor-text" 
      onClick={handleContainerClick}
    >
      <div className="text-xs text-muted-foreground absolute top-4 right-4">
        {saveStatus}
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}

export default TipTapEditor
