import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNotes } from '@/app/lib/useNotes';
import { STORAGE_KEY } from '@/app/lib/types';

describe('useNotes', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should start with empty notes when localStorage is empty', () => {
      const { result } = renderHook(() => useNotes());
      expect(result.current.notes).toEqual([]);
      expect(result.current.selectedNoteId).toBeNull();
      expect(result.current.selectedNote).toBeNull();
    });

    it('should load notes from localStorage on mount', () => {
      const stored = [
        {
          id: '1',
          title: 'Saved',
          content: 'Content',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      const { result } = renderHook(() => useNotes());
      expect(result.current.notes).toHaveLength(1);
      expect(result.current.notes[0].title).toBe('Saved');
    });
  });

  describe('createNote', () => {
    it('should add a new note with empty title and content', () => {
      const { result } = renderHook(() => useNotes());
      act(() => result.current.createNote());
      expect(result.current.notes).toHaveLength(1);
      expect(result.current.notes[0].title).toBe('');
      expect(result.current.notes[0].content).toBe('');
    });

    it('should generate a UUID for the new note', () => {
      const { result } = renderHook(() => useNotes());
      act(() => result.current.createNote());
      expect(result.current.notes[0].id).toBeTruthy();
      // UUID v4 format check
      expect(result.current.notes[0].id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    it('should set valid ISO timestamps on creation', () => {
      const { result } = renderHook(() => useNotes());
      act(() => result.current.createNote());
      const note = result.current.notes[0];
      expect(new Date(note.createdAt).toISOString()).toBe(note.createdAt);
      expect(new Date(note.updatedAt).toISOString()).toBe(note.updatedAt);
    });

    it('should auto-select the newly created note', () => {
      const { result } = renderHook(() => useNotes());
      act(() => result.current.createNote());
      expect(result.current.selectedNoteId).toBe(result.current.notes[0].id);
      expect(result.current.selectedNote).toEqual(result.current.notes[0]);
    });

    it('should persist to localStorage after creation', () => {
      const { result } = renderHook(() => useNotes());
      act(() => result.current.createNote());
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(stored).toHaveLength(1);
    });
  });

  describe('updateNote', () => {
    it('should update title and content of an existing note', () => {
      const { result } = renderHook(() => useNotes());
      act(() => result.current.createNote());
      const id = result.current.notes[0].id;
      act(() => result.current.updateNote(id, 'New Title', 'New Content'));
      expect(result.current.notes[0].title).toBe('New Title');
      expect(result.current.notes[0].content).toBe('New Content');
    });

    it('should update the updatedAt timestamp', () => {
      const { result } = renderHook(() => useNotes());
      act(() => result.current.createNote());
      const id = result.current.notes[0].id;
      const oldUpdatedAt = result.current.notes[0].updatedAt;
      // Small delay to ensure timestamp differs
      act(() => result.current.updateNote(id, 'T', 'C'));
      expect(result.current.notes[0].updatedAt >= oldUpdatedAt).toBe(true);
    });

    it('should persist changes to localStorage', () => {
      const { result } = renderHook(() => useNotes());
      act(() => result.current.createNote());
      const id = result.current.notes[0].id;
      act(() => result.current.updateNote(id, 'Saved Title', 'Saved Content'));
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(stored[0].title).toBe('Saved Title');
    });

    it('should not modify other notes', () => {
      const { result } = renderHook(() => useNotes());
      act(() => result.current.createNote());
      act(() => result.current.createNote());
      const firstId = result.current.notes[1].id; // older note is at index 1 after sort
      const secondId = result.current.notes[0].id;
      act(() => result.current.updateNote(secondId, 'Updated', 'Updated'));
      const firstNote = result.current.notes.find((n) => n.id === firstId)!;
      expect(firstNote.title).toBe('');
    });
  });

  describe('deleteNote', () => {
    it('should remove the note from the list', () => {
      const { result } = renderHook(() => useNotes());
      act(() => result.current.createNote());
      const id = result.current.notes[0].id;
      act(() => result.current.deleteNote(id));
      expect(result.current.notes).toHaveLength(0);
    });

    it('should clear selectedNoteId if the deleted note was selected', () => {
      const { result } = renderHook(() => useNotes());
      act(() => result.current.createNote());
      const id = result.current.notes[0].id;
      expect(result.current.selectedNoteId).toBe(id);
      act(() => result.current.deleteNote(id));
      expect(result.current.selectedNoteId).toBeNull();
      expect(result.current.selectedNote).toBeNull();
    });

    it('should not clear selectedNoteId if a different note was deleted', () => {
      const { result } = renderHook(() => useNotes());
      act(() => result.current.createNote());
      act(() => result.current.createNote());
      const selectedId = result.current.selectedNoteId!;
      const otherId = result.current.notes.find((n) => n.id !== selectedId)!.id;
      act(() => result.current.deleteNote(otherId));
      expect(result.current.selectedNoteId).toBe(selectedId);
    });

    it('should persist deletion to localStorage', () => {
      const { result } = renderHook(() => useNotes());
      act(() => result.current.createNote());
      const id = result.current.notes[0].id;
      act(() => result.current.deleteNote(id));
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(stored).toHaveLength(0);
    });
  });

  describe('selectNote', () => {
    it('should set selectedNoteId and selectedNote', () => {
      const { result } = renderHook(() => useNotes());
      act(() => result.current.createNote());
      act(() => result.current.createNote());
      const targetId = result.current.notes[1].id;
      act(() => result.current.selectNote(targetId));
      expect(result.current.selectedNoteId).toBe(targetId);
      expect(result.current.selectedNote!.id).toBe(targetId);
    });

    it('should return the full note object as selectedNote', () => {
      const { result } = renderHook(() => useNotes());
      act(() => result.current.createNote());
      const id = result.current.notes[0].id;
      act(() => result.current.updateNote(id, 'Title', 'Content'));
      act(() => result.current.selectNote(id));
      const selected = result.current.selectedNote!;
      expect(selected.title).toBe('Title');
      expect(selected.content).toBe('Content');
      expect(selected.createdAt).toBeTruthy();
      expect(selected.updatedAt).toBeTruthy();
    });
  });

  describe('sorting', () => {
    it('should sort notes by updatedAt descending', () => {
      // Seed localStorage with notes that have distinct timestamps
      const stored = [
        {
          id: 'old',
          title: 'Old',
          content: '',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'mid',
          title: 'Mid',
          content: '',
          createdAt: '2024-06-01T00:00:00.000Z',
          updatedAt: '2024-06-01T00:00:00.000Z',
        },
        {
          id: 'new',
          title: 'New',
          content: '',
          createdAt: '2024-12-01T00:00:00.000Z',
          updatedAt: '2024-12-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      const { result } = renderHook(() => useNotes());
      expect(result.current.notes[0].id).toBe('new');
      expect(result.current.notes[1].id).toBe('mid');
      expect(result.current.notes[2].id).toBe('old');

      // Update the oldest note — it should move to the top
      act(() => result.current.updateNote('old', 'Now newest', ''));
      expect(result.current.notes[0].id).toBe('old');
    });
  });
});
