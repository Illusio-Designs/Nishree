import React from 'react';

const Filter = ({ filters, selectedFilters, onChange }) => {
  return (
    <div className="filter-container">
      {filters.map(filter => (
        <div key={filter.key} className="filter-group">
          <label>{filter.label}</label>
          <select
            value={selectedFilters[filter.key] || ''}
            onChange={(e) => onChange(filter.key, e.target.value)}
            className="filter-select"
          >
            <option value="">All</option>
            {filter.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
};

export default Filter;