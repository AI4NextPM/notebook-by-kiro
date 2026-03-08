import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { NoteEditor } from '@/app/components/NoteEditor';
import { Note } from '@/app/lib/types';

const makeNote = (overrides: Partial<Note> = {}): Note => ({
  id: 'note-1',
  title: '测试标题',
  content: '测试内容',
  createdAt: '2024-06-01T10:00:00.000Z',
  updatedAt: '2024-06-15T14:30:00.000Z',
  ...overrides,
});

describe('NoteEditor', () => {
  /** Validates: Requirements 6.1 */

  it('shows placeholder text when note is null', () => {
    render(<NoteEditor note={null} onUpdateNote={vi.fn()} />);
    expect(screen.getByText(/选择或创建一条笔记/)).toBeInTheDocument();
  });

  it('shows title input and content textarea when note is provided', () => {
    const note = makeNote({ title: '我的笔记', content: '笔记内容' });
    render(<NoteEditor note={note} onUpdateNote={vi.fn()} />);

    const titleInput = screen.getByDisplayValue('我的笔记');
    const contentArea = screen.getByDisplayValue('笔记内容');
    expect(titleInput).toBeInTheDocument();
    expect(contentArea).toBeInTheDocument();
  });

  it('calls onUpdateNote with updated title when title input changes', async () => {
    const onUpdateNote = vi.fn();
    const note = makeNote({ id: 'edit-id', title: '', content: '原始内容' });
    render(<NoteEditor note={note} onUpdateNote={onUpdateNote} />);

    const titleInput = screen.getByRole('textbox', { name: /标题/i });
    await userEvent.type(titleInput, '新标题');

    // onUpdateNote should have been called with the note id and updated title
    expect(onUpdateNote).toHaveBeenCalled();
    const lastCall = onUpdateNote.mock.calls[onUpdateNote.mock.calls.length - 1];
    expect(lastCall[0]).toBe('edit-id');
    // The title in the last call should contain the typed text
    expect(lastCall[1]).toContain('新标题');
  });

  it('calls onUpdateNote with updated content when textarea changes', async () => {
    const onUpdateNote = vi.fn();
    const note = makeNote({ id: 'edit-id', title: '原始标题', content: '' });
    render(<NoteEditor note={note} onUpdateNote={onUpdateNote} />);

    const contentArea = screen.getByRole('textbox', { name: /内容/i });
    await userEvent.type(contentArea, '新内容');

    expect(onUpdateNote).toHaveBeenCalled();
    const lastCall = onUpdateNote.mock.calls[onUpdateNote.mock.calls.length - 1];
    expect(lastCall[0]).toBe('edit-id');
    // The content in the last call should contain the typed text
    expect(lastCall[2]).toContain('新内容');
  });
});
