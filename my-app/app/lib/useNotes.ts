'use client';

import { useState, useCallback, useMemo } from 'react';
import { Note } from './types';
import { loadNotes, saveNotes } from './noteStorage';

export interface UseNotesReturn {
  notes: Note[];
  selectedNoteId: string | null;
  selectedNote: Note | null;
  createNote: () => void;
  updateNote: (id: string, title: string, content: string) => void;
  deleteNote: (id: string) => void;
  selectNote: (id: string) => void;
}

function sortByUpdatedAtDesc(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : b.updatedAt < a.updatedAt ? -1 : 0));
}

export function useNotes(): UseNotesReturn {
  const [notes, setNotes] = useState<Note[]>(() => sortByUpdatedAtDesc(loadNotes()));
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const persist = useCallback((updated: Note[]) => {
    const sorted = sortByUpdatedAtDesc(updated);
    setNotes(sorted);
    saveNotes(sorted);
    return sorted;
  }, []);

  const createNote = useCallback(() => {
    const now = new Date().toISOString();
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: '',
      content: '',
      createdAt: now,
      updatedAt: now,
    };
    setNotes((prev) => {
      const updated = sortByUpdatedAtDesc([...prev, newNote]);
      saveNotes(updated);
      return updated;
    });
    setSelectedNoteId(newNote.id);
  }, []);

  const updateNote = useCallback((id: string, title: string, content: string) => {
    setNotes((prev) => {
      const updated = prev.map((n) =>
        n.id === id ? { ...n, title, content, updatedAt: new Date().toISOString() } : n
      );
      const sorted = sortByUpdatedAtDesc(updated);
      saveNotes(sorted);
      return sorted;
    });
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      saveNotes(updated);
      return updated;
    });
    setSelectedNoteId((prev) => (prev === id ? null : prev));
  }, []);

  const selectNote = useCallback((id: string) => {
    setSelectedNoteId(id);
  }, []);

  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedNoteId) ?? null,
    [notes, selectedNoteId]
  );

  return { notes, selectedNoteId, selectedNote, createNote, updateNote, deleteNote, selectNote };
}
