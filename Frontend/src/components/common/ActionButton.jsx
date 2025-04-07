import React from "react";

const ActionButton = ({ label, onClick }) => {
  return <button onClick={onClick}>{label}</button>;
};

export default ActionButton;
