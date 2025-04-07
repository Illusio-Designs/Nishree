import React from "react";
import { FaEye, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaCheck, FaTimes } from "react-icons/fa";
import "../../Styles/common/ActionButton.css";

const ActionButton = ({ 
  icon, 
  onClick, 
  variant = "default",
  tooltip,
  disabled = false,
  size = "medium"
}) => {
  const getVariantStyles = () => {
    const variants = {
      view: "action-btn-view",
      edit: "action-btn-edit",
      delete: "action-btn-delete",
      active: "action-btn-active",
      inactive: "action-btn-inactive",
      approve: "action-btn-approve",
      reject: "action-btn-reject",
      default: "action-btn-default"
    };
    return variants[variant] || variants.default;
  };

  const getIcon = () => {
    if (icon) return icon;
    
    const icons = {
      view: <FaEye />,
      edit: <FaEdit />,
      delete: <FaTrash />,
      active: <FaToggleOn />,
      inactive: <FaToggleOff />,
      approve: <FaCheck />,
      reject: <FaTimes />
    };
    return icons[variant] || null;
  };

  return (
    <button
      className={`action-btn ${getVariantStyles()} action-btn-${size}`}
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
    >
      {getIcon()}
    </button>
  );
};

export default ActionButton;
