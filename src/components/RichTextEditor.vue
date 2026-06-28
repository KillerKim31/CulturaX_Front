<script setup>
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Введите текст...' },
})

const emit = defineEmits(['update:modelValue'])

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Image.configure({ inline: true }),
    Link.configure({ openOnClick: false }),
    Placeholder.configure({ placeholder: props.placeholder }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Underline,
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

watch(() => props.modelValue, (val) => {
  if (editor.value && val !== editor.value.getHTML()) {
    editor.value.commands.setContent(val, false)
  }
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})

function addImage() {
  const url = prompt('Введите URL изображения:')
  if (url) editor.value.chain().focus().setImage({ src: url }).run()
}

function setLink() {
  const url = prompt('Введите URL:')
  if (url === null) return
  if (url === '') {
    editor.value.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }
  editor.value.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

function extractYoutubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

function addVideo() {
  const url = prompt('Вставьте ссылку на YouTube видео:')
  if (!url) return
  const videoId = extractYoutubeId(url.trim())
  if (!videoId) {
    alert('Не удалось распознать YouTube ссылку. Используйте формат:\nhttps://www.youtube.com/watch?v=ID\nhttps://youtu.be/ID\nили просто ID видео')
    return
  }
  const iframe = `<div class="video-embed" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:1rem 0;"><iframe src="https://www.youtube.com/embed/${videoId}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture"></iframe></div>`
  editor.value.chain().focus().insertContent(iframe).run()
}
</script>

<template>
  <div class="tiptap-editor border rounded-3 overflow-hidden" v-if="editor">
    <div class="toolbar d-flex flex-wrap align-items-center gap-1 p-2 bg-light border-bottom">
      <div class="btn-group btn-group-sm">
        <button type="button" class="btn btn-outline-secondary"
          :class="{ active: editor.isActive('bold') }"
          @click="editor.chain().focus().toggleBold().run()" title="Жирный">
          <i class="bi bi-type-bold"></i>
        </button>
        <button type="button" class="btn btn-outline-secondary"
          :class="{ active: editor.isActive('italic') }"
          @click="editor.chain().focus().toggleItalic().run()" title="Курсив">
          <i class="bi bi-type-italic"></i>
        </button>
        <button type="button" class="btn btn-outline-secondary"
          :class="{ active: editor.isActive('underline') }"
          @click="editor.chain().focus().toggleUnderline().run()" title="Подчёркнутый">
          <i class="bi bi-type-underline"></i>
        </button>
        <button type="button" class="btn btn-outline-secondary"
          :class="{ active: editor.isActive('strike') }"
          @click="editor.chain().focus().toggleStrike().run()" title="Зачёркнутый">
          <i class="bi bi-type-strikethrough"></i>
        </button>
      </div>

      <div class="vr mx-1"></div>

      <div class="btn-group btn-group-sm">
        <button type="button" class="btn btn-outline-secondary"
          :class="{ active: editor.isActive('heading', { level: 2 }) }"
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" title="Заголовок H2">
          H2
        </button>
        <button type="button" class="btn btn-outline-secondary"
          :class="{ active: editor.isActive('heading', { level: 3 }) }"
          @click="editor.chain().focus().toggleHeading({ level: 3 }).run()" title="Заголовок H3">
          H3
        </button>
        <button type="button" class="btn btn-outline-secondary"
          :class="{ active: editor.isActive('heading', { level: 4 }) }"
          @click="editor.chain().focus().toggleHeading({ level: 4 }).run()" title="Заголовок H4">
          H4
        </button>
      </div>

      <div class="vr mx-1"></div>

      <div class="btn-group btn-group-sm">
        <button type="button" class="btn btn-outline-secondary"
          :class="{ active: editor.isActive({ textAlign: 'left' }) }"
          @click="editor.chain().focus().setTextAlign('left').run()" title="По левому краю">
          <i class="bi bi-text-left"></i>
        </button>
        <button type="button" class="btn btn-outline-secondary"
          :class="{ active: editor.isActive({ textAlign: 'center' }) }"
          @click="editor.chain().focus().setTextAlign('center').run()" title="По центру">
          <i class="bi bi-text-center"></i>
        </button>
        <button type="button" class="btn btn-outline-secondary"
          :class="{ active: editor.isActive({ textAlign: 'right' }) }"
          @click="editor.chain().focus().setTextAlign('right').run()" title="По правому краю">
          <i class="bi bi-text-right"></i>
        </button>
      </div>

      <div class="vr mx-1"></div>

      <div class="btn-group btn-group-sm">
        <button type="button" class="btn btn-outline-secondary"
          :class="{ active: editor.isActive('bulletList') }"
          @click="editor.chain().focus().toggleBulletList().run()" title="Маркированный список">
          <i class="bi bi-list-ul"></i>
        </button>
        <button type="button" class="btn btn-outline-secondary"
          :class="{ active: editor.isActive('orderedList') }"
          @click="editor.chain().focus().toggleOrderedList().run()" title="Нумерованный список">
          <i class="bi bi-list-ol"></i>
        </button>
        <button type="button" class="btn btn-outline-secondary"
          :class="{ active: editor.isActive('blockquote') }"
          @click="editor.chain().focus().toggleBlockquote().run()" title="Цитата">
          <i class="bi bi-quote"></i>
        </button>
        <button type="button" class="btn btn-outline-secondary"
          @click="editor.chain().focus().setHorizontalRule().run()" title="Разделитель">
          <i class="bi bi-hr"></i>
        </button>
        <button type="button" class="btn btn-outline-secondary"
          :class="{ active: editor.isActive('codeBlock') }"
          @click="editor.chain().focus().toggleCodeBlock().run()" title="Блок кода">
          <i class="bi bi-code-slash"></i>
        </button>
      </div>

      <div class="vr mx-1"></div>

      <div class="btn-group btn-group-sm">
        <button type="button" class="btn btn-outline-secondary" @click="setLink" title="Ссылка">
          <i class="bi bi-link-45deg"></i>
        </button>
        <button type="button" class="btn btn-outline-secondary" @click="addImage" title="Изображение">
          <i class="bi bi-image"></i>
        </button>
        <button type="button" class="btn btn-outline-secondary" @click="addVideo" title="Видео YouTube">
          <i class="bi bi-youtube"></i>
        </button>
      </div>

      <div class="vr mx-1"></div>

      <button type="button" class="btn btn-outline-secondary btn-sm"
        @click="editor.chain().focus().undo().run()" title="Отменить"
        :disabled="!editor.can().undo()">
        <i class="bi bi-arrow-counterclockwise"></i>
      </button>
      <button type="button" class="btn btn-outline-secondary btn-sm"
        @click="editor.chain().focus().redo().run()" title="Повторить"
        :disabled="!editor.can().redo()">
        <i class="bi bi-arrow-clockwise"></i>
      </button>
    </div>

    <EditorContent :editor="editor" class="tiptap-content" />
  </div>
</template>

<style>
.tiptap-editor {
  border-color: var(--border-color) !important;
}

.tiptap-editor .ProseMirror {
  min-height: 250px;
  padding: 1rem;
  outline: none;
  color: var(--text-primary);
}

.tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
  color: var(--text-muted);
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

.tiptap-editor .ProseMirror h2 { font-size: 1.5rem; font-weight: 700; margin: 1rem 0 0.5rem; }
.tiptap-editor .ProseMirror h3 { font-size: 1.25rem; font-weight: 600; margin: 0.75rem 0 0.5rem; }
.tiptap-editor .ProseMirror h4 { font-size: 1.1rem; font-weight: 600; margin: 0.5rem 0 0.25rem; }

.tiptap-editor .ProseMirror blockquote {
  border-left: 3px solid var(--primary);
  padding-left: 1rem;
  margin-left: 0;
  color: var(--text-secondary);
  background: var(--primary-50);
  border-radius: 0 8px 8px 0;
  padding: 0.5rem 1rem;
}

.tiptap-editor .ProseMirror pre {
  background: var(--text-primary);
  color: #e8e9f0;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  font-family: 'Fira Code', monospace;
}

.tiptap-editor .ProseMirror code {
  background: var(--primary-50);
  color: var(--primary);
  border-radius: 4px;
  padding: 0.15rem 0.3rem;
  font-size: 0.9em;
}

.tiptap-editor .ProseMirror pre code {
  background: none;
  color: inherit;
  padding: 0;
}

.tiptap-editor .ProseMirror img {
  max-width: 100%;
  height: auto;
  border-radius: 10px;
}

.tiptap-editor .ProseMirror hr {
  border: none;
  border-top: 1px solid var(--border-light);
  margin: 1.5rem 0;
}

.tiptap-editor .ProseMirror ul, .tiptap-editor .ProseMirror ol {
  padding-left: 1.5rem;
}

.tiptap-editor .ProseMirror a {
  color: var(--primary);
  text-decoration: underline;
}

.toolbar {
  background: var(--bg-warm) !important;
  border-color: var(--border-light) !important;
}

.toolbar .btn.active {
  background: linear-gradient(135deg, var(--primary), #8b7dff);
  border-color: var(--primary);
  color: white;
  box-shadow: 0 2px 6px rgba(108, 99, 255, 0.25);
}

.toolbar .btn:hover:not(.active) {
  background-color: var(--primary-light);
}

.toolbar .vr {
  background-color: var(--border-color);
}
</style>
