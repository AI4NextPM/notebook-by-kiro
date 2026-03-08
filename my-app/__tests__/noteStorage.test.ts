import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveNotes, loadNotes } from '@/app/lib/noteStorage';
import { Note, STORAGE_KEY } from '@/app/lib/types';

function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: crypto.randomUUID(),
    title: 'Test Note',
    content: 'Some content',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('noteStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('saveNotes', () => {
    it('should save an empty array', () => {
      saveNotes([]);
      expect(localStorage.getItem(STORAGE_KEY)).toBe('[]');
    });

    it('should save notes as JSON', () => {
      const notes = [makeNote({ id: '1', title: 'A' })];
      saveNotes(notes);
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe('1');
      expect(stored[0].title).toBe('A');
    });

    it('should overwrite previous data', () => {
      saveNotes([makeNote({ id: '1' })]);
      saveNotes([makeNote({ id: '2' })]);
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe('2');
    });

    it('should not throw when localStorage is unavailable', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });
      expect(() => saveNotes([makeNote()])).not.toThrow();
    });

    it('should log error when localStorage throws', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
      saveNotes([makeNote()]);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('loadNotes', () => {
    it('should return empty array when no data exists', () => {
      expect(loadNotes()).toEqual([]);
    });

    it('should load saved notes', () => {
      const notes = [makeNote({ id: 'abc', title: 'Hello' })];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
      const loaded = loadNotes();
      expect(loaded).toHaveLength(1);
      expect(loaded[0].id).toBe('abc');
      expect(loaded[0].title).toBe('Hello');
    });

    it('should return empty array for invalid JSON', () => {
      localStorage.setItem(STORAGE_KEY, 'not-json{{{');
      expect(loadNotes()).toEqual([]);
    });

    it('should return empty array for non-array JSON', () => {
      localStorage.setItem(STORAGE_KEY, '{"not":"array"}');
      expect(loadNotes()).toEqual([]);
    });

    it('should return empty array when items are missing required fields', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([{ id: '1' }]));
      expect(loadNotes()).toEqual([]);
    });

    it('should return empty array when field types are wrong', () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([{ id: 1, title: 2, content: 3, createdAt: 4, updatedAt: 5 }])
      );
      expect(loadNotes()).toEqual([]);
    });

    it('should log error for invalid data', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      localStorage.setItem(STORAGE_KEY, 'bad');
      loadNotes();
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should return empty array when localStorage is unavailable', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });
      expect(loadNotes()).toEqual([]);
    });
  });
});
