import React from 'react';
import { ChevronDown } from 'lucide-react';

interface FilterDropdownProps {
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string }[];
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ value, onChange, options }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none border border-slate-200 rounded-xl pl-4 pr-10 py-2 text-sm font-bold outline-none cursor-pointer hover:border-indigo-300 bg-slate-50 text-slate-600"
    >
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
  </div>
);

export default FilterDropdown;
