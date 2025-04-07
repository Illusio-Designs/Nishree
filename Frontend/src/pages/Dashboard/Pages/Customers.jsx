<<<<<<< HEAD
import React from 'react';
import TableWithControls from '../../../components/common/TableWithControls';  // Add this import
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
=======
import React from "react";
import TableWithControls from "../../../components/common/TableWithControls"; // Add this import
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import "../../../styles/Dashboard.css";
>>>>>>> 13ebd4d4074ee654cbf4bb75ade32d2b3ed5da9c

const Customers = () => {
  const columns = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <span className={`status-badge ${row.status.toLowerCase()}`}>
          {row.status}
        </span>
      ),
    },
  ];

  const actions = [
    {
      icon: <FaEye />,
      label: "View",
      onClick: (row) => console.log("View", row),
      className: "view-btn",
    },
    {
      icon: <FaEdit />,
      label: "Edit",
      onClick: (row) => console.log("Edit", row),
      className: "edit-btn",
    },
    {
      icon: <FaTrash />,
      label: "Delete",
      onClick: (row) => console.log("Delete", row),
      className: "delete-btn",
    },
  ];

  const sampleData = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      phone: "123-456-7890",
      status: "Active",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "234-567-8901",
      status: "Inactive",
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike@example.com",
      phone: "345-678-9012",
      status: "Active",
    },
    {
      id: 4,
      name: "Sarah Williams",
      email: "sarah@example.com",
      phone: "456-789-0123",
      status: "Active",
    },
    {
      id: 5,
      name: "Tom Brown",
      email: "tom@example.com",
      phone: "567-890-1234",
      status: "Inactive",
    },
  ];

  const filters = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
  ];

  return (
    <div className="customers">
      <h2 className="dashboard-title">Customers</h2>
      <TableWithControls
        columns={columns}
        data={sampleData}
        actions={actions}
        searchFields={["name", "email"]}
        filters={filters}
        itemsPerPage={10}
        onRowClick={(row) => console.log("Row clicked:", row)}
      />
    </div>
  );
};

export default Customers;
