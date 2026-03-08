import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ConfirmDialog } from '@/app/components/ConfirmDialog';

describe('ConfirmDialog', () => {
  /** Validates: Requirements 3.1 */

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ConfirmDialog
        isOpen={false}
        message="确认删除？"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders the dialog with the message when isOpen is true', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        message="确认删除这条笔记？"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText('确认删除这条笔记？')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', async () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        isOpen={true}
        message="确认删除？"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: /确认|确定/i }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        isOpen={true}
        message="确认删除？"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: /取消/i }));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
