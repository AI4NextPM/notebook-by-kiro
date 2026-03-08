'use client';

import { useState } from 'react';
import { useNotes } from '@/app/lib/useNotes';
import { NoteList } from '@/app/components/NoteList';
import { NoteEditor } from '@/app/components/NoteEditor';
import { ConfirmDialog } from '@/app/components/ConfirmDialog';
import styles from './page.module.css';

export default function Home() {
  const { notes, selectedNoteId, selectedNote, createNote, updateNote, deleteNote, selectNote } = useNotes();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleDeleteRequest = (id: string) => {
    setDeleteTargetId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteTargetId) {
      deleteNote(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteTargetId(null);
  };

  return (
    <main className={styles.main}>
      <div className={styles.sidebar}>
        <NoteList
          notes={notes}
          selectedNoteId={selectedNoteId}
          onSelectNote={selectNote}
          onDeleteNote={handleDeleteRequest}
          onCreateNote={createNote}
        />
      </div>
      <div className={styles.editor}>
        <NoteEditor note={selectedNote} onUpdateNote={updateNote} />
      </div>
      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        message="确认删除这条笔记？"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </main>
  );
}
