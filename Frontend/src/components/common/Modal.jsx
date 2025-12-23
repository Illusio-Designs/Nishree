import React from 'react';
import Button from './Button';
import { IoClose } from 'react-icons/io5';
import '../../styles/common/Modal.css';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{title}</h2>
          <Button 
            onClick={onClose}
            className="modal-close-button"
          >
            <IoClose size={24} />
          </Button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;