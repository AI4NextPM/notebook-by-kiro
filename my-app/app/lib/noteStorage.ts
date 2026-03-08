import { Note, STORAGE_KEY } from './types';

export function saveNotes(notes: Note[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('Failed to save notes to localStorage:', error);
  }
}

function isValidNote(item: unknown): item is Note {
  if (typeof item !== 'object' || item === null) return false;
  const obj = item as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.content === 'string' &&
    typeof obj.createdAt === 'string' &&
    typeof obj.updatedAt === 'string'
  );
}

export function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.error('Invalid notes data: not an array');
      return [];
    }
    if (!parsed.every(isValidNote)) {
      console.error('Invalid notes data: items have invalid structure');
      return [];
    }
    return parsed;
  } catch (error) {
    console.error('Failed to load notes from localStorage:', error);
    return [];
  }
}
