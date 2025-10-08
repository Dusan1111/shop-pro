import "./remove-button.scss";
import React from "react";

export const RemoveButtonComponent = ({ content, remove }) => {
  return (
    <div className="remove_button_wrapper">
    <button className="remove_button" onClick={remove}>
      {content}
    </button>
    </div>
  );
};

export default RemoveButtonComponent;