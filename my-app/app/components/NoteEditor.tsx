'use client';

import { useState, useEffect } from 'react';
import { Note } from '@/app/lib/types';
import styles from './NoteEditor.module.css';

interface NoteEditorProps {
  note: Note | null;
  onUpdateNote: (id: string, title: string, content: string) => void;
}

export function NoteEditor({ note, onUpdateNote }: NoteEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    setTitle(note?.title ?? '');
    setContent(note?.content ?? '');
  }, [note?.id, note?.title, note?.content]);

  if (!note) {
    return (
      <div className={styles.placeholder}>
        <p>选择或创建一条笔记</p>
      </div>
    );
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    onUpdateNote(note.id, newTitle, content);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onUpdateNote(note.id, title, newContent);
  };

  return (
    <div className={styles.editor}>
      <input
        className={styles.titleInput}
        type="text"
        aria-label="标题"
        value={title}
        onChange={handleTitleChange}
      />
      <textarea
        className={styles.contentArea}
        aria-label="内容"
        value={content}
        onChange={handleContentChange}
      />
    </div>
  );
}
