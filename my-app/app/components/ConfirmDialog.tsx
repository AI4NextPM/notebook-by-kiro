'use client';

import styles from './ConfirmDialog.module.css';

interface ConfirmDialogProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ isOpen, message, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button className={styles.confirmButton} onClick={onConfirm}>确认</button>
          <button className={styles.cancelButton} onClick={onCancel}>取消</button>
        </div>
      </div>
    </div>
  );
}
