import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import fc from 'fast-check';
import { useNotes } from '@/app/lib/useNotes';
import { Note, STORAGE_KEY } from '@/app/lib/types';

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


// --- Property-based tests for useNotes Hook ---

describe('useNotes property tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  /**
   * Feature: notepad-app, Property 1: 创建笔记的结构不变量
   * For any number of createNote calls, each new note should have a UUID, empty title/content,
   * and valid ISO 8601 timestamps.
   * Validates: Requirements 1.1, 1.2, 1.3
   */
  it('Feature: notepad-app, Property 1: 创建笔记的结构不变量', () => {
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        (count) => {
          localStorage.clear();
          const { result } = renderHook(() => useNotes());
          const beforeLength = result.current.notes.length;

          for (let i = 0; i < count; i++) {
            act(() => result.current.createNote());
          }

          // List length increased by count
          expect(result.current.notes).toHaveLength(beforeLength + count);

          // Verify each note has correct structure
          for (const note of result.current.notes) {
            // UUID format
            expect(note.id).toMatch(UUID_REGEX);
            // Empty title and content
            expect(note.title).toBe('');
            expect(note.content).toBe('');
            // Valid ISO 8601 timestamps
            expect(new Date(note.createdAt).toISOString()).toBe(note.createdAt);
            expect(new Date(note.updatedAt).toISOString()).toBe(note.updatedAt);
          }

          // All IDs are unique
          const ids = result.current.notes.map((n) => n.id);
          expect(new Set(ids).size).toBe(ids.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: notepad-app, Property 2: 编辑笔记的持久化与时间戳更新
   * For any existing note and any valid new title/content, after updateNote the fields
   * should match and updatedAt should be >= the previous value.
   * Validates: Requirements 2.1, 2.2
   */
  it('Feature: notepad-app, Property 2: 编辑笔记的持久化与时间戳更新', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 100 }),
        fc.string({ minLength: 0, maxLength: 200 }),
        (newTitle, newContent) => {
          localStorage.clear();
          const { result } = renderHook(() => useNotes());

          // Create a note first
          act(() => result.current.createNote());
          const id = result.current.notes[0].id;
          const oldUpdatedAt = result.current.notes[0].updatedAt;

          // Update with random title/content
          act(() => result.current.updateNote(id, newTitle, newContent));

          const updated = result.current.notes.find((n) => n.id === id)!;
          expect(updated).toBeDefined();
          expect(updated.title).toBe(newTitle);
          expect(updated.content).toBe(newContent);
          // updatedAt should be >= old value
          expect(updated.updatedAt >= oldUpdatedAt).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: notepad-app, Property 3: 选择笔记加载正确数据
   * For any note in the list, after selectNote, selectedNote should return the complete
   * and consistent Note object.
   * Validates: Requirements 2.3
   */
  it('Feature: notepad-app, Property 3: 选择笔记加载正确数据', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 8 }),
        fc.nat(),
        (noteCount, indexSeed) => {
          localStorage.clear();
          const { result } = renderHook(() => useNotes());

          // Create multiple notes
          for (let i = 0; i < noteCount; i++) {
            act(() => result.current.createNote());
          }

          // Pick a random note to select
          const targetIndex = indexSeed % result.current.notes.length;
          const targetNote = result.current.notes[targetIndex];

          act(() => result.current.selectNote(targetNote.id));

          const selected = result.current.selectedNote;
          expect(selected).not.toBeNull();
          expect(selected!.id).toBe(targetNote.id);
          expect(selected!.title).toBe(targetNote.title);
          expect(selected!.content).toBe(targetNote.content);
          expect(selected!.createdAt).toBe(targetNote.createdAt);
          expect(selected!.updatedAt).toBe(targetNote.updatedAt);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: notepad-app, Property 4: 删除笔记从列表中移除
   * For any list with at least one note, deleting a note should reduce the list length by 1
   * and the deleted id should no longer be present. If the deleted note was selected,
   * selectedNoteId should become null.
   * Validates: Requirements 3.2, 3.3
   */
  it('Feature: notepad-app, Property 4: 删除笔记从列表中移除', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 8 }),
        fc.nat(),
        fc.boolean(),
        (noteCount, indexSeed, deleteSelected) => {
          localStorage.clear();
          const { result } = renderHook(() => useNotes());

          // Create multiple notes
          for (let i = 0; i < noteCount; i++) {
            act(() => result.current.createNote());
          }

          const lengthBefore = result.current.notes.length;

          // Decide which note to delete
          let targetIndex: number;
          if (deleteSelected && result.current.selectedNoteId) {
            // Delete the currently selected note
            targetIndex = result.current.notes.findIndex(
              (n) => n.id === result.current.selectedNoteId
            );
          } else {
            targetIndex = indexSeed % result.current.notes.length;
            // Select a different note if possible to test non-selected deletion
            const otherId = result.current.notes.find(
              (n) => n.id !== result.current.notes[targetIndex].id
            )?.id;
            if (otherId) {
              act(() => result.current.selectNote(otherId));
            }
          }

          const targetId = result.current.notes[targetIndex].id;
          const wasSelected = result.current.selectedNoteId === targetId;

          act(() => result.current.deleteNote(targetId));

          // Length decreased by 1
          expect(result.current.notes).toHaveLength(lengthBefore - 1);
          // Deleted id is no longer in the list
          expect(result.current.notes.find((n) => n.id === targetId)).toBeUndefined();

          // If deleted note was selected, selectedNoteId should be null
          if (wasSelected) {
            expect(result.current.selectedNoteId).toBeNull();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: notepad-app, Property 5: 笔记列表按修改时间降序排列
   * For any list of notes, the notes array should be sorted by updatedAt descending.
   * Validates: Requirements 4.2
   */
  it('Feature: notepad-app, Property 5: 笔记列表按修改时间降序排列', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 8 }),
        fc.array(fc.string({ minLength: 0, maxLength: 50 }), { minLength: 0, maxLength: 5 }),
        (noteCount, updateTitles) => {
          localStorage.clear();
          const { result } = renderHook(() => useNotes());

          // Create multiple notes
          for (let i = 0; i < noteCount; i++) {
            act(() => result.current.createNote());
          }

          // Optionally update some notes to shuffle timestamps
          for (const title of updateTitles) {
            if (result.current.notes.length > 0) {
              const idx = Math.abs(title.length) % result.current.notes.length;
              const id = result.current.notes[idx].id;
              act(() => result.current.updateNote(id, title, ''));
            }
          }

          // Verify descending order by updatedAt
          const notes = result.current.notes;
          for (let i = 0; i < notes.length - 1; i++) {
            expect(notes[i].updatedAt >= notes[i + 1].updatedAt).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
