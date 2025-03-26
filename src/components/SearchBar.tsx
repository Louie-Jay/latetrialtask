import React from 'react';
import { Search, Filter } from 'lucide-react';

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onFilterClick: () => void;
  placeholder?: string;
};

export default function SearchBar({
  value,
  onChange,
  onFilterClick,
  placeholder = "Search..."
}: SearchBarProps) {
  return (
    <div className="relative flex items-center">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder={placeholder}
          className="input-field pl-12 pr-12 w-full"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      <button
        onClick={onFilterClick}
        className="ml-2 p-3 glass-effect rounded-xl border border-gray-800/50 text-gray-400 hover:text-purple-400 transition-colors md:hidden"
      >
        <Filter className="h-5 w-5" />
      </button>
    </div>
  );
}