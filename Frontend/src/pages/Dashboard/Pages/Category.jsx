import React, { useEffect, useState } from "react";
import {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} from "../../../services/categoryService";
import TableWithControls from "../../../components/common/TableWithControls";
import InputField from "../../../components/common/InputField";
import ActionButton from "../../../components/common/ActionButton";
import Filter from "../../../components/common/Filter";
import "../../../Styles/Category.css";
import { FaPlus } from "react-icons/fa";
import Button from "../../../components/common/Button";

const CategoryManagerWithPopup = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleCreateCategory = async () => {
    try {
      const createdCategory = await createCategory(newCategory);
      setCategories([...categories, createdCategory]);
      setNewCategory({ name: "", description: "" }); // Reset form
      setShowPopup(false); // Close popup
    } catch (error) {
      console.error("Failed to create category:", error);
    }
  };

  const columns = [
    { key: "name", header: "Category Name" },
    { key: "description", header: "Description" },
  ];

  const filters = [
    { key: "name", label: "Category Name", options: [] }, // Add options if needed
  ];

  const handleClick = () => {
    // Handle button click
  };

  return (
    <div>
      <h2 className="dashboard-title">Category Manager</h2>
      <Button onClick={handleClick} className="add-button">
        <FaPlus /> Add Category
      </Button>
      {showPopup && (
        <div className="popup">
          <h2>Add New Category</h2>
          <InputField
            label="Category Name"
            value={newCategory.name}
            onChange={(e) =>
              setNewCategory({ ...newCategory, name: e.target.value })
            }
            placeholder="Enter category name"
          />
          <InputField
            label="Description"
            value={newCategory.description}
            onChange={(e) =>
              setNewCategory({ ...newCategory, description: e.target.value })
            }
            placeholder="Enter description"
          />
          <ActionButton label="Create" onClick={handleCreateCategory} />
          <ActionButton label="Cancel" onClick={() => setShowPopup(false)} />
        </div>
      )}
      <TableWithControls
        columns={columns}
        data={categories}
        filters={filters}
        searchFields={["name", "description"]}
      />
    </div>
  );
};

export default CategoryManagerWithPopup;
