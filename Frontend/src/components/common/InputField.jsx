import React from "react";

const InputField = ({ label, value, onChange, placeholder }) => {
  return (
    <div className="input-field">
      <label>{label}</label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
};

export default InputField;
