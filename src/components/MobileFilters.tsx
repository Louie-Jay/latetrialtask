import React from 'react';
import { X } from 'lucide-react';

type FilterOption = {
  label: string;
  value: string;
  icon?: React.ReactNode;
};

type MobileFiltersProps = {
  isOpen: boolean;
  onClose: () => void;
  onClearFilters: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterSections: {
    label: string;
    value: string;
    options: FilterOption[];
    icon?: React.ReactNode;
  }[];
  onFilterChange: (sectionValue: string, value: string) => void;
  selectedFilters: Record<string, string>;
};

export default function MobileFilters({
  isOpen,
  onClose,
  onClearFilters,
  searchValue,
  onSearchChange,
  filterSections,
  onFilterChange,
  selectedFilters
}: MobileFiltersProps) {
  return (
    <div
      className={`fixed inset-0 z-50 md:hidden transition-transform duration-300 ${
        isOpen ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 max-h-[90vh] overflow-y-auto glass-effect border-t border-gray-800/50 rounded-t-2xl">
        <div className="sticky top-0 glass-effect border-b border-gray-800/50 p-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Filters</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search..."
              className="input-field w-full"
            />
          </div>

          {/* Filter Sections */}
          {filterSections.map((section) => (
            <div key={section.value}>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {section.label}
              </label>
              <select
                value={selectedFilters[section.value] || ''}
                onChange={(e) => onFilterChange(section.value, e.target.value)}
                className="input-field w-full"
              >
                <option value="">All {section.label}</option>
                {section.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={onClearFilters}
              className="flex-1 secondary-button"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              className="flex-1 premium-button"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}