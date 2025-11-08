import React, { PropsWithChildren } from 'react';

interface ModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const Modal: React.FC<PropsWithChildren<ModalProps>> = ({ title, isOpen, onClose, children, size = 'md' }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className={`modal modal--${size}`}>
        <header className="modal__header">
          <h3>{title}</h3>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close dialog">
            ✕
          </button>
        </header>
        <div className="modal__content">{children}</div>
      </div>
    </div>
  );
};

export default Modal;

