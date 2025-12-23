import React, { useState, useEffect } from "react";
import Table from "./Table";
import Pagination from "./Pagination";
import SearchBar from "./SearchBar";
import Filter from "./Filter";
import ActionButton from "./ActionButton";
import { useSearch } from "../../context/SearchContext";
import "../../styles/common/TableControls.css";

const TableWithControls = ({
  columns,
  data,
  itemsPerPage = 10,
  searchFields = [],
  filters = [],
  actions = [],
  onRowClick,
  hideLocalSearch = true, // Hide local search by default, use global search
}) => {
  const { searchQuery } = useSearch();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({});
  const [filteredData, setFilteredData] = useState([]);
  
  // Use global search query
  useEffect(() => {
    if (hideLocalSearch) {
      setSearchTerm(searchQuery);
    }
  }, [searchQuery, hideLocalSearch]);

  // Combined effect to handle data changes, filtering, and searching
  useEffect(() => {
    if (!Array.isArray(data)) {
      setFilteredData([]);
      return;
    }

    let result = [...data];

    // Apply search
    if (searchTerm && Array.isArray(searchFields) && searchFields.length > 0) {
      result = result.filter((item) =>
        searchFields.some(
          (field) =>
            field &&
            item &&
            item[field] &&
            String(item[field]).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply filters
    Object.entries(selectedFilters).forEach(([key, value]) => {
      if (value) {
        result = result.filter(
          (item) => String(item[key] || "") === String(value)
        );
      }
    });

    setFilteredData(result);
  }, [data, searchTerm, selectedFilters]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleFilterChange = (key, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const renderActions = (row) => {
    return (
      <div className="table-actions">
        {actions.map((action, index) => (
          <ActionButton
            key={index}
            variant={action.variant}
            icon={action.icon}
            onClick={() => action.onClick(row)}
            tooltip={action.tooltip}
            disabled={action.disabled?.(row)}
            size={action.size || "small"}
          />
        ))}
      </div>
    );
  };

  // Add serial number column and actions column if needed
  const enhancedColumns = [
    {
      key: "serial",
      header: "S.No.",
      render: (row, index) => {
        // Calculate the actual index in the filtered data
        const actualIndex = filteredData.findIndex((item) => item === row);
        return actualIndex + 1;
      },
      width: "80px",
      align: "center",
    },
    ...columns,
    ...(actions?.length > 0
      ? [
          {
            key: "actions",
            header: "Actions",
            render: (row) => renderActions(row),
            width: "120px",
            align: "center",
          },
        ]
      : []),
  ];

  return (
    <div className="table-with-controls">
      {(!hideLocalSearch || filters.length > 0) && (
        <div className="table-controls">
          {!hideLocalSearch && (
            <div className="controls-left">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search..."
              />
            </div>
          )}
          {filters.length > 0 && (
            <div className={hideLocalSearch ? "controls-full" : "controls-right"}>
              <Filter
                filters={filters}
                selectedFilters={selectedFilters}
                onChange={handleFilterChange}
              />
            </div>
          )}
        </div>
      )}

      <Table
        columns={enhancedColumns}
        data={paginatedData}
        onRowClick={onRowClick}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default TableWithControls;
