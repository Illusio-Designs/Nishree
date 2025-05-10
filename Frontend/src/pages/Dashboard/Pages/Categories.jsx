import React, { useState } from "react";
import { HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import { ActionButton } from "../../components/ActionButton";

const Categories = () => {
  const columns = [
    { key: "name", header: "Name" },
    { key: "slug", header: "Slug" },
    {
      key: "parent",
      header: "Parent Category",
      render: (row) => row.parent?.name || "None",
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <span className={`status-badge ${row.status}`}>{row.status}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="action-buttons">
          <ActionButton
            icon={<HiOutlinePencil size={20} />}
            onClick={() => handleOpenModal("edit", row)}
            variant="edit"
            tooltip="Edit Category"
          />
          <ActionButton
            icon={<HiOutlineTrash size={20} />}
            onClick={() => handleDelete(row.id)}
            variant="delete"
            tooltip="Delete Category"
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Render your table component here */}
    </div>
  );
};

export default Categories; 