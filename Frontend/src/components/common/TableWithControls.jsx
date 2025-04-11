import React, { useState, useEffect } from 'react';
import Table from './Table';
import Pagination from './Pagination';
import SearchBar from './SearchBar';
import Filter from './Filter';
import ActionButton from './ActionButton';
import "../../Styles/common/TableControls.css";

const TableWithControls = ({
  columns,
  data,
  itemsPerPage = 10,
  searchFields = [],
  filters = [],
  actions = [],
  onRowClick
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({});
  const [filteredData, setFilteredData] = useState([]);

  // Combined effect to handle data changes, filtering, and searching
  useEffect(() => {
    if (!Array.isArray(data)) {
      setFilteredData([]);
      return;
    }
    
    let result = [...data];

    // Apply search
    if (searchTerm && Array.isArray(searchFields) && searchFields.length > 0) {
      result = result.filter(item =>
        searchFields.some(field =>
          field && item && item[field] && String(item[field]).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply filters
    Object.entries(selectedFilters).forEach(([key, value]) => {
      if (value) {
        result = result.filter(item => String(item[key] || '') === String(value));
      }
    });

    setFilteredData(result);
  }, [data, searchTerm, selectedFilters]); // Removed searchFields from dependency array

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleFilterChange = (key, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [key]: value
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

  const enhancedColumns = actions?.length > 0 
    ? [...columns, { 
        key: 'actions', 
        header: 'Actions',
        render: (row) => renderActions(row)
      }] 
    : columns;

  return (
    <div className="table-with-controls">
      <div className="table-controls">
        <div className="controls-left">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search..."
          />
        </div>
        <div className="controls-right">
          <Filter
            filters={filters}
            selectedFilters={selectedFilters}
            onChange={handleFilterChange}
          />
        </div>
      </div>

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