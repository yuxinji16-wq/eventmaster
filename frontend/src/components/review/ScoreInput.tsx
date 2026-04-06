import React from 'react';

interface ScoreInputProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
}

const ScoreInput: React.FC<ScoreInputProps> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm font-bold text-slate-600">{label}</span>
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(score => (
        <button
          key={score}
          type="button"
          onClick={() => onChange(score)}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            value >= score ? 'bg-amber-400 text-white' : 'bg-white text-slate-300 border border-slate-200'
          }`}
        >
          <span style={{ opacity: value >= score ? 1 : 0.3 }}>★</span>
        </button>
      ))}
      <span className="ml-2 font-black text-slate-700">{value}</span>
    </div>
  </div>
);

export default ScoreInput;
