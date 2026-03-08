'use client';

import { Note } from '@/app/lib/types';
import styles from './NoteList.module.css';

interface NoteListProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onCreateNote: () => void;
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString();
}

export function NoteList({ notes, selectedNoteId, onSelectNote, onDeleteNote, onCreateNote }: NoteListProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.createButton} onClick={onCreateNote}>新建笔记</button>
      </div>
      {notes.length === 0 ? (
        <p className={styles.empty}>暂无笔记</p>
      ) : (
        <ul className={styles.list}>
          {notes.map((note) => {
            const isSelected = note.id === selectedNoteId;
            return (
              <li
                key={note.id}
                className={`${styles.item} ${isSelected ? styles.selected : ''}`}
                aria-selected={isSelected}
              >
                <div className={styles.noteContent} onClick={() => onSelectNote(note.id)}>
                  <span className={styles.title}>{note.title || '无标题'}</span>
                  <span className={styles.time}>{formatTime(note.updatedAt)}</span>
                </div>
                <button className={styles.deleteButton} onClick={() => onDeleteNote(note.id)}>删除</button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
