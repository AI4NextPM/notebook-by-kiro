export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export const STORAGE_KEY = 'notepad-app-notes';
