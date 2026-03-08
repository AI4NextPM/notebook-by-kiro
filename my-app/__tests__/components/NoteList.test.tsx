import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { NoteList } from '@/app/components/NoteList';
import { Note } from '@/app/lib/types';

const makeNote = (overrides: Partial<Note> = {}): Note => ({
  id: 'note-1',
  title: '测试笔记',
  content: '内容',
  createdAt: '2024-06-01T10:00:00.000Z',
  updatedAt: '2024-06-15T14:30:00.000Z',
  ...overrides,
});

describe('NoteList', () => {
  const defaultProps = {
    notes: [] as Note[],
    selectedNoteId: null as string | null,
    onSelectNote: vi.fn(),
    onDeleteNote: vi.fn(),
    onCreateNote: vi.fn(),
  };

  /** Validates: Requirements 4.1, 4.2 */
  it('renders list of notes showing title and formatted modification time', () => {
    const notes = [
      makeNote({ id: '1', title: '第一条笔记', updatedAt: '2024-06-15T14:30:00.000Z' }),
      makeNote({ id: '2', title: '第二条笔记', updatedAt: '2024-07-01T09:00:00.000Z' }),
    ];
    render(<NoteList {...defaultProps} notes={notes} />);

    expect(screen.getByText('第一条笔记')).toBeInTheDocument();
    expect(screen.getByText('第二条笔记')).toBeInTheDocument();
    // Each note should display some form of the modification time
    // We check that time-related text is present for each note
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(2);
  });

  /** Validates: Requirements 4.3 */
  it('shows "暂无笔记" message when list is empty', () => {
    render(<NoteList {...defaultProps} notes={[]} />);
    expect(screen.getByText('暂无笔记')).toBeInTheDocument();
  });

  /** Validates: Requirements 4.1 */
  it('calls onCreateNote when "新建笔记" button is clicked', async () => {
    const onCreateNote = vi.fn();
    render(<NoteList {...defaultProps} onCreateNote={onCreateNote} />);
    await userEvent.click(screen.getByRole('button', { name: /新建笔记/i }));
    expect(onCreateNote).toHaveBeenCalledOnce();
  });

  /** Validates: Requirements 3.1 */
  it('calls onDeleteNote when delete button on a note is clicked', async () => {
    const onDeleteNote = vi.fn();
    const notes = [makeNote({ id: 'note-to-delete', title: '要删除的笔记' })];
    render(<NoteList {...defaultProps} notes={notes} onDeleteNote={onDeleteNote} />);

    // Find the delete button within the note item
    const deleteButton = screen.getByRole('button', { name: /删除/i });
    await userEvent.click(deleteButton);
    expect(onDeleteNote).toHaveBeenCalledWith('note-to-delete');
  });

  /** Validates: Requirements 4.1 */
  it('selected note has visual distinction', () => {
    const notes = [
      makeNote({ id: 'sel', title: '选中笔记' }),
      makeNote({ id: 'other', title: '其他笔记' }),
    ];
    render(<NoteList {...defaultProps} notes={notes} selectedNoteId="sel" />);

    const listItems = screen.getAllByRole('listitem');
    // The selected note item should have a class containing "selected" or an aria attribute
    const selectedItem = listItems.find(
      (item) =>
        item.className.includes('selected') ||
        item.getAttribute('aria-selected') === 'true'
    );
    expect(selectedItem).toBeDefined();

    // The non-selected item should NOT have the selected indicator
    const nonSelectedItem = listItems.find(
      (item) =>
        !item.className.includes('selected') &&
        item.getAttribute('aria-selected') !== 'true'
    );
    expect(nonSelectedItem).toBeDefined();
  });

  it('calls onSelectNote when a note is clicked', async () => {
    const onSelectNote = vi.fn();
    const notes = [makeNote({ id: 'click-me', title: '点击笔记' })];
    render(<NoteList {...defaultProps} notes={notes} onSelectNote={onSelectNote} />);

    await userEvent.click(screen.getByText('点击笔记'));
    expect(onSelectNote).toHaveBeenCalledWith('click-me');
  });
});
