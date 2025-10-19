import React from "react";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import "../../css/styles.css";

const ActionButtons = ({ onView, onEdit, onDelete }) => {
  return (
    <div className="actions">
      <button className="action-btn view" title="View" onClick={onView}>
        <FaEye />
      </button>
      <button className="action-btn edit" title="Edit" onClick={onEdit}>
        <FaEdit />
      </button>
      <button className="action-btn delete" title="Delete" onClick={onDelete}>
        <FaTrash />
      </button>
    </div>
  );
};

export default ActionButtons;
